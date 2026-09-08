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
    let price_sol = config["mintPriceSol"]
        .as_f64()
        .expect("mintPriceSol must be a number");
    let max_levels = config["maxLevels"]
        .as_u64()
        .expect("maxLevels must be an integer");
    let price_lamports = (price_sol * 1_000_000_000.0).round() as u64;

    assert!(supply <= u16::MAX as u64, "supply must fit in u16");
    assert!(max_levels <= u8::MAX as u64, "maxLevels must fit in u8");
    assert!(
        ((price_lamports as f64 / 1_000_000_000.0) - price_sol).abs() < f64::EPSILON,
        "mintPriceSol must resolve to whole lamports"
    );

    let generated = format!(
        "pub const TOTAL_SUPPLY: u16 = {supply};\n\
         pub const MINT_PRICE_LAMPORTS: u64 = {price_lamports};\n\
         pub const MAX_UPGRADE_LEVEL: u8 = {max_levels};\n"
    );
    let out = PathBuf::from(env::var("OUT_DIR").expect("OUT_DIR")).join("economics.rs");
    fs::write(out, generated).expect("write generated economics constants");
}
