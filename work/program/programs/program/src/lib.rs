use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    instruction::{AccountMeta, Instruction},
    program::invoke_signed,
};
use anchor_spl::token::{self, burn, Burn, Mint, Token, TokenAccount};

declare_id!("GMSArcjhrpxt6JkqwmJX47tbuFH6PtdH21JARt3hBUnm");

#[program]
pub mod ipo_program {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        treasury: Pubkey,
        asset_treasury: Pubkey,
        metadata_base_uri: String,
    ) -> Result<()> {
        require!(treasury != Pubkey::default(), ErrorCode::InvalidTreasury);
        require!(
            asset_treasury != Pubkey::default(),
            ErrorCode::InvalidAssetTreasury
        );
        require!(asset_treasury != treasury, ErrorCode::InvalidAssetTreasury);
        require!(
            metadata_base_uri.starts_with("https://")
                && metadata_base_uri.len() <= MAX_METADATA_BASE_URI,
            ErrorCode::InvalidMetadataUri
        );
        require_keys_eq!(
            *ctx.accounts.core_collection.owner,
            MPL_CORE_ID,
            ErrorCode::InvalidCollection
        );
        let collection_data = ctx.accounts.core_collection.try_borrow_data()?;
        require_keys_eq!(
            read_core_header_owner(&collection_data, CORE_COLLECTION_V1_KEY)?,
            ctx.accounts.config.key(),
            ErrorCode::InvalidCollectionAuthority
        );
        drop(collection_data);

        let config = &mut ctx.accounts.config;
        config.authority = ctx.accounts.authority.key();
        config.treasury = treasury;
        config.asset_treasury = asset_treasury;
        config.core_collection = ctx.accounts.core_collection.key();
        config.metadata_base_uri = metadata_base_uri;
        config.total_supply = TOTAL_SUPPLY;
        config.minted = 0;
        config.mint_price_lamports = MINT_PRICE_LAMPORTS;
        config.paused = false;
        config.bump = ctx.bumps.config;
        config.upgrades_enabled = false;
        config.upgrade_ipo_mint = Pubkey::default();
        config.upgrade_ipo_costs = [0; MAX_UPGRADE_LEVEL as usize];
        config.upgrade_sol_costs = [0; MAX_UPGRADE_LEVEL as usize];

        emit!(ConfigInitialized {
            authority: config.authority,
            treasury,
            asset_treasury,
            core_collection: config.core_collection,
            total_supply: config.total_supply,
            mint_price_lamports: config.mint_price_lamports,
        });
        Ok(())
    }

    pub fn set_pause(ctx: Context<Admin>, paused: bool) -> Result<()> {
        ctx.accounts.config.paused = paused;
        emit!(PauseSet { paused });
        Ok(())
    }

    pub fn configure_upgrades(
        ctx: Context<Admin>,
        ipo_mint: Pubkey,
        ipo_costs: [u64; MAX_UPGRADE_LEVEL as usize],
        sol_costs: [u64; MAX_UPGRADE_LEVEL as usize],
        enabled: bool,
    ) -> Result<()> {
        require!(
            !enabled || ipo_mint != Pubkey::default(),
            ErrorCode::InvalidMint
        );
        let config = &mut ctx.accounts.config;
        config.upgrade_ipo_mint = ipo_mint;
        config.upgrade_ipo_costs = ipo_costs;
        config.upgrade_sol_costs = sol_costs;
        config.upgrades_enabled = enabled;
        emit!(UpgradeConfigSet { enabled });
        Ok(())
    }

    pub fn mint_desk(ctx: Context<MintDesk>, serial: u16) -> Result<()> {
        let config = &ctx.accounts.config;
        require!(!config.paused, ErrorCode::MintPaused);
        require!(config.minted < TOTAL_SUPPLY, ErrorCode::SoldOut);
        require!(serial == config.minted + 1, ErrorCode::InvalidSerial);
        validate_mint_accounts(
            config,
            &ctx.accounts.asset_treasury,
            &ctx.accounts.core_collection,
        )?;

        let name = format!("Pumpio #{:04}", serial);
        let uri = metadata_uri(&config.metadata_base_uri, serial, 0);
        let authority = config.authority;
        let config_bump = [config.bump];
        let signer_seeds: &[&[u8]] = &[CONFIG_SEED, authority.as_ref(), &config_bump];

        let initial_asset_lamports = mint_asset_capital(MINT_PRICE_LAMPORTS)?;
        transfer_sol(
            &ctx.accounts.buyer,
            &ctx.accounts.asset_treasury,
            initial_asset_lamports,
        )?;
        create_core_asset(
            &ctx.accounts.mpl_core_program,
            &ctx.accounts.asset,
            &ctx.accounts.core_collection,
            &ctx.accounts.config.to_account_info(),
            &ctx.accounts.buyer,
            &ctx.accounts.system_program,
            &name,
            &uri,
            &[signer_seeds],
        )?;

        ctx.accounts.config.minted = serial;
        let desk = &mut ctx.accounts.desk;
        desk.asset = ctx.accounts.asset.key();
        desk.original_owner = ctx.accounts.buyer.key();
        desk.serial = serial;
        desk.level = 0;
        desk.minted_at = Clock::get()?.unix_timestamp;
        desk.initial_asset_lamports = initial_asset_lamports;
        desk.bump = ctx.bumps.desk;

        emit!(DeskMinted {
            owner: ctx.accounts.buyer.key(),
            asset: desk.asset,
            serial,
            sol_paid: MINT_PRICE_LAMPORTS,
            initial_asset_lamports,
        });
        Ok(())
    }

    pub fn upgrade_desk(ctx: Context<UpgradeDesk>) -> Result<()> {
        require!(!ctx.accounts.config.paused, ErrorCode::MintPaused);
        require!(
            ctx.accounts.config.upgrades_enabled,
            ErrorCode::UpgradesDisabled
        );
        let level = ctx.accounts.desk.level;
        require!(level < MAX_UPGRADE_LEVEL, ErrorCode::MaxLevel);
        validate_upgrade_accounts(
            &ctx.accounts.config,
            &ctx.accounts.treasury,
            &ctx.accounts.ipo_mint,
            &ctx.accounts.core_collection,
        )?;
        require_keys_eq!(
            ctx.accounts.asset.key(),
            ctx.accounts.desk.asset,
            ErrorCode::InvalidAsset
        );
        require_keys_eq!(
            *ctx.accounts.asset.owner,
            MPL_CORE_ID,
            ErrorCode::InvalidAsset
        );

        let asset_data = ctx.accounts.asset.try_borrow_data()?;
        require_keys_eq!(
            read_core_header_owner(&asset_data, CORE_ASSET_V1_KEY)?,
            ctx.accounts.owner.key(),
            ErrorCode::InvalidAssetOwner
        );
        drop(asset_data);

        let ipo_cost_tokens = ctx.accounts.config.upgrade_ipo_costs[level as usize];
        let raw_ipo_cost = whole_token_amount(ipo_cost_tokens, ctx.accounts.ipo_mint.decimals)?;
        let sol_cost = ctx.accounts.config.upgrade_sol_costs[level as usize];
        transfer_sol(&ctx.accounts.owner, &ctx.accounts.treasury, sol_cost)?;
        burn_ipo(ctx.accounts.burn_ipo_context(), raw_ipo_cost)?;

        let next_level = level + 1;
        let uri = metadata_uri(
            &ctx.accounts.config.metadata_base_uri,
            ctx.accounts.desk.serial,
            next_level,
        );
        let authority = ctx.accounts.config.authority;
        let config_bump = [ctx.accounts.config.bump];
        let signer_seeds: &[&[u8]] = &[CONFIG_SEED, authority.as_ref(), &config_bump];

        update_core_asset_uri(
            &ctx.accounts.mpl_core_program,
            &ctx.accounts.asset,
            &ctx.accounts.core_collection,
            &ctx.accounts.owner,
            &ctx.accounts.config.to_account_info(),
            &ctx.accounts.system_program,
            &uri,
            &[signer_seeds],
        )?;

        ctx.accounts.desk.level = next_level;
        emit!(DeskUpgraded {
            owner: ctx.accounts.owner.key(),
            asset: ctx.accounts.asset.key(),
            serial: ctx.accounts.desk.serial,
            level: next_level,
            sol_paid: sol_cost,
            ipo_burned_raw: raw_ipo_cost,
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
    /// CHECK: Must match the asset-capital treasury stored in config.
    #[account(mut)]
    pub asset_treasury: UncheckedAccount<'info>,
    /// CHECK: New Metaplex Core asset; must sign the outer transaction.
    #[account(mut, signer)]
    pub asset: UncheckedAccount<'info>,
    /// CHECK: Must match config and is verified by the Core CPI.
    #[account(mut)]
    pub core_collection: UncheckedAccount<'info>,
    /// CHECK: Address is constrained to the canonical Metaplex Core program.
    #[account(address = MPL_CORE_ID)]
    pub mpl_core_program: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
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
    pub ipo_mint: Account<'info, Mint>,
    /// CHECK: Core ownership and account owner are verified in the instruction.
    #[account(mut)]
    pub asset: UncheckedAccount<'info>,
    /// CHECK: Must match config and is verified by the Core CPI.
    #[account(mut)]
    pub core_collection: UncheckedAccount<'info>,
    /// CHECK: Address is constrained to the canonical Metaplex Core program.
    #[account(address = MPL_CORE_ID)]
    pub mpl_core_program: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

impl<'info> UpgradeDesk<'info> {
    fn burn_ipo_context(&self) -> CpiContext<'_, '_, '_, 'info, Burn<'info>> {
        CpiContext::new(
            token::ID,
            Burn {
                from: self.owner_ipo_account.to_account_info(),
                mint: self.ipo_mint.to_account_info(),
                authority: self.owner.to_account_info(),
            },
        )
    }
}

fn validate_mint_accounts<'info>(
    config: &Account<'info, Config>,
    asset_treasury: &UncheckedAccount<'info>,
    core_collection: &UncheckedAccount<'info>,
) -> Result<()> {
    require_keys_eq!(
        asset_treasury.key(),
        config.asset_treasury,
        ErrorCode::InvalidAssetTreasury
    );
    require_keys_eq!(
        core_collection.key(),
        config.core_collection,
        ErrorCode::InvalidCollection
    );
    require_keys_eq!(
        *core_collection.owner,
        MPL_CORE_ID,
        ErrorCode::InvalidCollection
    );
    Ok(())
}

fn validate_upgrade_accounts<'info>(
    config: &Account<'info, Config>,
    treasury: &UncheckedAccount<'info>,
    ipo_mint: &Account<'info, Mint>,
    core_collection: &UncheckedAccount<'info>,
) -> Result<()> {
    require_keys_eq!(treasury.key(), config.treasury, ErrorCode::InvalidTreasury);
    require_keys_eq!(
        ipo_mint.key(),
        config.upgrade_ipo_mint,
        ErrorCode::InvalidMint
    );
    require_keys_eq!(
        core_collection.key(),
        config.core_collection,
        ErrorCode::InvalidCollection
    );
    require_keys_eq!(
        *core_collection.owner,
        MPL_CORE_ID,
        ErrorCode::InvalidCollection
    );
    Ok(())
}

fn read_core_header_owner(data: &[u8], expected_key: u8) -> Result<Pubkey> {
    require!(data.len() >= 33, ErrorCode::InvalidCoreAccountData);
    require!(data[0] == expected_key, ErrorCode::InvalidCoreAccountData);
    let bytes: [u8; 32] = data[1..33]
        .try_into()
        .map_err(|_| error!(ErrorCode::InvalidCoreAccountData))?;
    Ok(Pubkey::new_from_array(bytes))
}

fn push_borsh_string(data: &mut Vec<u8>, value: &str) -> Result<()> {
    let length = u32::try_from(value.len()).map_err(|_| error!(ErrorCode::InvalidMetadataUri))?;
    data.extend_from_slice(&length.to_le_bytes());
    data.extend_from_slice(value.as_bytes());
    Ok(())
}

fn create_core_data(name: &str, uri: &str) -> Result<Vec<u8>> {
    let mut data = Vec::with_capacity(12 + name.len() + uri.len());
    data.push(20); // CreateV2
    data.push(0); // DataState::AccountState
    push_borsh_string(&mut data, name)?;
    push_borsh_string(&mut data, uri)?;
    data.push(0); // plugins: None
    data.push(0); // external_plugin_adapters: None
    Ok(data)
}

fn update_core_uri_data(uri: &str) -> Result<Vec<u8>> {
    let mut data = Vec::with_capacity(8 + uri.len());
    data.push(15); // UpdateV1
    data.push(0); // new_name: None
    data.push(1); // new_uri: Some
    push_borsh_string(&mut data, uri)?;
    data.push(0); // new_update_authority: None
    Ok(data)
}

#[allow(clippy::too_many_arguments)]
fn create_core_asset<'info>(
    core_program: &UncheckedAccount<'info>,
    asset: &UncheckedAccount<'info>,
    collection: &UncheckedAccount<'info>,
    authority: &AccountInfo<'info>,
    payer: &Signer<'info>,
    system_program: &Program<'info, System>,
    name: &str,
    uri: &str,
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    let instruction = Instruction {
        program_id: MPL_CORE_ID,
        accounts: vec![
            AccountMeta::new(asset.key(), true),
            AccountMeta::new(collection.key(), false),
            AccountMeta::new_readonly(authority.key(), true),
            AccountMeta::new(payer.key(), true),
            AccountMeta::new_readonly(payer.key(), false),
            AccountMeta::new_readonly(MPL_CORE_ID, false),
            AccountMeta::new_readonly(system_program.key(), false),
            AccountMeta::new_readonly(MPL_CORE_ID, false),
        ],
        data: create_core_data(name, uri)?,
    };
    invoke_signed(
        &instruction,
        &[
            core_program.to_account_info(),
            asset.to_account_info(),
            collection.to_account_info(),
            authority.clone(),
            payer.to_account_info(),
            payer.to_account_info(),
            system_program.to_account_info(),
        ],
        signer_seeds,
    )?;
    Ok(())
}

#[allow(clippy::too_many_arguments)]
fn update_core_asset_uri<'info>(
    core_program: &UncheckedAccount<'info>,
    asset: &UncheckedAccount<'info>,
    collection: &UncheckedAccount<'info>,
    payer: &Signer<'info>,
    authority: &AccountInfo<'info>,
    system_program: &Program<'info, System>,
    uri: &str,
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    let instruction = Instruction {
        program_id: MPL_CORE_ID,
        accounts: vec![
            AccountMeta::new(asset.key(), false),
            AccountMeta::new_readonly(collection.key(), false),
            AccountMeta::new(payer.key(), true),
            AccountMeta::new_readonly(authority.key(), true),
            AccountMeta::new_readonly(system_program.key(), false),
            AccountMeta::new_readonly(MPL_CORE_ID, false),
        ],
        data: update_core_uri_data(uri)?,
    };
    invoke_signed(
        &instruction,
        &[
            core_program.to_account_info(),
            asset.to_account_info(),
            collection.to_account_info(),
            payer.to_account_info(),
            authority.clone(),
            system_program.to_account_info(),
        ],
        signer_seeds,
    )?;
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

fn burn_ipo<'info>(ctx: CpiContext<'_, '_, '_, 'info, Burn<'info>>, raw_amount: u64) -> Result<()> {
    burn(ctx, raw_amount)
}

fn whole_token_amount(tokens: u64, decimals: u8) -> Result<u64> {
    let multiplier = 10_u64
        .checked_pow(decimals as u32)
        .ok_or(ErrorCode::TokenAmountOverflow)?;
    tokens
        .checked_mul(multiplier)
        .ok_or(ErrorCode::TokenAmountOverflow.into())
}

fn mint_asset_capital(lamports: u64) -> Result<u64> {
    lamports
        .checked_mul(MINT_ASSET_BPS)
        .ok_or(ErrorCode::TokenAmountOverflow)?
        .checked_div(BPS_DENOMINATOR)
        .ok_or(ErrorCode::TokenAmountOverflow.into())
}

fn metadata_uri(base: &str, serial: u16, level: u8) -> String {
    format!(
        "{}/PUMPIO-{:04}?level={}",
        base.trim_end_matches('/'),
        serial,
        level
    )
}

#[account]
#[derive(InitSpace)]
pub struct Config {
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub asset_treasury: Pubkey,
    pub core_collection: Pubkey,
    #[max_len(180)]
    pub metadata_base_uri: String,
    pub total_supply: u16,
    pub minted: u16,
    pub mint_price_lamports: u64,
    pub paused: bool,
    pub bump: u8,
    pub upgrades_enabled: bool,
    pub upgrade_ipo_mint: Pubkey,
    pub upgrade_ipo_costs: [u64; MAX_UPGRADE_LEVEL as usize],
    pub upgrade_sol_costs: [u64; MAX_UPGRADE_LEVEL as usize],
}

#[account]
#[derive(InitSpace)]
pub struct Desk {
    pub asset: Pubkey,
    pub original_owner: Pubkey,
    pub serial: u16,
    pub level: u8,
    pub minted_at: i64,
    pub initial_asset_lamports: u64,
    pub bump: u8,
}

#[event]
pub struct ConfigInitialized {
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub asset_treasury: Pubkey,
    pub core_collection: Pubkey,
    pub total_supply: u16,
    pub mint_price_lamports: u64,
}

#[event]
pub struct DeskMinted {
    pub owner: Pubkey,
    pub asset: Pubkey,
    pub serial: u16,
    pub sol_paid: u64,
    pub initial_asset_lamports: u64,
}

#[event]
pub struct DeskUpgraded {
    pub owner: Pubkey,
    pub asset: Pubkey,
    pub serial: u16,
    pub level: u8,
    pub sol_paid: u64,
    pub ipo_burned_raw: u64,
}

#[event]
pub struct PauseSet {
    pub paused: bool,
}

#[event]
pub struct UpgradeConfigSet {
    pub enabled: bool,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Minting is paused")]
    MintPaused,
    #[msg("All 1,200 Pumpios have been minted")]
    SoldOut,
    #[msg("Serial must be the next supply number")]
    InvalidSerial,
    #[msg("Treasury account does not match config")]
    InvalidTreasury,
    #[msg("Asset-capital treasury is invalid or matches operations treasury")]
    InvalidAssetTreasury,
    #[msg("IPO mint does not match config")]
    InvalidMint,
    #[msg("Core collection does not match config")]
    InvalidCollection,
    #[msg("Core collection update authority must be the config PDA")]
    InvalidCollectionAuthority,
    #[msg("Core asset is invalid")]
    InvalidAsset,
    #[msg("Metaplex Core account header is invalid")]
    InvalidCoreAccountData,
    #[msg("Signer does not own this Core asset")]
    InvalidAssetOwner,
    #[msg("Token account is not owned by the signer")]
    InvalidTokenOwner,
    #[msg("Pumpio is already max level")]
    MaxLevel,
    #[msg("Pumpio upgrades are not configured")]
    UpgradesDisabled,
    #[msg("Metadata base URI must be an HTTPS URL of 180 characters or fewer")]
    InvalidMetadataUri,
    #[msg("Token decimal conversion overflowed")]
    TokenAmountOverflow,
}

pub const CONFIG_SEED: &[u8] = b"config";
pub const DESK_SEED: &[u8] = b"desk";
include!(concat!(env!("OUT_DIR"), "/economics.rs"));
pub const BPS_DENOMINATOR: u64 = 10_000;
pub const MAX_METADATA_BASE_URI: usize = 180;
pub const CORE_ASSET_V1_KEY: u8 = 1;
pub const CORE_COLLECTION_V1_KEY: u8 = 5;
pub const MPL_CORE_ID: Pubkey = pubkey!("CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d");

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn scales_whole_tokens_with_mint_decimals() {
        assert_eq!(whole_token_amount(1_000_000, 6).unwrap(), 1_000_000_000_000);
        assert_eq!(whole_token_amount(150_000, 9).unwrap(), 150_000_000_000_000);
        assert!(whole_token_amount(u64::MAX, 9).is_err());
    }

    #[test]
    fn builds_canonical_metadata_uri() {
        assert_eq!(
            metadata_uri("https://example.com/api/metadata/", 2, 4),
            "https://example.com/api/metadata/PUMPIO-0002?level=4"
        );
    }

    #[test]
    fn routes_each_mint_fully_to_asset_capital() {
        assert_eq!(mint_asset_capital(120_000_000).unwrap(), 120_000_000);
        assert_eq!(mint_asset_capital(7).unwrap(), 7);
    }

    #[test]
    fn validates_only_the_bounded_core_header() {
        let owner = Pubkey::new_unique();
        let mut asset = vec![CORE_ASSET_V1_KEY];
        asset.extend_from_slice(owner.as_ref());
        asset.extend_from_slice(&[255; 64]);
        assert_eq!(
            read_core_header_owner(&asset, CORE_ASSET_V1_KEY).unwrap(),
            owner
        );
        assert!(read_core_header_owner(&asset, CORE_COLLECTION_V1_KEY).is_err());
        assert!(read_core_header_owner(&asset[..20], CORE_ASSET_V1_KEY).is_err());
    }

    #[test]
    fn encodes_metaplex_core_instruction_data() {
        let create = create_core_data("Pumpio #0001", "https://example.com/PUMPIO-0001").unwrap();
        assert_eq!(&create[..2], &[20, 0]);
        assert_eq!(&create[create.len() - 2..], &[0, 0]);
        let update = update_core_uri_data("https://example.com/PUMPIO-0001?level=1").unwrap();
        assert_eq!(&update[..3], &[15, 0, 1]);
        assert_eq!(update.last(), Some(&0));
    }
}
