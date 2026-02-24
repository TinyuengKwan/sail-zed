# Zed Sail

A [Sail](https://github.com/rems-project/sail) extension for [Zed](https://zed.dev).

## Features

- Recognizes `.sail` files
- Basic language configuration (comments, brackets, autoclose pairs)
- Embedded Tree-sitter Sail grammar (minimal subset)
- Syntax highlighting for declarations, types, constructors, and expressions

## Notes

This extension currently focuses on editor language support. If/when a stable Sail language server is available, LSP integration can be added in `src/sail.rs`.

The embedded grammar lives at `grammars/tree-sitter-sail`.

## Development

To develop this extension, see the [Developing Extensions](https://zed.dev/docs/extensions/developing-extensions) docs.

## Use In Zed

1. Open Zed and run the command palette (`Ctrl+Shift+P`).
2. Run `Extensions: Install Dev Extension`.
3. Select this folder: `/home/lunarwall/workplace/sail-zed`.
4. Open any `.sail` file, then choose language mode `Sail` if Zed does not auto-detect it.

To iterate on the embedded grammar:

```bash
cd grammars/tree-sitter-sail
source ~/.nvm/nvm.sh
tree-sitter generate
tree-sitter test
```
