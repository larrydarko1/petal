//! The app: its plugins, its managed state, the commands the webview may call, and
//! the files the OS opens with it.

mod commands;
mod error;
mod logger;

use std::path::Path;

use tauri::{App, AppHandle, Emitter, Manager, PhysicalSize, RunEvent};
use tauri_plugin_fs::FsExt;

use crate::commands::file::{PendingFiles, FILE_OPENED};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = tauri::Builder::default()
        .plugin(logger::plugin())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(PendingFiles::default())
        .invoke_handler(tauri::generate_handler![commands::file::take_pending_files])
        .setup(|app| {
            log::info!(version:% = app.package_info().version; "App started");
            size_main_window(app);
            // Windows and Linux pass a file opened through the OS as an argument.
            #[cfg(not(target_os = "macos"))]
            for arg in std::env::args().skip(1) {
                let path = std::path::PathBuf::from(arg);
                if path.is_file() {
                    queue_file(app.handle(), &path);
                }
            }
            Ok(())
        })
        .build(tauri::generate_context!());

    match app {
        Ok(app) => app.run(on_event),
        // Nothing is on screen yet and the log may not be either: exiting non-zero is all there is.
        Err(err) => {
            log::error!(err:? = err; "App failed to start");
            std::process::exit(1);
        }
    }
}

fn on_event(app: &AppHandle, event: RunEvent) {
    // macOS delivers a file opened through the OS as an Apple Event.
    #[cfg(target_os = "macos")]
    if let RunEvent::Opened { urls } = event {
        for path in urls.into_iter().filter_map(|url| url.to_file_path().ok()) {
            queue_file(app, &path);
        }
    }
    #[cfg(not(target_os = "macos"))]
    let _ = (app, event);
}

/// Grants the webview the file the OS opened, and hands it to the window.
fn queue_file(app: &AppHandle, path: &Path) {
    if let Err(err) = app.fs_scope().allow_file(path) {
        log::error!(err:? = err; "Could not add an opened file to the fs scope");
        return;
    }
    let path = path.to_string_lossy().into_owned();
    match app.state::<PendingFiles>().0.lock() {
        Ok(mut pending) => pending.push(path.clone()),
        Err(_) => log::error!("Pending files lock poisoned; an opened file was dropped"),
    }
    if let Err(err) = app.emit(FILE_OPENED, &path) {
        log::warn!(err:? = err; "Could not announce an opened file; the window collects it on load");
    }
}

/// 45% × 60% of the primary monitor, and no smaller than 30% × 40%.
fn size_main_window(app: &App) {
    let (Ok(Some(monitor)), Some(window)) = (app.primary_monitor(), app.get_webview_window("main"))
    else {
        return;
    };
    let screen = monitor.size();
    let size = PhysicalSize::new(screen.width * 45 / 100, screen.height * 60 / 100);
    let min = PhysicalSize::new(screen.width * 30 / 100, screen.height * 40 / 100);
    if let Err(err) = window
        .set_size(size)
        .and_then(|()| window.set_min_size(Some(min)))
    {
        log::warn!(err:? = err; "Could not size the main window");
    }
}
