//! Files the OS asked the app to open (a double-click on a `.txt`), held until the window asks for them.

use std::sync::Mutex;

use tauri::State;

use crate::error::{Error, Result};

/// The event that hands the window a file the OS opened while the app was running.
pub const FILE_OPENED: &str = "file:opened";

#[derive(Default)]
pub struct PendingFiles(pub Mutex<Vec<String>>);

#[tauri::command]
pub fn take_pending_files(pending: State<'_, PendingFiles>) -> Result<Vec<String>> {
    let mut files = pending
        .0
        .lock()
        .map_err(|_| Error::StatePoisoned)
        .inspect_err(|err| {
            log::error!(command = "take_pending_files", err:? = err; "Command failed");
        })?;
    Ok(files.drain(..).collect())
}
