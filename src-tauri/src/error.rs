//! The error every command returns.
//!
//! It crosses to the webview as its code alone: the detail — an OS message that names a
//! path on the user's disk — stays in the log.

use serde::{Serialize, Serializer};

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("a lock on managed state was poisoned by a panic")]
    StatePoisoned,
}

impl Error {
    /// The code the webview translates: `errors.<code>` in every locale.
    pub const fn code(&self) -> &'static str {
        match self {
            Self::StatePoisoned => "INTERNAL",
        }
    }
}

impl Serialize for Error {
    fn serialize<S: Serializer>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error> {
        serializer.serialize_str(self.code())
    }
}

pub type Result<T> = std::result::Result<T, Error>;
