const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { ESLint } = require('eslint');

test('ESLint rejects every comment type without rejecting comment markers in code', async t => {
  const eslint = new ESLint({ cwd: path.resolve(__dirname, '..') });
  const cases = [
    ['line comment', '// forbidden', 1],
    ['trailing comment', 'var value = 1; // forbidden', 1],
    ['block comment', '/* forbidden\non multiple lines */', 1],
    ['JSDoc', '/** @returns {number} */\nfunction value() { return 1; }', 1],
    ['hashbang', '#!/usr/bin/env node\nvar value = 1;', 1],
    ['global directive', '/* global value */', 1],
    ['disable all rules', '/* eslint-disable */\n// forbidden', 2],
    ['disable comment rule', '/* eslint-disable local/no-comments */\n// forbidden', 2],
    ['disable next line', '// eslint-disable-next-line local/no-comments\n// forbidden', 2],
    ['inline rule configuration', '/* eslint local/no-comments: "off" */\n// forbidden', 2],
    ['comment markers in code', [
      'var url = "https://example.com";',
      'var line = "// text";',
      'var block = "/* text */";',
      'var template = `// text\n/* text */`;',
      'var pattern = /https?:\\/\\//;',
      'var quotient = 4 / 2;'
    ].join('\n'), 0]
  ];
  for (const [name, code, errors] of cases) {
    await t.test(name, async () => {
      const [result] = await eslint.lintText(code, { filePath: 'src/main.js' });
      assert.equal(result.fatalErrorCount, 0);
      assert.equal(result.errorCount, errors);
      assert.equal(result.messages.filter(message => message.ruleId === 'local/no-comments').length, errors);
    });
  }
});
