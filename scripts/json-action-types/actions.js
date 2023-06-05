import { convert_JSON_action_to_AST_node, convert_JSON_function_to_AST_node } from '../ast-json-converters.js';
import isValidIdentifier from '../utils/valid-identifier.js';

// exported functions return AST nodes of type *-Statement. some functions are prefixed with underscores so they can be exported with names that are reserved keywords like 'while'

// utility used in 'condition' and 'while'
function createTestFromConditionsArray([{ operator }, left, right]) {
  const test = {
    type: null,
    left: null,
    operator: null,
    right: null
  };
  switch (operator) {
    case 'AND':
      test.type = 'LogicalExpression';
      test.operator = '&&';
      test.left = createTestFromConditionsArray(left);
      test.right = createTestFromConditionsArray(right);
      break;
    case 'OR':
      test.type = 'LogicalExpression';
      test.operator = '||';
      test.left = createTestFromConditionsArray(left);
      test.right = createTestFromConditionsArray(right);
      break;
    default:
      test.type = 'BinaryExpression';
      test.operator = operator;
      test.left = convert_JSON_function_to_AST_node(left);
      test.right = convert_JSON_function_to_AST_node(right);
  }
  return test;
}

export function condition(JSON_action) {
  const AST_node = {
    type: 'IfStatement',
    test: createTestFromConditionsArray(JSON_action.conditions),
    consequent: {
      type: 'BlockStatement',
      body: JSON_action.then.map(convert_JSON_action_to_AST_node)
    },
    alternate: null
  };
  if (JSON_action.else.length) {
    AST_node.alternate = {
      type: 'BlockStatement',
      body: JSON_action.else.map(convert_JSON_action_to_AST_node)
    };
  }
  return AST_node;
}

function _while(JSON_action) {
  return {
    type: 'WhileStatement',
    test: createTestFromConditionsArray(JSON_action.conditions),
    body: {
      type: 'BlockStatement',
      body: JSON_action.actions.map(convert_JSON_action_to_AST_node)
    }
  };
}

function _for(JSON_action) {
  const { variableName, start, stop, actions } = JSON_action;
  return {
    type: 'ForStatement',
    init: {
      type: 'AssignmentExpression',
      // TODO: replace with setVariable() if variableName is not a valid literal
      left: {
        type: 'Identifier',
        name: variableName
      },
      operator: '=',
      right: convert_JSON_function_to_AST_node(start)
    },
    test: {
      type: 'BinaryExpression',
      left: {
        type: 'Identifier',
        name: variableName
      },
      operator: '<=',
      right: convert_JSON_function_to_AST_node(stop)
    },
    update: {
      type: 'AssignmentExpression',
      left: {
        type: 'Identifier',
        name: variableName
      },
      operator: '+=',
      right: {
        type: 'Literal',
        value: 1
      }
    },
    body: {
      type: 'BlockStatement',
      body: actions.map(convert_JSON_action_to_AST_node)
    }
  };
}

function _continue() {
  // TODO: make sure ContinueStatement isn't being provided when ({ type: 'continue' }) is needed
  // solution for now:
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'ObjectExpression',
      properties: [{
        key: {
          type: 'Identifier',
          name: 'type'
        },
        value: {
          type: 'Literal',
          value: 'continue'
        }
      }]
    }
  };
}

function _break() {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'ObjectExpression',
      properties: [{
        key: {
          type: 'Identifier',
          name: 'type'
        },
        value: {
          type: 'Literal',
          value: 'break'
        }
      }]
    }
  };
}

function _return() {
  return {
    type: 'ReturnStatement'
  };
}

export function setVariable(JSON_action) {
  if (isValidIdentifier(JSON_action.variableName)) {
    return {
      type: 'ExpressionStatement',
      expression: {
        type: 'AssignmentExpression',
        left: {
          type: 'Identifier',
          name: JSON_action.variableName
        },
        operator: '=',
        right: convert_JSON_function_to_AST_node(JSON_action.value)
      }
    };
  }
  return convert_to_AST_object_or_call_expression(JSON_action, 'action');
}

export function increaseVariableByNumber(JSON_action) {
  if (isValidIdentifier(JSON_action.variable)) {
    return {
      type: 'ExpressionStatement',
      expression: {
        type: 'AssignmentExpression',
        left: {
          type: 'Identifier',
          name: JSON_action.variable
        },
        operator: '+=',
        right: convert_JSON_function_to_AST_node(JSON_action.number)
      }
    };
  }
  return convert_to_AST_object_or_call_expression(JSON_action, 'action');
}

export function decreaseVariableByNumber(JSON_action) {
  if (isValidIdentifier(JSON_action.variable)) {
    return {
      type: 'ExpressionStatement',
      expression: {
        type: 'AssignmentExpression',
        left: {
          type: 'Identifier',
          name: JSON_action.variable
        },
        operator: '-=',
        right: convert_JSON_function_to_AST_node(JSON_action.number)
      }
    };
  }
  return convert_to_AST_object_or_call_expression(JSON_action, 'action');
}

export {
  _while as while,
  _for as for,
  _continue as continue,
  _break as break,
  _return as return
};