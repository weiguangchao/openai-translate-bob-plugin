const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Execute the actual Bob entry point without Node's globals or newer Bob APIs.
function plugin(options = {}, respond) {
  const requests = [];
  const scope = vm.createContext({
    $option: { baseUrl: 'https://gateway.example/v1/', apiKey: 'test-secret', model: 'provider/model-a', ...options },
    $http: { request(request) { requests.push(request); if (respond) respond(request); } }
  });
  const modules = new Map();
  scope.require = function load(name) {
    const filename = path.resolve(__dirname, '../src', name);
    assert.ok(filename.startsWith(path.resolve(__dirname, '../src') + path.sep));
    if (!modules.has(filename)) {
      const module = { exports: {} };
      modules.set(filename, module);
      const factory = vm.runInContext('(function(require,module,exports){' + fs.readFileSync(filename, 'utf8') + '\n})', scope);
      factory(load, module, module.exports);
    }
    return modules.get(filename).exports;
  };
  vm.runInContext(fs.readFileSync(path.resolve(__dirname, '../src/main.js'), 'utf8'), scope);
  return {
    requests,
    translate(query = {}) {
      const results = [];
      scope.translate({ text: 'Hello.\n\nWorld.', from: 'auto', to: 'auto', detectFrom: 'en', detectTo: 'zh-Hans', ...query }, value => results.push(JSON.parse(JSON.stringify(value))));
      return results;
    }
  };
}

test('Bob translates with a pasted model ID even when the old model-list action is still saved', () => {
  const bob = plugin({ model: 'provider/model-a', action: 'models' }, request => request.handler({ response: { statusCode: 200 }, data: { choices: [{ message: { content: '你好。\n\n世界。' }, finish_reason: 'stop' }] } }));
  const results = bob.translate();
  assert.equal(bob.requests.length, 1);
  const request = bob.requests[0];
  assert.equal(request.url, 'https://gateway.example/v1/chat/completions');
  assert.equal(request.method, 'POST');
  assert.equal(request.header.Authorization, 'Bearer test-secret');
  assert.equal(request.header['Content-Type'], 'application/json');
  assert.equal(request.body.model, 'provider/model-a');
  assert.equal(request.body.stream, false);
  assert.equal(request.body.reasoning_effort, 'low');
  assert.equal(request.body.messages[1].content, 'Hello.\n\nWorld.');
  assert.match(request.body.messages[0].content, /English.*Simplified Chinese/);
  assert.deepEqual(results, [{ result: { from: 'en', to: 'zh-Hans', toParagraphs: ['你好。\n\n世界。'] } }]);
});

test('whitespace in any connection setting is rejected before a network request', async t => {
  const fields = [
    ['baseUrl', 'https://gateway.example/v1', 'Base URL', 'param'],
    ['apiKey', 'test-secret', 'API Key', 'secretKey'],
    ['model', 'provider/model-a', '模型 ID', 'param']
  ];
  const whitespace = [' ', '\t', '\n', '\r', '\r\n', '\v', '\f', '\u0085', '\u00a0', '\u3000', '\u2028', '\u2029', '\ufeff'];
  for (const [field, valid, label, type] of fields) {
    for (const blank of whitespace) {
      const values = [blank + valid, valid + blank, valid + blank + valid];
      for (const [position, value] of values.entries()) await t.test(`${field} ${JSON.stringify(blank)} position ${position}`, () => {
        const bob = plugin({ [field]: value });
        const results = bob.translate();
        assert.equal(bob.requests.length, 0);
        assert.equal(results.length, 1);
        assert.equal(results[0].error.type, type);
        assert.ok(results[0].error.message.includes(label));
        assert.match(results[0].error.message, /空白字符/);
        assert.ok(!results[0].error.message.includes('test-secret'));
      });
    }
  }
});

test('saved legacy interface settings still use Chat Completions with explicit languages', () => {
  const bob = plugin({ apiStyle: 'completion', model: 'configured-model' }, request => request.handler({ response: { statusCode: 200 }, data: JSON.stringify({ choices: [{ message: { content: 'Bonjour.' }, finish_reason: 'stop' }] }) }));
  const results = bob.translate({ from: 'en', to: 'fr' });
  const request = bob.requests[0];
  assert.equal(bob.requests.length, 1);
  assert.equal(request.url, 'https://gateway.example/v1/chat/completions');
  assert.equal(request.body.model, 'configured-model');
  assert.equal(request.body.reasoning_effort, 'low');
  assert.match(request.body.messages[0].content, /English.*French/);
  assert.equal(request.body.messages[1].content, 'Hello.\n\nWorld.');
  assert.equal(request.body.prompt, undefined);
  assert.deepEqual(results, [{ result: { from: 'en', to: 'fr', toParagraphs: ['Bonjour.'] } }]);
});

test('invalid settings and languages fail before sending text to a provider', async t => {
  const cases = [
    ['missing key', { apiKey: '' }, {}, 'secretKey'],
    ['invalid URL', { baseUrl: 'file:///private/file' }, {}, 'param'],
    ['URL credentials', { baseUrl: 'https://user:pass@gateway.example/v1' }, {}, 'param'],
    ['endpoint instead of base', { baseUrl: 'https://gateway.example/v1/chat/completions' }, {}, 'param'],
    ['no model', { model: '' }, {}, 'param'],
    ['blank model lines', { model: ' \r\n\t\n ' }, {}, 'param'],
    ['empty text', {}, { text: '  ' }, 'param'],
    ['unknown language', {}, { to: 'invalid' }, 'unsupportedLanguage'],
    ['undetected target', {}, { detectTo: 'auto' }, 'unsupportedLanguage']
  ];
  for (const [name, options, query, type] of cases) await t.test(name, () => {
    const bob = plugin(options);
    const results = bob.translate(query);
    assert.equal(results.length, 1);
    assert.equal(results[0].error.type, type);
    assert.equal(bob.requests.length, 0);
  });
});

test('provider errors are reported once, without exposing the key or accepting partial translations', async t => {
  const cases = [
    ['unauthorized', { response: { statusCode: 401 }, data: { error: { message: 'Invalid test-secret' } } }, 'secretKey', /401/],
    ['unrecognized model', { response: { statusCode: 400 }, data: { error: { message: 'unknown provider for model gemini-3.8-flash' } } }, 'network', /完整模型 ID/],
    ['rate limit', { response: { statusCode: 429 }, data: {} }, 'network', /429/],
    ['timeout on old Bob', { error: { code: -1001, localizedDescription: 'timeout' } }, 'network', /timeout/],
    ['HTML instead of JSON', { response: { statusCode: 200 }, data: '<html>proxy</html>' }, 'api', /JSON/],
    ['no choices', { data: {} }, 'api', /choices/],
    ['empty response', { data: { choices: [{ message: { content: ' ' } }] } }, 'api', /空译文/],
    ['truncated response', { data: { choices: [{ message: { content: 'partial' }, finish_reason: 'length' }] } }, 'api', /长度/],
    ['refusal', { data: { choices: [{ message: { refusal: 'no', content: null } }] } }, 'api', /拒绝/]
  ];
  for (const [name, response, type, message] of cases) await t.test(name, () => {
    const bob = plugin({}, request => { request.handler(response); request.handler(response); });
    const results = bob.translate();
    assert.equal(results.length, 1);
    assert.equal(results[0].error.type, type);
    assert.match(results[0].error.message, message);
    assert.ok(!JSON.stringify(results).includes('test-secret'));
  });
});
