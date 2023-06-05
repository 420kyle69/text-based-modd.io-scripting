import * as StatementTypes from './ast-node-types/statements.js';
import * as speciallyConvertedActionTypes from './json-action-types/actions.js';
import * as speciallyConvertedFunctionTypes from './json-action-types/functions.js';
import isValidIdentifier from './utils/valid-identifier.js';
import { defaultWarningHandler } from './utils/warnings.js';

const requiresActionBody = [
  'repeat',
  'setTimeOut',
  'forAllUnits',
  'forAllPlayers',
  'forAllItems',
  'forAllProjectiles',
  'forAllDebris',
  'forAllEntities',
  'forAllRegions',
  'forAllUnitTypes',
  'forAllItemTypes'
];

export function convert_AST_node_to_JSON_actions(AST_node) {
  if (AST_node.type in StatementTypes) {
    return StatementTypes[AST_node.type](AST_node);
  } else {
    defaultWarningHandler.generateWarning('Conversion warning: Unsupported statement type ' + AST_node.type + ' (line ' + AST_node.loc.start.line + ')');
    return [null];
  }
}

export function convert_JSON_action_to_AST_node(JSON_action) {
  // if the Javascript translation of this action is a supported statement type
  if (JSON_action.type in speciallyConvertedActionTypes) {
    return speciallyConvertedActionTypes[JSON_action.type](JSON_action);
  }
  // else fall back to running the action in object expression / function call format
  if (JSON_action instanceof Array) {
    return {
      type: 'ExpressionStatement',
      expression: {
        type: 'ArrayExpression',
        elements: JSON_action.map(convert_JSON_function_to_AST_node)
      }
    };
  }
  if (requiresActionBody.includes(JSON_action.type) && JSON_action.actions) {
    const AST_node = convert_to_AST_object_or_call_expression(JSON_action, 'action'),
      { properties } = AST_node.expression.arguments[0], // note: call expression will always have an argument since JSON_action has actions property
      actionsProperty = properties.find(property => property.key.type === 'Identifier' && property.key.name === 'actions');
    if (actionsProperty) {
      actionsProperty.value = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: {
          type: 'BlockStatement',
          body: JSON_action.actions.map(convert_JSON_action_to_AST_node)
        }
      };
    } else {
      properties.push({
        key: {
          type: 'Identifier',
          name: 'actions'
        },
        value: {
          type: 'ArrowFunctionExpression',
          params: [],
          body: {
            type: 'BlockStatement',
            body: JSON_action.actions.map(convert_JSON_action_to_AST_node)
          }
        }
      });
    }
    return AST_node;
  }
  return convert_to_AST_object_or_call_expression(JSON_action, 'action');
}

export function convert_JSON_function_to_AST_node(value) {
  if (value?.function in speciallyConvertedFunctionTypes) {
    return speciallyConvertedFunctionTypes[value.function](value);
  }
  if (typeof value !== 'object' || value === null) {
    if (typeof value === 'number' && value < 0) {
      return {
        type: 'UnaryExpression',
        operator: '-',
        argument: {
          type: 'Literal',
          value: -value
        }
      };
    }
    return {
      type: 'Literal',
      value
    };
  }
  if (value instanceof Array) {
    return {
      type: 'ArrayExpression',
      elements: value.map(convert_JSON_function_to_AST_node)
    };
  }
  return convert_to_AST_object_or_call_expression(value, 'function');
}

export function convert_to_AST_object_or_call_expression(object, type) {
  const typeKey = type === 'action' ? 'type' : 'function',
    configProperties = Object.keys(object).filter(key => key !== typeKey),
    objectExpression = {
      type: 'ObjectExpression',
      properties: configProperties.map(key => ({
        key: isValidIdentifier(key) ? {
          type: 'Identifier',
          name: key
        } : {
          type: 'Literal',
          value: key
        },
        value: convert_JSON_function_to_AST_node(object[key])
      }))
    };
  if (!Object.hasOwn(object, typeKey)) {
    if (type === 'function') {
      return objectExpression;
    }
    return {
      type: 'ExpressionStatement',
      expression: objectExpression
    };
  }
  const callExpression = {
    type: 'CallExpression',
    arguments: configProperties.length ? [objectExpression] : [],
    callee: {
      type: 'Identifier',
      name: object[typeKey]
    }
  };
  if (type === 'function') {
    return callExpression;
  }
  return {
    type: 'ExpressionStatement',
    expression: callExpression
  };
}