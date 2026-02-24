# tree-sitter-sail (embedded)

This is a minimal Tree-sitter grammar for Sail, embedded inside the `sail-zed` extension.

## Covered subset

- Declarations: `val`, `let`, `function`, `type`, `union`, `enum`, `struct`, `register`, `overload`
- Types: identifiers, right-associative `->`, tuple types, type application
- Expressions: `let ... in`, literals, calls, binary/unary operators, field/index access, records/lists/tuples, `if ... then ... else ...`, `match ... with`
- Patterns: identifier, wildcard, constructor/tuple/list/parenthesized patterns
- Comments: `// ...` and `/* ... */`

## Local development

```bash
source ~/.nvm/nvm.sh
tree-sitter generate
tree-sitter test
```
