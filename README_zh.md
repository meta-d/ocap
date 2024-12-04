[English](./README.md) | 中文

# ⚠️ 仓库迁移通知 ⚠️

本仓库 [meta-d/ocap](https://github.com/meta-d/ocap) 已停止维护，相关代码和功能已迁移至新的公开仓库：[xpert-ai/xpert](https://github.com/xpert-ai/xpert)。  
请前往新仓库获取最新的代码、文档和支持。

---

### 为什么迁移？
我们将项目迁移至公开组织仓库以便更好地支持社区协作和项目长期发展。

---

### 如何获取新版本？
1. 前往 [xpert-ai/xpert](https://github.com/xpert-ai/xpert)。
2. 查看最新的文档和版本发布信息。
3. 更新依赖项以指向新仓库（如适用）。

感谢您的支持！如果您有任何问题，请在新仓库中提交 Issue 或参与讨论。

# Metad 分析平台

[uri_metad]: https://mtda.cloud/
[uri_license]: https://www.gnu.org/licenses/agpl-3.0.html
[uri_license_image]: https://img.shields.io/badge/License-AGPL%20v3-blue.svg

![visitors](https://visitor-badge.laobi.icu/badge?page_id=meta-d.ocap)
[![License: AGPL v3][uri_license_image]][uri_license]
[![Gitpod Ready-to-Code](https://img.shields.io/badge/Gitpod-Ready--to--Code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/meta-d/ocap)

## 💡 新功能
### Xpert AI

**Xpert AI** 是一个企业级的AI系统，集成了BI（商业智能）指标管理和智能对话功能。它包含知识库、数据分析工具集（ChatBI、ChatDB、Search）等模块，充当数字专家，提供智能助手协作服务，并与飞书机器人深度集成。*Xpert AI* 利用先进的AI技术，为企业提供高效的决策支持和信息管理，帮助用户快速获取数据洞察，优化业务流程，提高整体运营效率。

[更多详情](https://mtda.cloud/blog/releases-2-7-xpert)

### ChatBI：自然语言驱动的商业智能分析

[ChatBI](https://mtda.cloud/docs/chatbi) 是我们新推出的一个创新功能，它将聊天功能与商业智能（BI）分析能力相结合，通过自然语言交互的方式，为用户提供更加直观和便捷的数据分析体验。
[更多详情](https://mtda.cloud/blog/releases-2-5-chatbi)

[ChatBI_Demo.mp4](https://github.com/user-attachments/assets/5f7c84be-2307-43cf-8342-bce39524e37d)

## 🎯 宗旨

__“一张表，一个模型，一套指标体系”__

简单、高效、一体化。用户只需处理一张事实表就可以进行分析，通过平台提供的多维建模功能，在一个统一的语义模型下就能够快速地得到一套完整的指标体系。

## 🌟 简介

[Metad 分析平台][uri_metad] - 企业级数据和报表 **开源分析平台**。

- **语义模型**: 执行多维数据建模和分析，允许用户从不同的维度和层次探索数据。
- **故事仪表板**: 使用故事仪表板创建引人注目的视觉叙述，将交互式可视化、叙述元素和数据驱动的叙述组合在一起。
- **指标管理**: 轻松定义、管理和监控关键绩效指标（KPI），以确保数据质量、一致性和有效的绩效分析。
- **AI 副驾驶**: 从人工智能驱动的见解和建议中受益，以增强决策流程并识别可行的机会。

![故事工作空间](https://github.com/meta-d/meta-d/raw/main/img/v2.0/story-workspace.png)

![指标应用](https://github.com/meta-d/meta-d/raw/main/img/v2.0/indicator-app-ai-copilot.png)

## ✨ 功能

主要功能：

- **数据源**: 连接到各种不同的数据库和数据仓库。
  - **OLAP 源**: SAP BW/BPC、HANA、SSAS、Mondrian、Kylin 等。
  - **MPP 数据库**: StarRocks、Apache Doris、ClickHouse 等。
  - **SQL 数据库**: MySQL、PostgreSQL 等。
  - **MR 源**: Hive、Trino 等。
* **语义模型**: 支持两种 OLAP 引擎 MDX 和 SQL 的统一语义建模，支持多维建模和分析。
  * **查询实验室**: 执行和分析 SQL 或 MDX 查询的环境，并具有 AI 副驾驶以帮助编写和优化 SQL 或 MDX 查询。
  * **虚拟立方体**: 从多个立方体中组合维度和度量形成一个虚拟的立方体。
  * **访问控制**: 基于单一角色或者组合角色的行级别访问控制定义的立方体。
  * **外部立方体**: 支持第三方多维数据源，如 SSAS、SAP BW/BPC 等。
  * **计算成员**: 支持使用 MDX 或 SQL 表达式创建计算维度成员和度量。
* **项目**: 项目是一组故事仪表板、指标和其他资源，用于创建和交付分析内容，与同事合作。
* **指标管理**: 定义，管理和监控关键绩效指标（KPI），以确保数据质量，一致性和有效的绩效分析。
  * 指标注册
  * 指标认证
  * 指标业务域
  * 衍生指标
  * 指标度量
* **指标市场**: 在一个地方发布和分享指标给其他用户。
* **指标应用**: 在专用的单页应用程序中查看和分析指标。
* **故事仪表板**: 使用故事表板创建引人入胜的视觉叙事，结合交互式可视化、叙事元素和数据驱动的叙事。
  * **大屏**: 适用于大屏展示的故事仪表盘，支持数据自动刷新和滚动展示。
  * **移动端**: 支持移动端自适应设计、支持移动端浏览器访问。
  * **故事模版**: 创建并分享一个统一的故事样式和布局模板。
  * **执行解释**: 解释数据查询和展示的执行过程，包括查询语句，切片器，查询结果和图表选项。
* **AI 副驾驶**: 使用自定义命令帮助用户快速设计和实现故事仪表板或指标。
  - 使用 `/query` 命令执行 SQL 或 MDX 查询。
  - 使用 `/story` 命令创建一个故事仪表板。
  - 使用 `/indicator` 命令创建一个指标。
  - 使用 `/clear` 命令清除屏幕。
  - 。。。

平台的基本功能：

* 多租户
* 多组织管理
* 主页仪表盘
* 角色 / 权限
* 标签 / 标签
* 自定义 SMTP
* 电子邮件模板
* AI 副驾驶
* 国家
* 货币
* 日志记录器
* 存储文件
* 用户
* 邀请
* 业务域
* 认证
* 深色 / 浅色 / 轻色和其他主题

## 🌼 屏幕截图

<details>
<summary>显示/隐藏截图</summary>

### 帕累托分析 [在新页签打开](https://app.mtda.cloud/public/story/892690e5-66ab-4649-9bf5-c1a9c432c01b?pageKey=bsZ0sjxnxI)
![Pareto analysis Screenshot](https://github.com/meta-d/meta-d/raw/main/img/v2.0/story-workspace.png)

### 产品利润分析 [在新页签打开](https://app.mtda.cloud/public/story/892690e5-66ab-4649-9bf5-c1a9c432c01b?pageKey=6S4oEUnVO3)
![Product profit analysis Screenshot](https://github.com/meta-d/meta-d/raw/main/img/v2.0/story-viewer.png)

### 经销商分析 [在新页签打开](https://app.mtda.cloud/public/story/a58112aa-fc9c-4b5b-a04e-4ea9b57ebba9?pageKey=nrEZxh1aqp)
![经销商分析截图](https://github.com/meta-d/meta-d/raw/main/img/reseller-profit-analysis.png)

### 大屏仪表板 [在新页签打开](https://app.mtda.cloud/public/story/9c462bea-89f6-44b8-a35e-34b21cd15a36)
![大屏仪表板截图](https://github.com/meta-d/meta-d/raw/main/img/bigview-supermart-sales.png)

### 指标应用 [在新页签打开](https://www.mtda.cloud/en/blog/2023/07/24/sample-adv-7-indicator-app)
![Indicator application Screenshot](https://github.com/meta-d/meta-d/raw/main/img/v2.0/indicator-app-ai-copilot.png)

### 指标应用移动端 [在新页签打开](https://www.mtda.cloud/en/blog/2023/07/24/sample-adv-7-indicator-app)
![指标应用移动端截图](https://github.com/meta-d/meta-d/raw/main/img/indicator-app-mobile.jpg)

</details>

## 🔗 链接

* <https://mtda.cloud> 查看更多关于该平台的信息，请访问官方网站。
* <https://mtda.cloud/docs/> 查看官方文档和教程了解详细使用。
* <https://mtda.cloud/blog/> 查看官方博客了解最新动态。
* <https://app.mtda.cloud/> 登录到 Metad 分析平台免费使用。

## 💻 演示，下载，测试和生产

### 演示

Metad 分析平台演示地址 <https://app.mtda.cloud> 。

注意:
- 您可以在首页生成样本数据。

### 下载

您可以下载 [Metad 桌面代理](https://github.com/meta-d/meta-d/releases) 用于连接 Metad 分析云到您的本地数据源。

### 生产 (SaaS)

Metad 分析云平台链接为 <https://app.mtda.cloud> 。

注意: 它目前处于 Alpha 版本/测试模式，请谨慎使用！

## 🧱 技术栈

- [TypeScript](https://www.typescriptlang.org) language
- [NodeJs](https://nodejs.org) / [NestJs](https://github.com/nestjs/nest)
- [Nx](https://nx.dev)
- [Angular](https://angular.io)
- [RxJS](http://reactivex.io/rxjs)
- [TypeORM](https://github.com/typeorm/typeorm)
- [ECharts](https://echarts.apache.org/)
- [Java](https://www.java.com/)
- [Mondrian](https://github.com/pentaho/mondrian)

对于生产环境，我们推荐：

- [PostgreSQL](https://www.postgresql.org)
- [PM2](https://github.com/Unitech/pm2)

注意：得益于 TypeORM，OCAP 将支持许多数据库：PostgreSQL（开发/生产），MySQL，MariaDB，CockroachDB，MS SQL，Oracle，MongoDB 等等，并且只需进行最小的更改。

#### 请参阅相应文件夹中的 README.md 和 CREDITS.md 文件以获取包含在平台中的库和软件列表，有关许可证的信息以及其他详细信息

## 📄 文档

请参阅我们的 [官方文档](https://mtda.cloud/docs/) 和项目 [Wiki](https://github.com/meta-d/ocap/wiki) (WIP) 或者详细的 [API 参考](https://meta-d.github.io/ocap/)。

## 🚀 快速开始

请查看我们的 [Wiki - Development](https://github.com/meta-d/ocap/wiki/Development) 以快速开始。

## 💌 联系我们

- 商务合作： <mailto:service@mtda.cloud>
- [Metad 平台 @ Twitter](https://twitter.com/CloudMtda)

## 🛡️ 许可证

我们支持开源社区。

此软件在以下许可下可用：

- [Metad 分析平台社区版](https://github.com/meta-d/ocap/blob/master/LICENSE.md#metad-analytics-platform-community-edition-license)
- [Metad 分析平台小企业版](https://github.com/meta-d/ocap/blob/master/LICENSE.md#metad-analytics-platform-small-business-license)
- [Metad 分析平台企业版](https://github.com/meta-d/ocap/blob/master/LICENSE.md#metad-analytics-platform-enterprise-license)

#### 请参阅 [LICENSE](LICENSE.md) 以获取有关许可的更多信息。

## 🍺 贡献

- 请给我们在 Github 上点个 :star: , 这真的很有**帮助**!
- 非常欢迎您在 [ocap repo](https://github.com/meta-d/ocap/issues) 中提交功能请求。
- Pull requests 总是欢迎的！请将拉取请求基于 _develop_ 分支，并遵循 [贡献指南](.github/CONTRIBUTING.md)。
