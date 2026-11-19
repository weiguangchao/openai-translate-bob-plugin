# 开发与发布

## 准备环境

开发需要以下工具：

- Node.js 20.19 或更新的 20.x 版本、22.13 或更新的 22.x 版本，或者 Node.js 24 及更新版本
- macOS 自带的 `zip` 和 `unzip`

ESLint 只用于开发检查。插件运行时没有 npm 依赖。

## 构建和测试

在仓库根目录运行以下命令：

```sh
npm ci
npm run lint
npm test
npm run build
```

`npm test` 和 `npm run build` 会先运行 ESLint。如果 ESLint 检查失败，命令会停止。

构建结果是 `dist/openai-translate.bobplugin`。安装包的根目录只包含 `info.json`、`main.js`、`api.js` 和 `languages.js`。

要更新本机 Bob 中的插件，重新构建，然后双击新的安装包。

## 禁止注释

JavaScript 文件不能包含任何注释，包括行注释、块注释和 ESLint 指令注释。`eslint.config.js` 中的 `local/no-comments` 规则把每条注释报告为错误。

## 文件结构

下表列出仓库中的源代码、构建脚本和测试。运行 `git ls-files src tools test` 可以列出这些文件。

| 路径 | 内容 |
| --- | --- |
| `src/info.json` | 插件信息和 Bob 中的设置项 |
| `src/main.js` | Bob 调用的翻译入口 |
| `src/api.js` | 设置校验、翻译请求和响应解析 |
| `src/languages.js` | Bob 语言代码和提示词中英文语言名称的对应关系 |
| `tools/build.js` | 生成 `.bobplugin` 安装包的脚本 |
| `test/plugin.test.js` | 插件在模拟 Bob 环境中的行为测试 |
| `test/package.test.js` | 安装包内容的检查 |
| `test/lint.test.js` | ESLint 规则的测试 |

## 测试范围

`test/plugin.test.js` 在 `node:vm` 隔离环境中运行插件脚本。这个环境不提供 Node.js API，并模拟 Bob 的 `$option`、`$http` 和 `completion` 回调。

自动化测试不覆盖服务商的实际连通性，也不覆盖 Bob 0.10.2 的界面。要验证这两项，在本机 Bob 中用有效的设置翻译一段文本。

## 发布新版本

1. 在 `package.json`、`package-lock.json` 和 `src/info.json` 中更新版本号。
2. 提交改动。
3. 创建 tag，然后把 tag 推送到 GitHub。下面以 `v0.1.14` 为例：

```sh
git tag v0.1.14
git push origin v0.1.14
```

只在本地创建 tag 不会触发发布。推送任意 tag 都会触发 `.github/workflows/release.yml`。这个工作流检出 tag 对应的提交，然后运行 `npm ci`、`npm test` 和 `npm run build`。所有步骤通过后，工作流创建与 tag 同名的 GitHub Release，自动生成发行说明，并附上 `openai-translate.bobplugin`。

工作流使用仓库自带的 `GITHUB_TOKEN`，不需要配置其他密钥。
