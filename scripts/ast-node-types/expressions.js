import { convert_AST_node_to_JSON_actions } from '../ast-json-converters.js';
import * as ExpressionTypes from './expressions.js';
import { defaultWarningHandler } from '../utils/warnings.js';

// exported functions return JSON functions (except bottom 2). relates to VariableComponent

export function Literal(expression) {
  if (typeof expression.value !== 'number' && typeof expression.value !== 'string' && typeof expression.value !== 'boolean' && expression.value !== null) {
    defaultWarningHandler.generateWarning('Conversion warning: Unsupported literal value type ' + typeof expression.value + ' (line ' + expression.loc.start.line + ')');
  }
  return expression.value;
}

export function Identifier(expression) {
  return {
    function: 'getVariable',
    variableName: expression.name
  };
}

export function CallExpression(expression) {
  if (expression.callee.type !== 'Identifier') {
    defaultWarningHandler.generateWarning('Conversion warning: Unsupported callee type ' + expression.callee.type + ' in call expression statement (line ' + expression.callee.loc.start.line + ')');
    return null;
  }
  if (expression.arguments.length === 0) {
    return {
      function: expression.callee.name,
    };
  }
  if (expression.arguments[0].type !== 'ObjectExpression') {
    defaultWarningHandler.generateWarning('Conversion warning: Call expressions must be provided with an argument of type ObjectExpression (line ' + expression.arguments[0].loc.start.line + ')');
    return null;
  }
  return Object.assign(
    {
      function: expression.callee.name,
    },
    ObjectExpression(expression.arguments[0])
  );
}

export function BinaryExpression(expression) {
  let left, right;
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
    case '+':
    case '-':
    case '*':
    case '/':
    case '%':
      break;
    default:
      defaultWarningHandler.generateWarning('Conversion warning: Unsupported operator for math ' + expression.operator + ' in binary expression (line ' + expression.loc.start.line + ')');
  }
  return {
    function: 'calculate',
    items: [
      {
        operator: expression.operator
      },
      left,
      right
    ]
  };
}

export function UnaryExpression(expression) {
  switch (expression.operator) {
    case '-':
      if (expression.argument.type !== 'Literal') {
        defaultWarningHandler.generateWarning('Conversion warning: Unsupported argument type ' + expression.argument.type + ' in unary expression (line ' + expression.argument.loc.start.line + ')');
        return null;
      }
      if (typeof expression.argument.value !== 'number') {
        defaultWarningHandler.generateWarning('Conversion warning: Unsupported literal value type ' + typeof expression.argument.value + ' in unary expression (line ' + expression.argument.loc.start.line + ')');
        return null;
      }
      return -expression.argument.value;
  }
  defaultWarningHandler.generateWarning('Conversion warning: Unsupported operator ' + expression.operator + ' in unary expression (line ' + expression.loc.start.line + ')');
  return null;
}

export function ObjectExpression(expression) {
  const props = new Map();
  for (const { key, value, loc } of expression.properties) {
    if (key.type !== 'Identifier' && key.type !== 'Literal' && typeof key.value !== 'string') {
      defaultWarningHandler.generateWarning('Conversion warning: Object expressions should have identifier or string literal keys (line ' + loc.start.line + ')');
      continue;
    }
    if (value.type in ExpressionTypes) {
      props.set(key.type === 'Identifier' ? key.name : key.value, ExpressionTypes[value.type](value));
    } else {
      defaultWarningHandler.generateWarning('Conversion warning: Unsupported property value type ' + value.type + ' in object expression (line ' + loc.start.line + ')');
    }
  }
  return Object.fromEntries(props.entries());
}

export function ArrayExpression(expression) {
  return expression.elements.map(element => {
    if (element.type in ExpressionTypes) {
      return ExpressionTypes[element.type](element);
    }
    defaultWarningHandler.generateWarning('Conversion warning: Unsupported element type ' + element.type + ' in array expression (line ' + element.loc.start.line + ')');
    return null;
  });
}

// returns an array of JSON actions to be used in 'actions' property of loop actions.
export function FunctionExpression(expression) {
  return convert_AST_node_to_JSON_actions(expression.body);
}

export { FunctionExpression as ArrowFunctionExpression };