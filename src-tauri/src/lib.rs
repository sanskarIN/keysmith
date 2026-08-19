mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::generate_password_command,
            commands::generate_batch_command,
            commands::generate_passphrase_command,
            commands::get_presets_command,
            commands::copy_secret_command,
            commands::clear_clipboard_command,
            commands::export_batch_command,
        ])
        .run(tauri::generate_context!())
        .unwrap_or_else(|error| panic!("failed to run KeySmith: {error}"));
}
