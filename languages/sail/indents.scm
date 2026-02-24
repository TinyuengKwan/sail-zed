[
  (function_declaration)
  (let_declaration)
  (let_in_expression)
  (if_expression)
  (match_expression)
  (match_case)
  (union_declaration)
  (struct_declaration)
  (enum_declaration)
  (overload_declaration)
  (record_expression)
  (tuple_expression)
  (list_expression)
  (parameter_list)
] @indent

(_ "{" "}" @end) @indent
(_ "[" "]" @end) @indent
(_ "(" ")" @end) @indent

(match_case "|" @start "=>" @end) @indent
