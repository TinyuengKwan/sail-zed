; Keywords
[
  "val" "let" "in" "function" "type" "union" "enum" "struct" "register" "overload"
  "if" "then" "else"
  "match" "with"
] @keyword

; Operators and delimiters
[
  "=>"
  "->"
  "|"
  "=="
  "!="
  "<"
  "<="
  ">"
  ">="
  "&&"
  "||"
  "+"
  "-"
  "*"
  "/"
  "~"
  "!"
  ":"
  "="
  "."
  ","
] @operator

; Types and constructors
(type_declaration name: (identifier) @type)
(union_declaration name: (identifier) @type)
(enum_declaration name: (identifier) @type)
(struct_declaration name: (identifier) @type)
(constructor name: (identifier) @constructor)
(constructor_pattern name: (identifier) @constructor)

; Functions and variables
(function_declaration name: (identifier) @function)
(val_declaration name: (identifier) @function)
(call_expression function: (identifier) @function.call)

(let_declaration name: (identifier) @variable)
(let_in_expression name: (identifier) @variable)
(parameter_list parameter: (identifier) @parameter)
(field_type name: (identifier) @property)
(field_assignment name: (identifier) @property)
(field_expression field: (identifier) @property)

; Literals and comments
(number) @number
(string) @string
(bool) @boolean
(comment) @comment
(wildcard_pattern) @punctuation.special
