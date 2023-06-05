<title>Guide</title>

A guide to Text-based Modd.io Scripting.
[Docs](#docs)

---

# Actions
Actions are called by a function call with an optional configuration object passed as its argument. The object's properties will be applied to the action in the JSON output.

Example:
```js
sendChatMessage({
    message: 'Hi!'
});
```
All valid action names can be found in the source code of the Taro game engine: [ActionComponent.js](https://github.com/moddio/taro/blob/master/src/gameClasses/components/script/ActionComponent.js)

The configuration properties that should be passed to each action can be found [here](#api-actions).

# Functions
Functions are run in a similar way to actions:
```js
getOwner({ entity: getTriggeringUnit() })
```
<div class="alert alert-warning" role="alert">
Since there is no action/function name verification, you may easily mix up actions and functions. Make sure that you are only calling actions in the top-level of a script or in action bodies and you are only calling functions in arguments provided to actions or other functions.
</div>

Example:
```js
sendChatMessageToPlayer({
    message: 'Hi!',
    player: getOwner({ entity: getTriggeringUnit() })
});
```
All valid function names can be found in the source code of the Taro game engine: [VariableComponent.js](https://github.com/moddio/taro/blob/master/src/gameClasses/components/script/VariableComponent.js)

The configuration properties that should be passed to each function can be found [here](#api-functions).

# Setting variables
Variables cannot be declared in Modd.io, so use global variables instead. To access global variables, use identifiers. The increment (`++`) and decrement (`--`) operators can be used to change a number variable's value by 1. Here are the four global variable accessor functions and their respective shorthands:
```js
getVariable({ variableName: 'myVar' })
// alternatively:
myVar

setVariable({
    value: 'Hi!',
    variableName: 'myVar'
});
// alternatively:
myVar = 'Hi!';

increaseVariableByNumber({
    variable: 'myVar',
    number: 1
});
// alternatively:
myVar += 1;
// or
myVar++;

decreaseVariableByNumber({
    variable: 'myVar',
    number: 1
});
// alternatively:
myVar -= 1;
// or
myVar--;
```

# Triggers
Triggers can be defined in `@trigger` tags of JSDoc comments.

Example:
```js
/**
 * Triggers:
 * @trigger gameStart
 */
sendChatMessage({
    message: 'Game started.'
});
```
All valid trigger names can be found [here](#api-triggers).

# Script names
The script name is set by `@scriptName` tags of JSDoc comments.

Example:
```js
/**
 * Triggers:
 * @trigger playerJoinsGame
 *
 * @scriptName player joins
 */
```

# Conditionals
If statements and while loops are written similarly to how they are in Javascript. However, their test must be a comparison expression or logical operator because Modd.io only supports those.
```js
if (true); // not supported
if (!false); // not supported
if (true == true); // supported
if (true == true || true != false); // supported
```
The supported operators are `&&`, `||`, `==`, `!=`, `<`, `>`, `<=`, and `>=`.

Examples:
```js
/**
 * Triggers:
 * @trigger unitAttributeBecomesZero
 *
 * @scriptName unit death
 */
if (getAttributeTypeOfAttribute({ entity: getTriggeringAttribute() }) == 'health') {
    destroyEntity({
        entity: getTriggeringUnit()
    });
}
```
```js
while (getNumberOfUnitsOfUnitType({ unitType: 'pig' }) < 5) {
    createUnitAtPosition({
        unitType: 'pig',
        entity: AI_neutral,
        position: getRandomPositionInRegion({ region: getEntireMapRegion() }),
        angle: 0
    });
}
```

# Math operations
Binary expressions will be converted to the `calculate` function in the JSON output. The supported operators are `+`, `-`, `*`, `/`, and `%`.

Example:
```js
setPlayerAttribute({
    attribute: 'points',
    entity: getTriggeringPlayer(),
    value: getPlayerAttribute({ attribute: 'points', entity: getTriggeringPlayer() }) + 1
});
```

# For loop
For loops are written similarly to how they are in Javascript. However, they must follow the `for (variable = start, variable <= stop, variable += 1)` format, because that is how the `for` action is coded to run in Modd.io \([ActionComponent.js:954](https://github.com/moddio/taro/blob/master/src/gameClasses/components/script/ActionComponent.js#L954)\). The initializer statement should not declare a variable, but rather set a global variable to the starting number. The test should be a 'less than or equal to' comparison of the aforementioned variable to the number to stop at. The update expression should increment that variable by 1.

Example:
```js
for (i = 0; i <= getStringArrayLength({ string: myArray }) - 1; i += 1) {
    sendChatMessage({
        message: getStringArrayElement({ number: i, string: myArray })
    });
}
```

# Providing a loop body for actions other than `for`
Function expressions are converted into bodies of actions in the JSON output to be used as the `actions` parameter in the `repeat`, `setTimeOut`, `forAllUnits`, `forAllPlayers`, `forAllItems`, `forAllProjectiles`, `forAllDebris`, `forAllEntities`, `forAllRegions`, `forAllUnitTypes`, and `forAllItemTypes` actions.

Example:
```js
forAllUnits({
    unitGroup: allUnits(),
    actions: () => {
        moveEntity({
            entity: selectedUnit(),
            position: getRandomPositionInRegion({ region: getEntireMapRegion() })
        });
    }
});
```

# Breaking out of loops in actions other than `for`
Since the action bodies provided to actions other than `for` are functions, it is invalid Javascript syntax to have `break` statements in the bodies. To break out those loops, insert an object expression that will be converted to an action, and change its type to `break`:
```js
({
    type: 'break'
});
```
A similar thing can be done for `continue` actions in such loops.
<div class="alert alert-info" role="alert">
Note: A return statement in a body of actions will not break out of that body, but rather stop execution of the entire script.
</div>

Example:
```js
forAllPlayers({
    playerGroup: humanPlayers(),
    actions: () => {
        if (getPlayerName({ entity: selectedPlayer() }) == 'kyle69') {
            sendChatMessage({
                message: 'Found kyle69!'
            });
            ({
                type: 'break'
            });
        }
    }
});

```

# Inserting JSON more directly
Object expressions and array expressions have their property values/elements converted and then are inserted as they are into the JSON output to be used for writing some actions in object notation. Array expressions can be used as the `conditions` argument in `condition` actions and the `items` argument in `calculate` functions.

Example:
```js
if (true == true) {}
else {}
// alternatively:
({
    type: 'condition',
    conditions: [
        { operator: '==' },
        true,
        true
    ],
    then: () => {},
    else: () => {}
});
```

# Comments
Comments in the Javascript code will be removed in the JSON output. To add a comment action, call `comment()`:
```js
comment({
    comment: 'Hi!'
});
```
A comment can be added to any action by adding the `comment` property to its configuration argument.

Example:
```js
/**
 * Triggers:
 * @trigger playerLeavesGame
 *
 * @scriptName player leaves
 */
forAllUnits({
    unitGroup: allUnitsOwnedByPlayer({ player: getTriggeringPlayer() }),
    actions: () => {
        destroyEntity({
            entity: selectedUnit()
        });
    },
    comment: 'when a player leaves, destroy all units owned by that player'
});
```

# Conversion warnings
When converting text scripts to JSON, you may be alerted if you are using a feature of Javascript that is not supported by Modd.io in your code. The script may still finish being converted into JSON, but it is best to correct warnings to ensure that Modd.io will be able to execute your script correctly and that the script can be correctly converted back from JSON into text.

---
If you have any problems, let kyle69 know in his Discord server [here](https://discord.gg/U9xyS5S).