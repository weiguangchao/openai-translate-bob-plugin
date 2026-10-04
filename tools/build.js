const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

async function main() {
  const root = path.resolve(__dirname, '..');
  const output = path.join(root, 'dist', 'openai-translate.bobplugin');
  const staging = await fs.mkdtemp(path.join(os.tmpdir(), 'bob-openai-'));
  const files = ['info.json', 'main.js', 'api.js', 'languages.js'];
  try {
    for (const file of files) {
      await fs.copyFile(path.join(root, 'src', file), path.join(staging, file));
    }
    await fs.mkdir(path.dirname(output), { recursive: true });
    // Build a fresh archive; updating an existing ZIP can retain removed files.
    const archive = path.join(staging, 'plugin.zip');
    execFileSync('zip', ['-q', '-X', archive, ...files], { cwd: staging });
    await fs.copyFile(archive, output);
    console.log(output);
  } finally {
    await fs.rm(staging, { recursive: true, force: true });
  }
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
