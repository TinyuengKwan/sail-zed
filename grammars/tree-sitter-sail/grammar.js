/**
 * Minimal Tree-sitter grammar for Sail.
 * Expanded subset with common declarations and expressions.
 */

const PREC = {
  OR: 1,
  AND: 2,
  EQ: 3,
  REL: 4,
  ADD: 5,
  MUL: 6,
  UNARY: 7,
  POSTFIX: 8,
  CALL: 9,
};

export default grammar({
  name: 'sail',

  conflicts: $ => [
    [$._expression, $.case_body_expression],
    [$._expression, $.let_in_expression],
    [$._expression, $.if_expression],
  ],

  extras: $ => [
    /\s/,
    $.comment,
  ],

  word: $ => $.identifier,

  rules: {
    source_file: $ => repeat($._declaration),

    _declaration: $ => choice(
      $.val_declaration,
      $.let_declaration,
      $.function_declaration,
      $.type_declaration,
      $.union_declaration,
      $.enum_declaration,
      $.struct_declaration,
      $.register_declaration,
      $.overload_declaration,
    ),

    // val add : int -> int -> int
    val_declaration: $ => seq(
      'val',
      field('name', $.identifier),
      ':',
      field('type', $.type_expression),
    ),

    // let x = expr
    let_declaration: $ => seq(
      'let',
      field('name', $.identifier),
      '=',
      field('value', $._expression),
    ),

    // function add(x, y) = x + y
    function_declaration: $ => seq(
      'function',
      field('name', $.identifier),
      field('parameters', $.parameter_list),
      '=',
      field('body', $._expression),
    ),

    // type word = int
    type_declaration: $ => seq(
      'type',
      field('name', $.identifier),
      '=',
      field('value', $.type_expression),
    ),

    // union instr = Nop | Add(int, int)
    union_declaration: $ => seq(
      'union',
      field('name', $.identifier),
      '=',
      field('constructor', $.constructor),
      repeat(seq('|', field('constructor', $.constructor))),
    ),

    // enum mode = { User, Machine, Supervisor }
    enum_declaration: $ => seq(
      'enum',
      field('name', $.identifier),
      '=',
      '{',
      optional(commaSep1(field('variant', $.identifier))),
      optional(','),
      '}',
    ),

    // struct cfg = { xlen : int, enable : bool }
    struct_declaration: $ => seq(
      'struct',
      field('name', $.identifier),
      '=',
      '{',
      optional(commaSep1($.field_type)),
      optional(','),
      '}',
    ),

    // register pc : int = 0
    register_declaration: $ => seq(
      'register',
      field('name', $.identifier),
      ':',
      field('type', $.type_expression),
      '=',
      field('value', $._expression),
    ),

    // overload size = { sizeof, bitsize }
    overload_declaration: $ => seq(
      'overload',
      field('name', $.identifier),
      '=',
      '{',
      optional(commaSep1(field('member', $.identifier))),
      optional(','),
      '}',
    ),

    constructor: $ => seq(
      field('name', $.identifier),
      optional(seq('(', commaSep1($.type_expression), ')')),
    ),

    field_type: $ => seq(
      field('name', $.identifier),
      ':',
      field('type', $.type_expression),
    ),

    parameter_list: $ => seq(
      '(',
      optional(commaSep1(field('parameter', $.identifier))),
      ')',
    ),

    type_expression: $ => choice(
      $.function_type,
      $._type_atom,
    ),

    function_type: $ => prec.right(seq(
      field('from', $._type_atom),
      '->',
      field('to', $.type_expression),
    )),

    _type_atom: $ => choice(
      $.identifier,
      $.type_application,
      $.tuple_type,
      $.parenthesized_type,
    ),

    type_application: $ => seq(
      field('name', $.identifier),
      '(',
      commaSep1(field('argument', $.type_expression)),
      ')',
    ),

    tuple_type: $ => seq(
      '(',
      commaSep2($.type_expression),
      optional(','),
      ')',
    ),

    parenthesized_type: $ => seq('(', $.type_expression, ')'),

    _expression: $ => choice(
      $.match_expression,
      $._non_match_expression,
    ),

    _non_match_expression: $ => choice(
      $.let_in_expression,
      $.if_expression,
      $.binary_expression,
      $.unary_expression,
      $.call_expression,
      $.field_expression,
      $.index_expression,
      $._atom_expression,
    ),

    let_in_expression: $ => prec.right(seq(
      'let',
      field('name', $.identifier),
      '=',
      field('value', $._non_match_expression),
      'in',
      field('body', $._non_match_expression),
    )),

    _atom_expression: $ => choice(
      $.parenthesized_expression,
      $.tuple_expression,
      $.list_expression,
      $.record_expression,
      $.identifier,
      $.number,
      $.string,
      $.bool,
    ),

    parenthesized_expression: $ => seq('(', $._expression, ')'),

    tuple_expression: $ => seq(
      '(',
      commaSep2($._expression),
      optional(','),
      ')',
    ),

    list_expression: $ => seq(
      '[',
      optional(commaSep1($._expression)),
      optional(','),
      ']',
    ),

    record_expression: $ => seq(
      '{',
      optional(commaSep1($.field_assignment)),
      optional(','),
      '}',
    ),

    field_assignment: $ => seq(
      field('name', $.identifier),
      '=',
      field('value', $._expression),
    ),

    if_expression: $ => prec.right(seq(
      'if',
      field('condition', $._non_match_expression),
      'then',
      field('consequence', $._non_match_expression),
      'else',
      field('alternative', $._non_match_expression),
    )),

    match_expression: $ => seq(
      'match',
      field('value', $._non_match_expression),
      'with',
      repeat1($.match_case),
    ),

    match_case: $ => seq(
      '|',
      field('pattern', $._pattern),
      '=>',
      field('body', $.case_body_expression),
    ),

    // Keep case bodies unambiguous: nested bare `match` should be parenthesized.
    case_body_expression: $ => $._non_match_expression,

    _pattern: $ => choice(
      $.wildcard_pattern,
      $.number,
      $.string,
      $.bool,
      $.constructor_pattern,
      $.tuple_pattern,
      $.list_pattern,
      $.identifier,
      $.parenthesized_pattern,
    ),

    wildcard_pattern: _ => '_',

    constructor_pattern: $ => prec(1, seq(
      field('name', $.identifier),
      optional(seq('(', commaSep1($._pattern), ')')),
    )),

    tuple_pattern: $ => seq('(', commaSep2($._pattern), optional(','), ')'),

    list_pattern: $ => seq('[', optional(commaSep1($._pattern)), optional(','), ']'),

    parenthesized_pattern: $ => seq('(', $._pattern, ')'),

    call_expression: $ => prec(PREC.CALL, seq(
      field('function', $.identifier),
      '(',
      optional(commaSep1(field('argument', $._expression))),
      ')',
    )),

    field_expression: $ => prec.left(PREC.POSTFIX, seq(
      field('target', $._expression),
      '.',
      field('field', $.identifier),
    )),

    index_expression: $ => prec.left(PREC.POSTFIX, seq(
      field('target', $._expression),
      '[',
      field('index', $._expression),
      ']',
    )),

    unary_expression: $ => prec(PREC.UNARY, seq(
      field('operator', choice('!', '-', '~')),
      field('operand', $._atom_expression),
    )),

    binary_expression: $ => choice(
      prec.left(PREC.OR, seq($._non_match_expression, '||', $._non_match_expression)),
      prec.left(PREC.AND, seq($._non_match_expression, '&&', $._non_match_expression)),
      prec.left(PREC.EQ, seq($._non_match_expression, '==', $._non_match_expression)),
      prec.left(PREC.EQ, seq($._non_match_expression, '!=', $._non_match_expression)),
      prec.left(PREC.REL, seq($._non_match_expression, '<', $._non_match_expression)),
      prec.left(PREC.REL, seq($._non_match_expression, '<=', $._non_match_expression)),
      prec.left(PREC.REL, seq($._non_match_expression, '>', $._non_match_expression)),
      prec.left(PREC.REL, seq($._non_match_expression, '>=', $._non_match_expression)),
      prec.left(PREC.ADD, seq($._non_match_expression, '+', $._non_match_expression)),
      prec.left(PREC.ADD, seq($._non_match_expression, '-', $._non_match_expression)),
      prec.left(PREC.MUL, seq($._non_match_expression, '*', $._non_match_expression)),
      prec.left(PREC.MUL, seq($._non_match_expression, '/', $._non_match_expression)),
    ),

    identifier: _ => /[A-Za-z_][A-Za-z0-9_']*/,
    number: _ => /[0-9]+/,
    bool: _ => choice('true', 'false'),
    string: _ => /"([^"\\]|\\.)*"/,

    comment: _ => token(choice(
      seq('//', /[^\n]*/),
      seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/'),
    )),
  },
});

function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}

function commaSep2(rule) {
  return seq(rule, ',', rule, repeat(seq(',', rule)));
}
