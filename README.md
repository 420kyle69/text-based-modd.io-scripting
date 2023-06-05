Text-based Modd.io Scripting converts Javascript syntax to JSON script format for Modd.io.

This repository contains documentation and scripts for the client-side only prototype of Text-based Modd.io Scripting.

To do:
---
- add support for disabled and collapsed actions
  - don't specially convert action if it has other properties

- add shorthand for updating entity variables e.g. `set Points of entity as (Points of entity + 1)`

- define every modd.io function with its respective signature (a lot)
  - add function signature hinting

- make operandType depend on operands (src/ast-node-types/conditional-expressions.js:34)
  - make operandType `number` if operator is something like >=

- make comments convert to modd.io comments (maybe?)

- fix `calculate` function not being included in the api reference

- add more validations (src/ast-node-types/statements.js:60)
- replace with setVariable() if variableName is not a valid literal (src/json-action-types/actions.js:68)
- make sure ContinueStatement isn't being provided when CallExpression ({ type: 'continue' }) is needed (src/json-action-types/actions.js:105)