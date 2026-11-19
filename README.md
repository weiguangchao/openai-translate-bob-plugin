# OpenAI 兼容翻译 Bob 插件

这个 Bob 插件通过 OpenAI 兼容的 Chat Completions 接口翻译文本。插件要求 Bob 0.10.2 或更新版本。在 Bob 中填写 Base URL、API Key 和模型 ID 后，插件就能翻译。

## 安装插件

1. 从 [Releases 页面](https://github.com/weiguangchao/openai-translate-bob-plugin/releases)下载 `openai-translate.bobplugin`。
2. 双击下载的文件。Bob 会安装插件。

安装插件后，Bob 不会自动添加翻译服务。按以下步骤手动添加服务：

1. 打开 Bob 的 **偏好设置 → 翻译 → 服务 → 文本翻译**。
2. 点击服务列表左下角的 **＋**。
3. 在菜单的 **插件** 分组中选择 **OpenAI 兼容翻译**。
4. 点击 **保存**。

## 配置服务

1. 在服务列表中选中 **OpenAI 兼容翻译**。
2. 在 **Base URL** 中填写服务商的 API 根地址，例如 `https://api.openai.com/v1` 或 `http://localhost:8000/v1`。
3. 在 **API Key** 中填写服务商提供的密钥。
4. 从服务商的模型列表或文档中复制完整的模型 ID，然后粘贴到 **模型 ID** 中。
5. 点击 **保存**。

Base URL 要包含服务商要求的路径前缀，例如 `/v1`。不要在 Base URL 末尾加上 `/models` 或 `/chat/completions`。

Bob 0.10.2 默认隐藏输入框中的内容。点击输入框右侧的眼睛图标可以查看明文。

更换服务商时，同时更新 Base URL、API Key 和模型 ID。

### 设置必须符合的规则

Base URL、API Key 和模型 ID 都必须符合以下规则：

- 设置不能为空。
- 设置不能包含空白字符，包括首尾空格、换行和制表符。插件不会自动删除空白字符。
- 模型 ID 必须与服务商模型列表中的 ID 完全一致，包括后缀。

Bob 0.10.2 没有在输入或保存时校验设置的接口。因此，插件在发送每个翻译请求前检查设置。如果一项设置不符合规则，插件会停止请求，并在 Bob 中指出这一项。

## 解决常见错误

下表列出 Bob 中常见的错误提示和处理方法。

| 错误提示 | 处理方法 |
| --- | --- |
| `HTTP 401` 或 `HTTP 403` | 检查 API Key 和账户的访问权限。 |
| `HTTP 404` | 检查 Base URL 和模型 ID。确认服务商支持 Chat Completions。 |
| `HTTP 429` | 稍后重试，或检查账户额度。 |
| 当前服务商不识别这个模型 ID | 在服务商控制台或 `GET {baseUrl}/models` 中查看可用的模型，然后复制完整的模型 ID。 |
| 译文超出模型输出长度限制 | 缩短原文。 |
| 模型拒绝了本次翻译 | 修改原文，或换用其他模型。 |
| 模型返回了空译文 | 确认模型支持 Chat Completions。 |

插件等待模型返回完整译文，等待上限是 50 秒。如果长文本或推理慢的模型超时，缩短原文或换用更快的模型。

## 更多文档

- [接口参考](docs/reference.md)列出插件发送的请求、设置校验规则和错误处理。
- [开发与发布](docs/development.md)说明如何构建、测试和发布插件。
