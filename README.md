# Zed Sail

Sail language support for the Zed editor.

## What’s Included

- `.sail` file detection
- Basic language configuration (comments, brackets, auto-close pairs)
- Embedded Tree-sitter Sail grammar (focused subset)
- Syntax highlighting for declarations, types, constructors, and expressions

## Install (Developer)

1. Open Zed.
2. Command palette: `Extensions: Install Dev Extension`.
3. Select this folder: `/home/lunarwall/workplace/sail-zed`.
4. Open a `.sail` file. If needed, set the language mode to `Sail`.

## Development

Zed extension docs: see `https://zed.dev/docs/extensions/developing-extensions`.

Build the embedded grammar:

```bash
cd grammars/tree-sitter-sail
source ~/.nvm/nvm.sh
tree-sitter generate
tree-sitter test
```

## Project Layout

- `src/sail.rs` — Zed extension entrypoint
- `grammars/tree-sitter-sail` — Embedded Tree-sitter grammar
- `languages/sail` — Language configuration

## Notes

This repository currently focuses on editor language support. If a stable Sail language server becomes available, LSP integration can be added in `src/sail.rs`.

## License

Apache-2.0
