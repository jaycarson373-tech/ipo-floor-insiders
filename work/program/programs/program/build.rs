use std::{env, fs, path::PathBuf};

fn main() {
    let config_path =
        PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../../site/product-config.json");
    println!("cargo:rerun-if-changed={}", config_path.display());

    let source = fs::read_to_string(&config_path).expect("read shared product configuration");
    let config: serde_json::Value =
        serde_json::from_str(&source).expect("parse product configuration");
    let supply = config["supply"]
        .as_u64()
        .expect("supply must be an integer");
    let price_lamports = config["mintPriceLamports"]
        .as_u64()
        .expect("mintPriceLamports must be an integer");
    let max_levels = config["maxLevels"]
        .as_u64()
        .expect("maxLevels must be an integer");
    let mint_asset_bps = config["draftMintCapitalBps"]["rewardAssets"]
        .as_u64()
        .expect("draftMintCapitalBps.rewardAssets must be an integer");
    let mint_operations_bps = config["draftMintCapitalBps"]["operations"]
        .as_u64()
        .expect("draftMintCapitalBps.operations must be an integer");
    assert!(supply <= u16::MAX as u64, "supply must fit in u16");
    assert!(max_levels <= u8::MAX as u64, "maxLevels must fit in u8");
    assert_eq!(
        mint_asset_bps + mint_operations_bps,
        10_000,
        "mint allocation must total 10,000 bps"
    );

    let generated = format!(
        "pub const TOTAL_SUPPLY: u16 = {supply};\n\
         pub const MINT_PRICE_LAMPORTS: u64 = {price_lamports};\n\
         pub const MINT_ASSET_BPS: u64 = {mint_asset_bps};\n\
         pub const MAX_UPGRADE_LEVEL: u8 = {max_levels};\n"
    );
    let out = PathBuf::from(env::var("OUT_DIR").expect("OUT_DIR")).join("economics.rs");
    fs::write(out, generated).expect("write generated economics constants");
}
