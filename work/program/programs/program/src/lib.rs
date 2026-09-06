use anchor_lang::prelude::*;
use anchor_spl::token::{self, transfer_checked, Mint, Token, TokenAccount, TransferChecked};
use mpl_core::{
    accounts::{BaseAssetV1, BaseCollectionV1},
    instructions::{CreateV2CpiBuilder, UpdateV1CpiBuilder},
};

declare_id!("2P9ehfkHUgght4YmW43YG1vEqFatKa3zKAkaV5ona7wo");

#[program]
pub mod ipo_program {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        treasury: Pubkey,
        metadata_base_uri: String,
    ) -> Result<()> {
        require!(treasury != Pubkey::default(), ErrorCode::InvalidTreasury);
        require!(
            metadata_base_uri.starts_with("https://")
                && metadata_base_uri.len() <= MAX_METADATA_BASE_URI,
            ErrorCode::InvalidMetadataUri
        );
        require_keys_eq!(
            *ctx.accounts.core_collection.owner,
            mpl_core::ID,
            ErrorCode::InvalidCollection
        );
        require_keys_eq!(
            ctx.accounts.ipo_vault.owner,
            ctx.accounts.config.key(),
            ErrorCode::InvalidVault
        );

        let collection_data = ctx.accounts.core_collection.try_borrow_data()?;
        let collection = BaseCollectionV1::from_bytes(&collection_data)
            .map_err(|_| error!(ErrorCode::InvalidCollection))?;
        require_keys_eq!(
            collection.update_authority,
            ctx.accounts.config.key(),
            ErrorCode::InvalidCollectionAuthority
        );
        drop(collection_data);

        let config = &mut ctx.accounts.config;
        config.authority = ctx.accounts.authority.key();
        config.treasury = treasury;
        config.ipo_mint = ctx.accounts.ipo_mint.key();
        config.ipo_vault = ctx.accounts.ipo_vault.key();
        config.core_collection = ctx.accounts.core_collection.key();
        config.metadata_base_uri = metadata_base_uri;
        config.total_supply = TOTAL_SUPPLY;
        config.minted = 0;
        config.mint_price_lamports = MINT_PRICE_LAMPORTS;
        config.ipo_price_tokens = IPO_MINT_PRICE_TOKENS;
        config.paused = false;
        config.bump = ctx.bumps.config;

        emit!(ConfigInitialized {
            authority: config.authority,
            treasury,
            ipo_mint: config.ipo_mint,
            ipo_vault: config.ipo_vault,
            core_collection: config.core_collection,
            total_supply: config.total_supply,
            mint_price_lamports: config.mint_price_lamports,
            ipo_price_tokens: config.ipo_price_tokens,
        });
        Ok(())
    }

    pub fn set_pause(ctx: Context<Admin>, paused: bool) -> Result<()> {
        ctx.accounts.config.paused = paused;
        emit!(PauseSet { paused });
        Ok(())
    }

    pub fn mint_desk(ctx: Context<MintDesk>, serial: u16) -> Result<()> {
        let config = &ctx.accounts.config;
        require!(!config.paused, ErrorCode::MintPaused);
        require!(config.minted < TOTAL_SUPPLY, ErrorCode::SoldOut);
        require!(serial == config.minted + 1, ErrorCode::InvalidSerial);
        validate_launch_accounts(
            config,
            &ctx.accounts.treasury,
            &ctx.accounts.ipo_mint,
            &ctx.accounts.ipo_vault,
            &ctx.accounts.core_collection,
        )?;

        let raw_ipo_amount =
            whole_token_amount(IPO_MINT_PRICE_TOKENS, ctx.accounts.ipo_mint.decimals)?;
        let stock = Stock::for_serial(serial);
        let name = format!("IPO Floor {} #{:03}", stock.ticker(), serial);
        let uri = metadata_uri(&config.metadata_base_uri, stock, serial, 0);
        let authority = config.authority;
        let config_bump = [config.bump];
        let signer_seeds: &[&[u8]] = &[CONFIG_SEED, authority.as_ref(), &config_bump];

        transfer_sol(
            &ctx.accounts.buyer,
            &ctx.accounts.treasury,
            MINT_PRICE_LAMPORTS,
        )?;
        transfer_ipo(
            ctx.accounts.transfer_ipo_context(),
            raw_ipo_amount,
            ctx.accounts.ipo_mint.decimals,
        )?;

        CreateV2CpiBuilder::new(&ctx.accounts.mpl_core_program.to_account_info())
            .asset(&ctx.accounts.asset.to_account_info())
            .collection(Some(&ctx.accounts.core_collection.to_account_info()))
            .authority(Some(&ctx.accounts.config.to_account_info()))
            .payer(&ctx.accounts.buyer.to_account_info())
            .owner(Some(&ctx.accounts.buyer.to_account_info()))
            .system_program(&ctx.accounts.system_program.to_account_info())
            .name(name)
            .uri(uri)
            .invoke_signed(&[signer_seeds])?;

        ctx.accounts.config.minted = serial;
        let desk = &mut ctx.accounts.desk;
        desk.asset = ctx.accounts.asset.key();
        desk.original_owner = ctx.accounts.buyer.key();
        desk.serial = serial;
        desk.stock = stock;
        desk.level = 0;
        desk.minted_at = Clock::get()?.unix_timestamp;
        desk.bump = ctx.bumps.desk;

        emit!(DeskMinted {
            owner: ctx.accounts.buyer.key(),
            asset: desk.asset,
            serial,
            stock,
            sol_paid: MINT_PRICE_LAMPORTS,
            ipo_locked_raw: raw_ipo_amount,
        });
        Ok(())
    }

    pub fn upgrade_desk(ctx: Context<UpgradeDesk>) -> Result<()> {
        require!(!ctx.accounts.config.paused, ErrorCode::MintPaused);
        let level = ctx.accounts.desk.level;
        require!(level < MAX_UPGRADE_LEVEL, ErrorCode::MaxLevel);
        validate_launch_accounts(
            &ctx.accounts.config,
            &ctx.accounts.treasury,
            &ctx.accounts.ipo_mint,
            &ctx.accounts.ipo_vault,
            &ctx.accounts.core_collection,
        )?;
        require_keys_eq!(
            ctx.accounts.asset.key(),
            ctx.accounts.desk.asset,
            ErrorCode::InvalidAsset
        );
        require_keys_eq!(
            *ctx.accounts.asset.owner,
            mpl_core::ID,
            ErrorCode::InvalidAsset
        );

        let asset_data = ctx.accounts.asset.try_borrow_data()?;
        let asset =
            BaseAssetV1::from_bytes(&asset_data).map_err(|_| error!(ErrorCode::InvalidAsset))?;
        require_keys_eq!(
            asset.owner,
            ctx.accounts.owner.key(),
            ErrorCode::InvalidAssetOwner
        );
        drop(asset_data);

        let ipo_cost_tokens = upgrade_ipo_cost(level)?;
        let raw_ipo_cost = whole_token_amount(ipo_cost_tokens, ctx.accounts.ipo_mint.decimals)?;
        let sol_cost = upgrade_sol_cost(level)?;
        transfer_sol(&ctx.accounts.owner, &ctx.accounts.treasury, sol_cost)?;
        transfer_ipo(
            ctx.accounts.transfer_ipo_context(),
            raw_ipo_cost,
            ctx.accounts.ipo_mint.decimals,
        )?;

        let next_level = level + 1;
        let uri = metadata_uri(
            &ctx.accounts.config.metadata_base_uri,
            ctx.accounts.desk.stock,
            ctx.accounts.desk.serial,
            next_level,
        );
        let authority = ctx.accounts.config.authority;
        let config_bump = [ctx.accounts.config.bump];
        let signer_seeds: &[&[u8]] = &[CONFIG_SEED, authority.as_ref(), &config_bump];

        UpdateV1CpiBuilder::new(&ctx.accounts.mpl_core_program.to_account_info())
            .asset(&ctx.accounts.asset.to_account_info())
            .collection(Some(&ctx.accounts.core_collection.to_account_info()))
            .payer(&ctx.accounts.owner.to_account_info())
            .authority(Some(&ctx.accounts.config.to_account_info()))
            .system_program(&ctx.accounts.system_program.to_account_info())
            .new_uri(uri)
            .invoke_signed(&[signer_seeds])?;

        ctx.accounts.desk.level = next_level;
        emit!(DeskUpgraded {
            owner: ctx.accounts.owner.key(),
            asset: ctx.accounts.asset.key(),
            serial: ctx.accounts.desk.serial,
            level: next_level,
            sol_paid: sol_cost,
            ipo_locked_raw: raw_ipo_cost,
        });
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = 8 + Config::INIT_SPACE,
        seeds = [CONFIG_SEED, authority.key().as_ref()],
        bump
    )]
    pub config: Account<'info, Config>,
    pub ipo_mint: Account<'info, Mint>,
    #[account(constraint = ipo_vault.mint == ipo_mint.key() @ ErrorCode::InvalidVault)]
    pub ipo_vault: Account<'info, TokenAccount>,
    /// CHECK: Ownership, data, and update authority are validated in the instruction.
    pub core_collection: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Admin<'info> {
    #[account(
        mut,
        seeds = [CONFIG_SEED, authority.key().as_ref()],
        bump = config.bump,
        has_one = authority
    )]
    pub config: Account<'info, Config>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(serial: u16)]
pub struct MintDesk<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    #[account(mut, seeds = [CONFIG_SEED, config.authority.as_ref()], bump = config.bump)]
    pub config: Account<'info, Config>,
    #[account(
        init,
        payer = buyer,
        space = 8 + Desk::INIT_SPACE,
        seeds = [DESK_SEED, config.key().as_ref(), &serial.to_le_bytes()],
        bump
    )]
    pub desk: Account<'info, Desk>,
    /// CHECK: Must match the immutable treasury stored in config.
    #[account(mut)]
    pub treasury: UncheckedAccount<'info>,
    #[account(
        mut,
        constraint = buyer_ipo_account.owner == buyer.key() @ ErrorCode::InvalidTokenOwner,
        constraint = buyer_ipo_account.mint == ipo_mint.key() @ ErrorCode::InvalidMint
    )]
    pub buyer_ipo_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub ipo_vault: Account<'info, TokenAccount>,
    pub ipo_mint: Account<'info, Mint>,
    /// CHECK: New Metaplex Core asset; must sign the outer transaction.
    #[account(mut, signer)]
    pub asset: UncheckedAccount<'info>,
    /// CHECK: Must match config and is verified by the Core CPI.
    #[account(mut)]
    pub core_collection: UncheckedAccount<'info>,
    /// CHECK: Address is constrained to the canonical Metaplex Core program.
    #[account(address = mpl_core::ID)]
    pub mpl_core_program: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

impl<'info> MintDesk<'info> {
    fn transfer_ipo_context(&self) -> CpiContext<'_, '_, '_, 'info, TransferChecked<'info>> {
        CpiContext::new(
            token::ID,
            TransferChecked {
                from: self.buyer_ipo_account.to_account_info(),
                mint: self.ipo_mint.to_account_info(),
                to: self.ipo_vault.to_account_info(),
                authority: self.buyer.to_account_info(),
            },
        )
    }
}

#[derive(Accounts)]
pub struct UpgradeDesk<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(seeds = [CONFIG_SEED, config.authority.as_ref()], bump = config.bump)]
    pub config: Account<'info, Config>,
    #[account(
        mut,
        seeds = [DESK_SEED, config.key().as_ref(), &desk.serial.to_le_bytes()],
        bump = desk.bump
    )]
    pub desk: Account<'info, Desk>,
    /// CHECK: Must match the immutable treasury stored in config.
    #[account(mut)]
    pub treasury: UncheckedAccount<'info>,
    #[account(
        mut,
        constraint = owner_ipo_account.owner == owner.key() @ ErrorCode::InvalidTokenOwner,
        constraint = owner_ipo_account.mint == ipo_mint.key() @ ErrorCode::InvalidMint
    )]
    pub owner_ipo_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub ipo_vault: Account<'info, TokenAccount>,
    pub ipo_mint: Account<'info, Mint>,
    /// CHECK: Core ownership and account owner are verified in the instruction.
    #[account(mut)]
    pub asset: UncheckedAccount<'info>,
    /// CHECK: Must match config and is verified by the Core CPI.
    #[account(mut)]
    pub core_collection: UncheckedAccount<'info>,
    /// CHECK: Address is constrained to the canonical Metaplex Core program.
    #[account(address = mpl_core::ID)]
    pub mpl_core_program: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

impl<'info> UpgradeDesk<'info> {
    fn transfer_ipo_context(&self) -> CpiContext<'_, '_, '_, 'info, TransferChecked<'info>> {
        CpiContext::new(
            token::ID,
            TransferChecked {
                from: self.owner_ipo_account.to_account_info(),
                mint: self.ipo_mint.to_account_info(),
                to: self.ipo_vault.to_account_info(),
                authority: self.owner.to_account_info(),
            },
        )
    }
}

fn validate_launch_accounts<'info>(
    config: &Account<'info, Config>,
    treasury: &UncheckedAccount<'info>,
    ipo_mint: &Account<'info, Mint>,
    ipo_vault: &Account<'info, TokenAccount>,
    core_collection: &UncheckedAccount<'info>,
) -> Result<()> {
    require_keys_eq!(treasury.key(), config.treasury, ErrorCode::InvalidTreasury);
    require_keys_eq!(ipo_mint.key(), config.ipo_mint, ErrorCode::InvalidMint);
    require_keys_eq!(ipo_vault.key(), config.ipo_vault, ErrorCode::InvalidVault);
    require_keys_eq!(ipo_vault.owner, config.key(), ErrorCode::InvalidVault);
    require_keys_eq!(
        core_collection.key(),
        config.core_collection,
        ErrorCode::InvalidCollection
    );
    require_keys_eq!(
        *core_collection.owner,
        mpl_core::ID,
        ErrorCode::InvalidCollection
    );
    Ok(())
}

fn transfer_sol<'info>(
    from: &Signer<'info>,
    to: &UncheckedAccount<'info>,
    lamports: u64,
) -> Result<()> {
    let accounts = anchor_lang::system_program::Transfer {
        from: from.to_account_info(),
        to: to.to_account_info(),
    };
    anchor_lang::system_program::transfer(
        CpiContext::new(anchor_lang::system_program::ID, accounts),
        lamports,
    )
}

fn transfer_ipo<'info>(
    ctx: CpiContext<'_, '_, '_, 'info, TransferChecked<'info>>,
    raw_amount: u64,
    decimals: u8,
) -> Result<()> {
    transfer_checked(ctx, raw_amount, decimals)
}

fn whole_token_amount(tokens: u64, decimals: u8) -> Result<u64> {
    let multiplier = 10_u64
        .checked_pow(decimals as u32)
        .ok_or(ErrorCode::TokenAmountOverflow)?;
    tokens
        .checked_mul(multiplier)
        .ok_or(ErrorCode::TokenAmountOverflow.into())
}

fn metadata_uri(base: &str, stock: Stock, serial: u16, level: u8) -> String {
    format!(
        "{}/{}-{:03}?level={}",
        base.trim_end_matches('/'),
        stock.ticker(),
        serial,
        level
    )
}

fn upgrade_ipo_cost(level: u8) -> Result<u64> {
    UPGRADE_IPO_COSTS
        .get(level as usize)
        .copied()
        .ok_or(ErrorCode::MaxLevel.into())
}

fn upgrade_sol_cost(level: u8) -> Result<u64> {
    UPGRADE_SOL_COSTS
        .get(level as usize)
        .copied()
        .ok_or(ErrorCode::MaxLevel.into())
}

#[account]
#[derive(InitSpace)]
pub struct Config {
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub ipo_mint: Pubkey,
    pub ipo_vault: Pubkey,
    pub core_collection: Pubkey,
    #[max_len(180)]
    pub metadata_base_uri: String,
    pub total_supply: u16,
    pub minted: u16,
    pub mint_price_lamports: u64,
    pub ipo_price_tokens: u64,
    pub paused: bool,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Desk {
    pub asset: Pubkey,
    pub original_owner: Pubkey,
    pub serial: u16,
    pub stock: Stock,
    pub level: u8,
    pub minted_at: i64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum Stock {
    Gta,
    Neuralink,
    Anthropic,
}

impl Stock {
    fn for_serial(serial: u16) -> Self {
        match (serial - 1) % 3 {
            0 => Self::Gta,
            1 => Self::Neuralink,
            _ => Self::Anthropic,
        }
    }

    fn ticker(self) -> &'static str {
        match self {
            Self::Gta => "GTA",
            Self::Neuralink => "NLNK",
            Self::Anthropic => "ANTH",
        }
    }
}

#[event]
pub struct ConfigInitialized {
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub ipo_mint: Pubkey,
    pub ipo_vault: Pubkey,
    pub core_collection: Pubkey,
    pub total_supply: u16,
    pub mint_price_lamports: u64,
    pub ipo_price_tokens: u64,
}

#[event]
pub struct DeskMinted {
    pub owner: Pubkey,
    pub asset: Pubkey,
    pub serial: u16,
    pub stock: Stock,
    pub sol_paid: u64,
    pub ipo_locked_raw: u64,
}

#[event]
pub struct DeskUpgraded {
    pub owner: Pubkey,
    pub asset: Pubkey,
    pub serial: u16,
    pub level: u8,
    pub sol_paid: u64,
    pub ipo_locked_raw: u64,
}

#[event]
pub struct PauseSet {
    pub paused: bool,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Minting is paused")]
    MintPaused,
    #[msg("All 333 desks have been minted")]
    SoldOut,
    #[msg("Serial must be the next supply number")]
    InvalidSerial,
    #[msg("Treasury account does not match config")]
    InvalidTreasury,
    #[msg("IPO mint does not match config")]
    InvalidMint,
    #[msg("IPO vault is not the program-controlled vault")]
    InvalidVault,
    #[msg("Core collection does not match config")]
    InvalidCollection,
    #[msg("Core collection update authority must be the config PDA")]
    InvalidCollectionAuthority,
    #[msg("Core asset is invalid")]
    InvalidAsset,
    #[msg("Signer does not own this Core asset")]
    InvalidAssetOwner,
    #[msg("Token account is not owned by the signer")]
    InvalidTokenOwner,
    #[msg("Desk is already max level")]
    MaxLevel,
    #[msg("Metadata base URI must be an HTTPS URL of 180 characters or fewer")]
    InvalidMetadataUri,
    #[msg("Token decimal conversion overflowed")]
    TokenAmountOverflow,
}

pub const CONFIG_SEED: &[u8] = b"config";
pub const DESK_SEED: &[u8] = b"desk";
pub const TOTAL_SUPPLY: u16 = 333;
pub const MINT_PRICE_LAMPORTS: u64 = 250_000_000;
pub const IPO_MINT_PRICE_TOKENS: u64 = 1_000_000;
pub const MAX_UPGRADE_LEVEL: u8 = 10;
pub const MAX_METADATA_BASE_URI: usize = 180;

pub const UPGRADE_IPO_COSTS: [u64; 10] = [
    150_000, 250_000, 400_000, 650_000, 1_000_000, 1_500_000, 2_250_000, 3_300_000, 4_800_000,
    7_000_000,
];

pub const UPGRADE_SOL_COSTS: [u64; 10] = [
    30_000_000,
    40_000_000,
    60_000_000,
    80_000_000,
    110_000_000,
    150_000_000,
    210_000_000,
    300_000_000,
    420_000_000,
    600_000_000,
];

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn assigns_markets_deterministically() {
        assert!(matches!(Stock::for_serial(1), Stock::Gta));
        assert!(matches!(Stock::for_serial(2), Stock::Neuralink));
        assert!(matches!(Stock::for_serial(3), Stock::Anthropic));
        assert!(matches!(Stock::for_serial(333), Stock::Anthropic));
    }

    #[test]
    fn scales_whole_tokens_with_mint_decimals() {
        assert_eq!(whole_token_amount(1_000_000, 6).unwrap(), 1_000_000_000_000);
        assert_eq!(whole_token_amount(150_000, 9).unwrap(), 150_000_000_000_000);
        assert!(whole_token_amount(u64::MAX, 9).is_err());
    }

    #[test]
    fn builds_canonical_metadata_uri() {
        assert_eq!(
            metadata_uri("https://example.com/api/metadata/", Stock::Neuralink, 2, 4),
            "https://example.com/api/metadata/NLNK-002?level=4"
        );
    }
}
