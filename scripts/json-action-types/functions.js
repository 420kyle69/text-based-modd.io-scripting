import { convert_JSON_function_to_AST_node, convert_to_AST_object_or_call_expression } from '../ast-json-converters.js';
import isValidIdentifier from '../utils/valid-identifier.js';

// exported functions return AST nodes of type *-Expression.

export function calculate(JSON_function) {
  const [{ operator }, left, right] = JSON_function.items;
  return {
    type: 'BinaryExpression',
    left: convert_JSON_function_to_AST_node(left),
    operator,
    right: convert_JSON_function_to_AST_node(right)
  };
}

export function getVariable(JSON_function) {
  if (isValidIdentifier(JSON_function.variableName)) {
    return {
      type: 'Identifier',
      name: JSON_function.variableName
    };
  }
  return convert_to_AST_object_or_call_expression(JSON_function, 'function');
}