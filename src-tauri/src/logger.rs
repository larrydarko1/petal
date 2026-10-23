//! The app's log: a file in the OS log directory (`~/Library/Logs/<identifier>/` on macOS),
//! rotated at 1 MB, and stdout for `tauri dev`.
//!
//! The plugin's own format drops a record's key-values, so this one appends them:
//! `log::warn!(path:% = p.display(); "File not found")`.

use std::fmt::Write as _;

use log::kv::{Error as KvError, Key, Value, VisitSource};
use tauri::{plugin::TauriPlugin, Runtime};
use tauri_plugin_log::{RotationStrategy, Target, TargetKind};
use time::{format_description::well_known::Rfc3339, OffsetDateTime};

const MAX_FILE_BYTES: u128 = 1024 * 1024;

pub fn plugin<R: Runtime>() -> TauriPlugin<R> {
    tauri_plugin_log::Builder::new()
        .clear_targets()
        .target(Target::new(TargetKind::LogDir { file_name: None }))
        .target(Target::new(TargetKind::Stdout))
        .max_file_size(MAX_FILE_BYTES)
        .rotation_strategy(RotationStrategy::KeepOne)
        .level(log::LevelFilter::Info)
        .format(|out, message, record| {
            let mut fields = Fields(String::new());
            if record.key_values().visit(&mut fields).is_err() {
                fields.0.push_str(" fields=unformattable");
            }
            let now = OffsetDateTime::now_utc()
                .format(&Rfc3339)
                .unwrap_or_default();
            out.finish(format_args!(
                "{now} [{}] [{}] {message}{}",
                record.level(),
                record.target(),
                fields.0
            ));
        })
        .build()
}

/// Collects a record's key-values as ` key=value` pairs.
struct Fields(String);

impl<'kvs> VisitSource<'kvs> for Fields {
    fn visit_pair(&mut self, key: Key<'kvs>, value: Value<'kvs>) -> Result<(), KvError> {
        write!(self.0, " {key}={value}").map_err(|_| KvError::msg("a field could not be written"))
    }
}
