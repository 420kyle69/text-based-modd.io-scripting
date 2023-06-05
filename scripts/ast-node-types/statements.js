import { convert_AST_node_to_JSON_actions } from '../ast-json-converters.js';
import * as ExpressionStatementTypes from './expression-statements.js';
import * as ExpressionTypes from './expressions.js';
import * as ConditionalExpressionTypes from './conditional-expressions.js';
import { defaultWarningHandler } from '../utils/warnings.js';

// exported functions return arrays of JSON actions. relates to ActionComponent

export function BlockStatement(AST_node) {
  return AST_node.body.flatMap(convert_AST_node_to_JSON_actions);
}

export function EmptyStatement() {
  return [];
}

export function ExpressionStatement(AST_node) {
  if (AST_node.expression.type in ExpressionStatementTypes) {
    return [ExpressionStatementTypes[AST_node.expression.type](AST_node.expression)];
  }
  defaultWarningHandler.generateWarning('Conversion warning: Unsupported expression statement type ' + AST_node.expression.type + ' (line ' + AST_node.expression.loc.start.line + ')');
  return [null];
}

export function IfStatement(AST_node) {
  const JSON_action = {
    type: 'condition',
    conditions: [],
    then: [],
    else: []
  };
  if (AST_node.test.type in ConditionalExpressionTypes) {
    JSON_action.conditions = ConditionalExpressionTypes[AST_node.test.type](AST_node.test);
  } else {
    defaultWarningHandler.generateWarning('Conversion warning: Unsupported test type ' + AST_node.test.type + ' in if statement (line ' + AST_node.test.loc.start.line + ')');
  }
  JSON_action.then = convert_AST_node_to_JSON_actions(AST_node.consequent);
  if (AST_node.alternate) {
    JSON_action.else = convert_AST_node_to_JSON_actions(AST_node.alternate);
  }
  return [JSON_action];
}

export function WhileStatement(AST_node) {
  if (AST_node.test.type in ConditionalExpressionTypes) {
    return [{
      type: 'while',
      conditions: ConditionalExpressionTypes[AST_node.test.type](AST_node.test),
      actions: convert_AST_node_to_JSON_actions(AST_node.body)
    }];
  }
  defaultWarningHandler.generateWarning('Conversion warning: Unsupported test type ' + AST_node.test.type + ' in while statement (line ' + AST_node.test.loc.start.line + ')');
  return [{
    type: 'while',
    conditions: [],
    actions: convert_AST_node_to_JSON_actions(AST_node.body)
  }];
}

export function ForStatement(AST_node) {
  // TODO: add more validations
  return [{
    type: 'for',
    variableName: AST_node.init?.left?.name,
    start: ExpressionTypes[AST_node.init?.right?.type]?.(AST_node.init.right),
    stop: ExpressionTypes[AST_node.test?.right?.type]?.(AST_node.test.right),
    actions: convert_AST_node_to_JSON_actions(AST_node.body)
  }];
}

export function ContinueStatement() {
  return [{
    type: 'continue'
  }];
}

export function BreakStatement() {
  return [{
    type: 'break'
  }];
}

export function ReturnStatement() {
  return [{
    type: 'return'
  }];
}