# OpenAI 兼容翻译 · Bob 插件

适用于 **Bob 0.10.2**。在 Bob 内配置 Base URL、API Key 和模型，通过 Chat Completions 接口翻译。

将服务商提供的完整模型 ID 手动粘贴到 Bob 的插件设置中，保存后即可翻译。

## 安装与配置

1. 从 [Releases](https://github.com/weiguangchao/openai-translate-bob-plugin/releases) 下载 `openai-translate.bobplugin`，双击安装。打开 Bob 的 **偏好设置 → 翻译 → 服务 → 文本翻译**，点击服务列表左下角的 **＋**，在菜单的 **插件** 分组中选择 **OpenAI 兼容翻译**，然后点击 **保存**。安装插件不会自动创建翻译服务，必须手动添加。
2. 选中刚添加的服务，在右侧填写 **Base URL** 和 **API Key**。Base URL 应包含服务商要求的路径前缀，例如 `https://api.openai.com/v1` 或 `http://localhost:8000/v1`，不要包含 `/model` 或 `/chat/completions`。
3. 从服务商的模型列表或文档中复制完整模型 ID，粘贴到 **模型 ID** 输入框。
4. 点击 **保存**，即可正常翻译。

更换服务商后，请同步更新 Base URL、API Key 和模型 ID。Bob 0.10.2 的文本输入框默认隐藏内容，点击输入框右侧的眼睛可查看明文。

Base URL、API Key 和模型 ID 均不能为空，也不能包含任何空白字符，包括首尾空格、换行和制表符。Bob 0.10.2 未提供输入或保存时的校验接口，插件会在翻译请求发送前检查配置，指出有问题的字段并停止请求。插件不会自动去除空白或从多行内容中选取一行。

模型 ID 必须与当前服务商的模型列表完全一致，包括后缀。若接口返回 `unknown provider for model`，请检查完整模型 ID；可在服务商控制台或其 `GET {baseUrl}/models` 接口查看可用模型。插件不会自动替换服务商不支持的模型。

## 接口行为

翻译固定请求 `POST {baseUrl}/chat/completions`，请求体包含 `model`、`messages` 和 `stream: false`。请求发送 `reasoning_effort: "low"`，将上游服务商的思考级别设为 low。

请求使用 `Authorization: Bearer {apiKey}`。插件不会自动添加 `/v1`，因此自定义网关的路径前缀会保留。填写的模型必须支持 Chat Completions。

翻译使用 Bob 检测的源语言和目标语言，也尊重手动指定的语言。结果保留模型返回的换行。鉴权错误、限流、网络错误、空结果、模型拒绝和输出截断都会显示对应提示。

系统提示词要求模型作为目标语言的专业母语译者处理原文，包括单词、短语、标题和站点名。两段提示词均使用英文目标语言名称，用户消息格式为 `Translate to {目标语言英文名称}:`，空一行后附上原文。插件不添加 XML 标签，接口返回空的 `choices` 时直接显示错误。

Bob 0.10.2 不支持流式插件接口，因此本插件等待完整译文后显示结果。翻译请求超时为 50 秒。长文本和慢速推理模型可能需要缩短原文或更换模型。

## 开发与打包

需要 Node.js 20.19+、22.13+ 或 24 及更新版本，以及 macOS 自带的 `zip` / `unzip`。ESLint 仅用于开发检查，插件运行时没有 npm 依赖。

```sh
npm ci
npm run lint
npm test
npm run build
```

所有 JavaScript 文件禁止任何注释，包括行注释、块注释和 ESLint 指令注释。测试和打包前会自动运行 ESLint，检查失败时停止执行。

输出为 `dist/openai-translate.bobplugin`。安装包根目录直接包含 `info.json`、`main.js` 和依赖脚本，不包含父目录、测试文件或 API Key。重新构建后再次双击安装以更新插件。

```text
src/info.json        Bob 内的配置项
src/main.js          Bob 0.10.2 的翻译入口
src/api.js           URL、鉴权、翻译请求与响应解析
src/languages.js     Bob 语言代码与提示词中的语言名称
tools/build.js       生成 .bobplugin 安装包
test/                Bob 回调边界与安装包检查
```

自动化测试在隔离的 JavaScript 环境中模拟 Bob 的 `$option`、`$http` 和 `completion` 回调，不依赖 Node.js API 来执行插件脚本。实际服务商连通性和 Bob 0.10.2 界面仍需使用有效的配置在本机验证。

## 发布

发布前同步 `package.json`、`package-lock.json` 和 `src/info.json` 的版本号，并提交改动。创建并推送 tag，例如：

```sh
git tag v0.1.12
git push origin v0.1.12
```

推送任意 tag 后，GitHub Actions 会检出该 tag，安装依赖、运行 ESLint 和测试，再构建插件。全部通过后，工作流会创建同名 GitHub Release，自动生成发行说明，并附上 `openai-translate.bobplugin`。只在本地创建 tag 不会触发发布。

发布使用仓库自带的 `GITHUB_TOKEN`，无需配置额外密钥。

## 接口依据

- [Bob 的 info.json 配置](https://bobtranslate.com/plugin/quickstart/info.html)：配置使用 `text` 输入框，未使用 1.8.0 才支持的 `textConfig`。
- [Bob 的 $option](https://bobtranslate.com/plugin/api/option.html)：读取用户设置。
- [Bob 翻译入口](https://bobtranslate.com/plugin/quickstart/translate.html)与[HTTP 接口](https://bobtranslate.com/plugin/api/http.html)：使用旧版 `completion`、`$http.request` 和 `toParagraphs`，不依赖新版验证按钮或流式接口。
- [Chat Completions](https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create)。
