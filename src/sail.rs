use zed::lsp::{Completion, CompletionKind};
use zed::{CodeLabel, CodeLabelSpan};
use zed_extension_api::settings::LspSettings;
use zed_extension_api::{self as zed, serde_json, Result};

const LANGUAGE_SERVER_CANDIDATES: [&str; 2] = ["sail_server", "sail-lsp"];
const LSP_SETTINGS_KEYS: [&str; 2] = ["sail-lsp", "sail_lsp"];
const SAIL_LSP_RELEASE_REPO: &str = "TinyuengKwan/sail-lsp";

fn settings_keys(language_server_id: &zed::LanguageServerId) -> Vec<String> {
    let mut keys = vec![language_server_id.as_ref().to_string()];
    for key in LSP_SETTINGS_KEYS {
        if !keys.iter().any(|existing| existing == key) {
            keys.push(key.to_string());
        }
    }
    keys
}

struct SailExtension {
    cached_binary_path: Option<String>,
}

impl zed::Extension for SailExtension {
    fn new() -> Self {
        Self {
            cached_binary_path: None,
        }
    }

    fn language_server_command(
        &mut self,
        language_server_id: &zed::LanguageServerId,
        worktree: &zed::Worktree,
    ) -> Result<zed::Command> {
        let mut env = worktree.shell_env();
        let mut user_command = None;
        let mut user_args = Vec::new();

        for key in settings_keys(language_server_id) {
            let Some(binary) = LspSettings::for_worktree(&key, worktree)
                .ok()
                .and_then(|settings| settings.binary)
            else {
                continue;
            };

            if let Some(user_env) = binary.env {
                env.extend(user_env);
            }
            if let Some(path) = binary.path {
                user_command = Some(path);
            }
            if let Some(args) = binary.arguments {
                user_args = args;
            }
            break;
        }

        if let Some(path) = user_command {
            return Ok(zed::Command {
                command: path,
                args: user_args,
                env,
            });
        }

        for candidate in LANGUAGE_SERVER_CANDIDATES {
            if let Some(path) = worktree.which(candidate) {
                return Ok(zed::Command {
                    command: path,
                    args: user_args.clone(),
                    env: env.clone(),
                });
            }
        }

        let downloaded_binary_path = self.download_release_binary()?;
        Ok(zed::Command {
            command: downloaded_binary_path,
            args: user_args,
            env,
        })
    }

    fn language_server_initialization_options(
        &mut self,
        language_server_id: &zed::LanguageServerId,
        worktree: &zed::Worktree,
    ) -> Result<Option<serde_json::Value>> {
        for key in settings_keys(language_server_id) {
            if let Ok(lsp_settings) = LspSettings::for_worktree(&key, worktree) {
                if lsp_settings.initialization_options.is_some() {
                    return Ok(lsp_settings.initialization_options);
                }
            }
        }
        Ok(None)
    }

    fn language_server_workspace_configuration(
        &mut self,
        language_server_id: &zed::LanguageServerId,
        worktree: &zed::Worktree,
    ) -> Result<Option<serde_json::Value>> {
        for key in settings_keys(language_server_id) {
            if let Ok(lsp_settings) = LspSettings::for_worktree(&key, worktree) {
                if lsp_settings.settings.is_some() {
                    return Ok(lsp_settings.settings);
                }
            }
        }
        Ok(None)
    }

    fn label_for_completion(
        &self,
        _language_server_id: &zed::LanguageServerId,
        completion: Completion,
    ) -> Option<CodeLabel> {
        let name = completion.label;

        match completion.kind {
            Some(CompletionKind::Function | CompletionKind::Method) => {
                let detail = completion
                    .detail
                    .unwrap_or_else(|| "() -> unit".to_string());
                let head = "val ";
                let middle = " : ";
                let code = format!("{head}{name}{middle}{detail}");
                let name_start = head.len();
                let detail_start = name_start + name.len() + middle.len();

                Some(CodeLabel {
                    code,
                    spans: vec![
                        CodeLabelSpan::code_range(name_start..name_start + name.len()),
                        CodeLabelSpan::code_range(detail_start..detail_start + detail.len()),
                    ],
                    filter_range: (0..name.len()).into(),
                })
            }
            Some(
                CompletionKind::TypeParameter
                | CompletionKind::Class
                | CompletionKind::Enum
                | CompletionKind::EnumMember,
            ) => Some(CodeLabel {
                code: String::new(),
                spans: vec![CodeLabelSpan::literal(&name, Some("type".to_string()))],
                filter_range: (0..name.len()).into(),
            }),
            Some(CompletionKind::Keyword) => Some(CodeLabel {
                code: String::new(),
                spans: vec![CodeLabelSpan::literal(&name, Some("keyword".to_string()))],
                filter_range: (0..name.len()).into(),
            }),
            Some(CompletionKind::Constant | CompletionKind::Value | CompletionKind::Variable) => {
                if let Some(detail) = completion.detail {
                    let middle = " : ";
                    let code = format!("{name}{middle}{detail}");
                    let detail_start = name.len() + middle.len();
                    Some(CodeLabel {
                        code,
                        spans: vec![
                            CodeLabelSpan::code_range(0..name.len()),
                            CodeLabelSpan::code_range(detail_start..detail_start + detail.len()),
                        ],
                        filter_range: (0..name.len()).into(),
                    })
                } else {
                    Some(CodeLabel {
                        code: name.clone(),
                        spans: vec![CodeLabelSpan::code_range(0..name.len())],
                        filter_range: (0..name.len()).into(),
                    })
                }
            }
            _ => None,
        }
    }
}

impl SailExtension {
    fn download_release_binary(&mut self) -> Result<String> {
        if let Some(cached_path) = &self.cached_binary_path {
            if std::path::Path::new(cached_path).exists() {
                return Ok(cached_path.clone());
            }
        }

        let release = zed::latest_github_release(
            SAIL_LSP_RELEASE_REPO,
            zed::GithubReleaseOptions {
                require_assets: true,
                pre_release: false,
            },
        )?;

        let (asset_name, binary_name) = release_asset_and_binary_name()?;
        let install_dir = format!("sail-lsp/{}", release.version);
        std::fs::create_dir_all(&install_dir)
            .map_err(|err| format!("failed to create install dir: {err}"))?;
        let install_path = format!("{install_dir}/{binary_name}");

        if !std::path::Path::new(&install_path).exists() {
            let asset = release
                .assets
                .iter()
                .find(|candidate| candidate.name == asset_name)
                .ok_or_else(|| {
                    format!(
                        "no prebuilt asset `{asset_name}` found in {} release {}",
                        SAIL_LSP_RELEASE_REPO, release.version
                    )
                })?;

            zed::download_file(
                &asset.download_url,
                &install_path,
                zed::DownloadedFileType::Uncompressed,
            )?;
            if !binary_name.ends_with(".exe") {
                zed::make_file_executable(&install_path)?;
            }
        }

        self.cached_binary_path = Some(install_path.clone());
        Ok(install_path)
    }
}

fn release_asset_and_binary_name() -> Result<(&'static str, &'static str)> {
    let (os, arch) = zed::current_platform();
    match (os, arch) {
        (zed::Os::Linux, zed::Architecture::X8664) => {
            Ok(("sail-lsp-x86_64-unknown-linux-gnu", "sail-lsp"))
        }
        (zed::Os::Mac, zed::Architecture::X8664) => {
            Ok(("sail-lsp-x86_64-apple-darwin", "sail-lsp"))
        }
        (zed::Os::Mac, zed::Architecture::Aarch64) => {
            Ok(("sail-lsp-aarch64-apple-darwin", "sail-lsp"))
        }
        (zed::Os::Windows, zed::Architecture::X8664) => {
            Ok(("sail-lsp-x86_64-pc-windows-msvc.exe", "sail-lsp.exe"))
        }
        _ => Err("unsupported platform for prebuilt sail-lsp binary".to_string()),
    }
}

zed::register_extension!(SailExtension);
