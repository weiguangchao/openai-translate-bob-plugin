# 接口参考

本页内容对应 `src/api.js` 和 `src/main.js` 的实现。

## 请求

插件为每次翻译发送一个请求。

| 项目 | 值 |
| --- | --- |
| 方法和地址 | `POST {baseUrl}/chat/completions` |
| 请求头 | `Content-Type: application/json` 和 `Authorization: Bearer {apiKey}` |
| 请求体 | `model`、`temperature: 0`、`thinking: { type: "disabled" }`、`stream: false` 和 `messages` |
| 超时 | 50 秒 |

插件不发送 `reasoning_effort`。

插件删除 `baseUrl` 末尾的 `/`，但不会自动添加 `/v1`。因此，自定义网关的路径前缀保持不变。

Bob 0.10.2 没有流式插件接口。插件发送 `stream: false`，收到完整译文后才显示结果。

## 消息

`messages` 包含两条消息：

1. `system` 消息要求模型作为目标语言的专业母语译者翻译原文。这条消息要求模型把单词、短语、标题、标签和站点名都当作完整的翻译单元，并且只返回译文。
2. `user` 消息以 `Translate to {目标语言}:` 开头，后面空一行，再接原文。

两条消息都使用目标语言的英文名称，例如 `Simplified Chinese`。`src/languages.js` 定义 Bob 语言代码和英文名称的对应关系。插件不在原文外添加 XML 标签。

## 语言

插件使用 Bob 中手动选择的源语言和目标语言。如果选择的是自动检测，插件使用 Bob 检测到的语言。

如果源语言或目标语言不在 `src/languages.js` 中，插件停止请求并显示错误。

## 设置校验

插件在发送请求前检查设置和原文。如果一项不符合规则，插件停止请求，并在 Bob 中指出这一项。

| 输入 | 规则 |
| --- | --- |
| Base URL | 不为空，并且不含空白字符。以 `http://` 或 `https://` 开头。不含查询参数、`#` 片段、用户名或密码。不以 `/chat/completions`、`/completions`、`/model` 或 `/models` 结尾。 |
| API Key | 不为空，并且不含空白字符。 |
| 模型 ID | 不为空，并且不含空白字符。 |
| 原文 | 不为空，并且不只包含空白字符。 |

插件不会删除设置中的空白字符，也不会从多行内容中选取一行。插件不会把服务商不支持的模型替换成其他模型。

## 响应

插件读取 `choices[0].message.content`。如果 `content` 是数组，插件拼接其中所有 `type` 为 `text` 的部分。插件删除译文首尾的空白字符，并保留译文中间的换行。

下表列出插件报告错误的条件。

| 条件 | Bob 中的错误提示 |
| --- | --- |
| HTTP 401 | 鉴权失败，请检查 API Key。 |
| HTTP 403 | 当前 API Key 没有访问权限。 |
| HTTP 404 | 接口或模型不存在。 |
| HTTP 429 | 请求过于频繁或额度不足。 |
| HTTP 400，并且错误信息包含 `unknown provider for model` | 当前服务商不识别这个模型 ID。 |
| 其他非 2xx 状态码 | 服务请求失败。 |
| 网络错误 | 网络请求失败。 |
| 响应不是有效的 JSON | 接口未返回有效 JSON。 |
| 响应体包含 `error` | 服务商返回的错误信息。 |
| 响应没有 `choices[0]` | 接口没有返回 choices 结果。 |
| `finish_reason` 是 `length` | 译文超出模型输出长度限制。 |
| `finish_reason` 是 `content_filter`，或 `message.refusal` 有值 | 模型拒绝了本次翻译。 |
| 译文为空 | 模型返回了空译文。 |

对于 HTTP 错误，插件在提示后附上服务商返回的错误信息。插件把错误信息中的 API Key 和 `Bearer` 令牌替换成 `[已隐藏密钥]`，并把错误信息截断到 400 个字符。

插件不重试失败的请求。插件也不会删除请求参数后重试，也不会记住服务商拒绝过的参数。

## 依据的接口文档

- [Bob 的 info.json 配置](https://bobtranslate.com/plugin/quickstart/info.html)。插件的设置使用 `text` 输入框，没有使用 Bob 1.8.0 才支持的 `textConfig`。
- [Bob 的 $option](https://bobtranslate.com/plugin/api/option.html)。插件通过 `$option` 读取用户的设置。
- [Bob 的翻译入口](https://bobtranslate.com/plugin/quickstart/translate.html)和 [Bob 的 HTTP 接口](https://bobtranslate.com/plugin/api/http.html)。插件使用旧版的 `completion`、`$http.request` 和 `toParagraphs`，不依赖新版的验证按钮或流式接口。
- [OpenAI 的 Chat Completions 接口](https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create)。
