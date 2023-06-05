import { convert_AST_node_to_JSON_actions, convert_JSON_action_to_AST_node } from './ast-json-converters.js';
import { defaultWarningHandler } from './utils/warnings.js';

const editor = ace.edit('editor');
editor.setTheme('ace/theme/monokai');
editor.session.setMode('ace/mode/javascript')

const textareaContainer = document.getElementById('raw-json');
const textarea = document.getElementById('textarea');

new ResizeObserver(entries => {
  editor.resize();
  for (const entry of entries) {
    textareaContainer.style.left = entry.contentRect.width + 'px';
  }
}).observe(editor.container);

document.getElementById('convert-to-json').addEventListener('click', () => {
  const value = editor.getValue();
  let program;
  try {
    program = esprima.parse(value, { loc: true, comment: true, tolerant: true });
  } catch (err) {
    console.error(err);
    alert(err);
    return;
  }
  let scriptName;
  const triggerNames = new Set();
  for (const comment of program.comments) {
    if (comment.type === 'Block' && comment.value.startsWith('*')) {
      const { tags } = doctrine.parse(comment.value, { unwrap: true, tags: ['scriptName', 'trigger'] });
      for (const { title, description } of tags) {
        if (title === 'scriptName') {
          scriptName = description;
        } else {
          triggerNames.add(description);
        }
      }
    }
  }
  const script = {
    triggers: [...triggerNames].map(type => ({ type })),
    actions: [],
    name: scriptName || ''
  };
  for (const AST_node of program.body) {
    script.actions.push(...convert_AST_node_to_JSON_actions(AST_node));
  }
  defaultWarningHandler.printWarnings();
  textarea.value = JSON.stringify(script, null, 5);
});

document.getElementById('convert-to-text').addEventListener('click', () => {
  let script;
  try {
    script = JSON.parse(textarea.value);
  } catch (err) {
    console.error(err);
    alert(err);
    return;
  }
  const { triggers, actions } = script;
  let headerComment = '/**\n * Triggers:';
  for (const trigger of triggers) {
    headerComment += '\n * @trigger ' + trigger.type;
  }
  headerComment += '\n *\n * @scriptName ' + (script.name || '') + '\n */';
  const program = {
    type: 'Program',
    body: []
  };
  for (const JSON_action of actions) {
    try {
      program.body.push(convert_JSON_action_to_AST_node(JSON_action));
    } catch (err) {
      console.error(err);
      alert(err);
      return;
    }
  }
  editor.setValue(headerComment + '\n' + escodegen.generate(program));
});
