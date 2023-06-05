import * as ExpressionTypes from './expressions.js';
import { defaultWarningHandler } from '../utils/warnings.js';

// exported functions return JSON actions. relates to ActionComponent

export function AssignmentExpression(expression) {
  let variableName;
  if (expression.left.type === 'Identifier') {
    variableName = expression.left.name;
  } else {
    defaultWarningHandler.generateWarning('Conversion warning: Unsupported left operand type ' + expression.left.type + ' in assignment expression statement (line ' + expression.left.loc.start.line + ')');
  }
  let value;
  if (expression.right.type in ExpressionTypes) {
    value = ExpressionTypes[expression.right.type](expression.right);
  } else {
    defaultWarningHandler.generateWarning('Conversion warning: Unsupported right operand type ' + expression.right.type + ' in assignment expression statement (line ' + expression.right.loc.start.line + ')');
  }
  switch (expression.operator) {
    case '=':
      return {
        type: 'setVariable',
        value,
        variableName
      };
    case '+=':
      return {
        type: 'increaseVariableByNumber',
        variable: variableName,
        number: value
      };
    case '-=':
      return {
        type: 'decreaseVariableByNumber',
        variable: variableName,
        number: value
      };
  }
  defaultWarningHandler.generateWarning('Conversion warning: Unsupported operator ' + expression.operator + ' in assignment expression statement (line ' + expression.loc.start.line + ')');
  return null;
}

export function CallExpression(expression) {
  if (expression.callee.type !== 'Identifier') {
    defaultWarningHandler.generateWarning('Conversion warning: Unsupported callee type ' + expression.callee.type + ' in call expression statement (line ' + expression.callee.loc.start.line + ')');
    return null;
  }
  if (expression.arguments.length === 0) {
    return {
      type: expression.callee.name,
    };
  }
  if (expression.arguments[0].type !== 'ObjectExpression') {
    defaultWarningHandler.generateWarning('Conversion warning: Call expression statements must be provided with an argument of type ObjectExpression (line ' + expression.arguments[0].loc.start.line + ')');
    return null;
  }
  return Object.assign(
    {
      type: expression.callee.name,
    },
    ExpressionTypes.ObjectExpression(expression.arguments[0])
  );
}

export function UpdateExpression(expression) {
  let variableName;
  if (expression.argument.type === 'Identifier') {
    variableName = expression.argument.name;
  } else {
    defaultWarningHandler.generateWarning('Conversion warning: Unsupported argument type ' + expression.argument.type + ' in update expression statement (line ' + expression.argument.loc.start.line + ')');
  }
  switch (expression.operator) {
    case '++':
      return {
        type: 'increaseVariableByNumber',
        variable: variableName,
        number: 1
      };
    case '--':
      return {
        type: 'decreaseVariableByNumber',
        variable: variableName,
        number: 1
      };
  }
  defaultWarningHandler.generateWarning('Conversion warning: Unsupported operator ' + expression.operator + ' in update expression statement (line ' + expression.loc.start.line + ')');
  return null;
}

export { ObjectExpression, ArrayExpression } from './expressions.js';