// The app's own commands, listed so each one becomes a permission (`allow-take-pending-files`)
// a capability must grant. Without the list, every registered command reaches every window.
const COMMANDS: &[&str] = &["take_pending_files"];

fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    tauri_build::try_build(
        tauri_build::Attributes::new()
            .app_manifest(tauri_build::AppManifest::new().commands(COMMANDS)),
    )?;
    Ok(())
}
