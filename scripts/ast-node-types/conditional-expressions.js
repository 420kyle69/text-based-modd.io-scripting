import * as ExpressionTypes from './expressions.js';
import * as ConditionalExpressionTypes from './conditional-expressions.js';
import { defaultWarningHandler } from '../utils/warnings.js';

// exported functions return [{ operandType, operator }, left, right] arrays for JSON actions. relates to ConditionComponent

export function LogicalExpression(expression) {
  let operandType, operator, left, right;
  if (expression.left.type in ConditionalExpressionTypes) {
    left = ConditionalExpressionTypes[expression.left.type](expression.left);
  } else {
    defaultWarningHandler.generateWarning('Conversion warning: Unsupported left operand type ' + expression.left.type + ' in logical expression (line ' + expression.left.loc.start.line + ')');
  }
  if (expression.right.type in ConditionalExpressionTypes) {
    right = ConditionalExpressionTypes[expression.right.type](expression.right);
  } else {
    defaultWarningHandler.generateWarning('Conversion warning: Unsupported right operand type ' + expression.right.type + ' in logical expression (line ' + expression.right.loc.start.line + ')');
  }
  switch (expression.operator) {
    case '&&':
      operandType = 'and';
      operator = 'AND';
      break;
    case '||':
      operandType = 'or';
      operator = 'OR';
      break;
    default:
      defaultWarningHandler.generateWarning('Conversion warning: Unsupported operator ' + expression.operator + ' in logical expression (line ' + expression.loc.start.line + ')');
  }
  return [{ operandType, operator }, left, right];
}

export function BinaryExpression(expression) {
  let operandType = 'boolean', // any
    operator = expression.operator,
    left,
    right;
  if (expression.left.type in ExpressionTypes) {
    left = ExpressionTypes[expression.left.type](expression.left);
  } else {
    defaultWarningHandler.generateWarning('Conversion warning: Unsupported left operand type ' + expression.left.type + ' in binary expression (line ' + expression.left.loc.start.line + ')');
  }
  if (expression.right.type in ExpressionTypes) {
    right = ExpressionTypes[expression.right.type](expression.right);
  } else {
    defaultWarningHandler.generateWarning('Conversion warning: Unsupported right operand type ' + expression.right.type + ' in binary expression (line ' + expression.right.loc.start.line + ')');
  }
  switch (expression.operator) {
    case '==':
    case '!=':
    case '<':
    case '>':
    case '<=':
    case '>=':
      break;
    default:
      defaultWarningHandler.generateWarning('Conversion warning: Unsupported operator for conditions ' + expression.operator + ' in binary expression (line ' + expression.loc.start.line + ')');
  }
  return [{ operandType, operator }, left, right];
}