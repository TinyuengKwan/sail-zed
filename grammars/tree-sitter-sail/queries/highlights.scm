"val" @keyword
"let" @keyword
"function" @keyword
"type" @keyword
"union" @keyword
"if" @keyword
"then" @keyword
"else" @keyword
"match" @keyword
"with" @keyword

[
  "=>"
  "->"
  "|"
  "=="
  "!="
  "&&"
  "||"
  "+"
  "-"
  "*"
  "/"
  ":"
  "="
  ","
] @operator

(type_declaration name: (identifier) @type)
(union_declaration name: (identifier) @type)
(constructor name: (identifier) @constructor)
(constructor_pattern name: (identifier) @constructor)

(function_declaration name: (identifier) @function)
(val_declaration name: (identifier) @function)
(call_expression function: (identifier) @function.call)

(let_declaration name: (identifier) @variable)
(parameter_list parameter: (identifier) @parameter)

(identifier) @variable
(number) @number
(string) @string
(comment) @comment
(wildcard_pattern) @punctuation.special
