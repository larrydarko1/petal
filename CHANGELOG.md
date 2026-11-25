# Changelog

All notable changes to Petal are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- The release schedule in the README: a feature release every quarter, and fixes for urgent bugs within 7 days.

### Changed

- Petal's window is built for a WebKitGTK as recent as Safari 26 or newer, the first that runs all of ES2025.

## [1.0.5] - 2026-10-29

### Fixed

- Text typed while a save is running stays marked as unsaved.
- A file that can't be opened or saved now says so in a message box.

### Security

- Petal reads and writes only the files you choose in a dialog or open from your system, instead of any path on
  disk.

## [1.0.4] - 2026-05-17

### Changed

- One dark colour theme, in place of the light theme that switched to dark with the system.

## [1.0.3] - 2026-04-25

### Added

- Closing Petal with unsaved changes asks before discarding them.

## [1.0.2] - 2026-04-20

### Added

- Petal opens `.txt` files: set it as the app for them, or open one from your file manager.

## [1.0.0] - 2026-03-24

The first release: open, edit and save plain text files.

[Unreleased]: https://github.com/larrydarko1/petal/compare/v1.0.5...HEAD
[1.0.5]: https://github.com/larrydarko1/petal/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/larrydarko1/petal/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/larrydarko1/petal/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/larrydarko1/petal/compare/v1.0.0...v1.0.2
[1.0.0]: https://github.com/larrydarko1/petal/releases/tag/v1.0.0
