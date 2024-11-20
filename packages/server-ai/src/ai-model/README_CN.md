# Ai Model Module

该模块提供了各模型的调用(Langchain.js)、鉴权接口，并为 Xpert 提供了统一的模型供应商的信息和凭据表单规则。

- 一方面将模型和上下游解耦，方便开发者对模型横向扩展，
- 另一方面提供了只需在后端定义供应商和模型，即可在前端页面直接展示，无需修改前端逻辑。

## 功能介绍

- 支持 5 种模型类型的能力调用

  - `LLM` - LLM 文本补全、对话，预计算 tokens 能力
  - `Text Embedidng Model` - 文本 Embedding ，预计算 tokens 能力
  - `Rerank Model` - 分段 Rerank 能力
  - `Speech-to-text Model` - 语音转文本能力
  - `Text-to-speech Model` - 文本转语音能力
  - `Moderation` - Moderation 能力

## 结构

## 下一步

### [增加新的供应商配置 👈🏻](./docs/zh_Hans/provider_scale_out.md)
当添加后，这里将会出现一个新的供应商


### [为已存在的供应商新增模型 👈🏻](./docs/zh_Hans/provider_scale_out.md#增加模型)
当添加后，对应供应商的模型列表中将会出现一个新的预定义模型供用户选择，如GPT-3.5 GPT-4 ChatGLM3-6b等，而对于支持自定义模型的供应商，则不需要新增模型。


### [接口的具体实现 👈🏻](./docs/zh_Hans/interfaces.md)
你可以在这里找到你想要查看的接口的具体实现，以及接口的参数和返回值的具体含义。
