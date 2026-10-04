const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

test('build produces a Bob-installable archive with metadata and scripts at its root', () => {
  const root = path.resolve(__dirname, '..');
  execFileSync(process.execPath, ['tools/build.js'], { cwd: root });
  const archive = path.join(root, 'dist/openai-translate.bobplugin');
  const files = execFileSync('unzip', ['-Z1', archive], { encoding: 'utf8' }).trim().split('\n');
  assert.ok(files.includes('info.json'));
  assert.ok(files.includes('main.js'));
  assert.ok(files.every(file => !file.includes('/')));
  const info = JSON.parse(execFileSync('unzip', ['-p', archive, 'info.json'], { encoding: 'utf8' }));
  assert.equal(info.category, 'translate');
  assert.equal(info.minBobVersion, '0.10.2');
  assert.match(info.identifier, /^[a-z0-9.]+$/);
  assert.ok(!info.options.find(option => option.identifier === 'apiKey').defaultValue);
  assert.equal(info.options.find(option => option.identifier === 'model').type, 'text');
  assert.ok(!info.options.some(option => ['action', 'apiStyle'].includes(option.identifier)));
  execFileSync('unzip', ['-t', archive]);
});
