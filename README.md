# Zed Sail

[Sail](https://github.com/rems-project/sail) language support for [Zed](https://zed.dev).

## Language server startup order

The extension resolves the language server in this order:

1. `lsp.sail-lsp.binary.path` / `lsp.sail_lsp.binary.path` (user override)
2. `sail_server` from `PATH`
3. `sail-lsp` from `PATH`
4. Download the latest matching prebuilt binary from `TinyuengKwan/sail-lsp` GitHub Releases

Downloaded binaries are cached by release version and reused on next startup.

## Configuration

```json
{
  "lsp": {
    "sail-lsp": {
      "binary": {
        "path": "/absolute/path/to/sail-lsp",
        "arguments": []
      },
      "settings": {}
    }
  }
}
```

The extension forwards:

- `initialization_options` to LSP initialize options
- `settings` to workspace configuration

## Development

To develop this extension, see the [Developing Extensions](https://zed.dev/docs/extensions/developing-extensions) section of the Zed docs.
