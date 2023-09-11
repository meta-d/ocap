[English](./README.md) | 中文

# Metad 分析平台

[uri_metad]: https://mtda.cloud/
[uri_license]: https://www.gnu.org/licenses/agpl-3.0.html
[uri_license_image]: https://img.shields.io/badge/License-AGPL%20v3-blue.svg

![visitors](https://visitor-badge.laobi.icu/badge?page_id=meta-d.ocap)
[![License: AGPL v3][uri_license_image]][uri_license]
[![Gitpod Ready-to-Code](https://img.shields.io/badge/Gitpod-Ready--to--Code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/meta-d/ocap)

## 💡 新功能

我们发布了新版本，其中包含 [AI 副驾驶](https://mtda.cloud/blog/copilot-1-assist-data-query)，它可以帮助您编写和优化 SQL 或 MDX 查询语句。

## 🌟 简介

[Metad 分析平台][uri_metad] - 企业级数据和报表 **开源分析平台**。

* **语义模型**: 执行多维数据建模和分析，允许用户从不同的维度和层次探索数据。
* **故事仪表板**: 使用故事仪表板创建引人注目的视觉叙述，将交互式可视化、叙述元素和数据驱动的叙述组合在一起。
* **指标管理**: 轻松定义、管理和监控关键绩效指标（KPI），以确保数据质量、一致性和有效的绩效分析。
* **AI 副驾驶**: 从人工智能驱动的见解和建议中受益，以增强决策流程并识别可行的机会。

![故事工作空间](https://github.com/meta-d/meta-d/blob/main/img/story-workspace.png)

![指标应用](https://github.com/meta-d/meta-d/blob/main/img/indicator-application.png)

## ✨ 功能

主要功能：

* **数据源**: 连接到各种不同的数据库和数据仓库。
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
  * **AI 副驾驶**: 帮助用户快速设计和实现故事仪表板。

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

### 销售概览 [在新页签打开](https://app.mtda.cloud/public/story/892690e5-66ab-4649-9bf5-c1a9c432c01b)
![销售概览截图](https://github.com/meta-d/meta-d/blob/main/img/adv-sales-overview.png)

### 帕累托分析 [在新页签打开](https://app.mtda.cloud/public/story/892690e5-66ab-4649-9bf5-c1a9c432c01b?pageKey=bsZ0sjxnxI)
![帕累托分析截图](https://github.com/meta-d/meta-d/blob/main/img/product-pareto-analysis.png)

### 产品利润分析 [在新页签打开](https://app.mtda.cloud/public/story/892690e5-66ab-4649-9bf5-c1a9c432c01b?pageKey=6S4oEUnVO3)
![产品利润分析截图](https://github.com/meta-d/meta-d/blob/main/img/profit-margin-analysis.jpg)

### 经销商分析 [在新页签打开](https://app.mtda.cloud/public/story/a58112aa-fc9c-4b5b-a04e-4ea9b57ebba9?pageKey=nrEZxh1aqp)
![经销商分析截图](https://github.com/meta-d/meta-d/blob/main/img/reseller-profit-analysis.png)

### 大屏仪表板 [在新页签打开](https://app.mtda.cloud/public/story/9c462bea-89f6-44b8-a35e-34b21cd15a36)
![大屏仪表板截图](https://github.com/meta-d/meta-d/blob/main/img/bigview-supermart-sales.png)

### 指标应用 [在新页签打开](https://www.mtda.cloud/en/blog/2023/07/24/sample-adv-7-indicator-app)
![指标应用截图](https://github.com/meta-d/meta-d/blob/main/img/indicator-application.png)

### 指标应用移动端 [在新页签打开](https://www.mtda.cloud/en/blog/2023/07/24/sample-adv-7-indicator-app)
![指标应用移动端截图](https://github.com/meta-d/meta-d/blob/main/img/indicator-app-mobile.jpg)

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

注意：多亏了 Metad 将支持大量的数据库：PostgreSQL（开发/生产），MySql，MariaDb，CockroachDb，MS SQL，Oracle，MongoDb，以及其他，只需最小的更改。

#### 请参阅相应文件夹中的 README.md 和 CREDITS.md 文件以获取包含在平台中的库和软件列表，有关许可证的信息以及其他详细信息

## 📄 文档

请参阅我们的 [官方文档](https://mtda.cloud/docs/) 和项目 [Wiki](https://github.com/meta-d/ocap/wiki) (WIP).

## 🚀 快速开始

### 使用 Docker Compose

- 克隆代码库.
- 保证您已经安装了 Docker Compose [本地安装](https://docs.docker.com/compose/install).
- 复制 `.env.compose` 文件到 `.env` 放在项目根目录 (此文件包含了默认的环境变量定义)。
- 运行命令 `docker-compose -f docker-compose.demo.yml up`, 将使用我们预先构建的 Docker 镜像运行此平台。 _(注意: 它使用最新的镜像，自动从 GitHub 代码仓库的 `main` 分支的最新提交构建。)_
- 运行 `docker-compose up`, 将在本地构建所有的代码和镜像。 _(注意: 这是一个非常漫长的过程还可能遇到网络问题，请优先使用上一中运行方式.)_
- 在浏览器中打开链接 <http://localhost:4200> 。
- 首次打开将进入 *首次配置* 页面。按照提示完成初始设置（组织，样本和连接数据源），然后就可以开始使用它了。
- 尽情享受！

### 手动

#### 要求

- 安装 [NodeJs](https://nodejs.org/en/download) LTS 版本或更新的, 例如 18.x 。
- 用 `npm i -g yarn` 安装 [Yarn](https://github.com/yarnpkg/yarn) (如果还没有)。
- 用命令 `yarn bootstrap` 安装 NPM 包和启动方案。

#### 运行

- 复制 [`.env.local`](./.env.local) 文件到 `.env` 然后调整文件中的配置用于本地运行程序。
- 运行命令 `docker-compose -f docker-compose.dev.yml up -d` 启动程序所需的 PostgreSQL 数据库和 redis 服务。
- 使用一个命令 `yarn start` 同时启动 API, UI 和 OLAP 引擎三个服务，或者分别启动 `yarn start:api`, `yarn start:cloud` 和 `yarn start:olap`.
- 在浏览器中打开 Metad 界面链接 <http://localhost:4200> (API 运行在 <http://localhost:3000/api>)。
- 首次运行配置系统...
- 尽情享受！

### 生产
- 对于简单的部署场景（例如，用于个人或您自己的小型组织），请查看我们的 [Docker 配置](./docker-compose.demo.yml)，我们使用这些配置来部署 Metad 分析平台到 Docker 集群。
- 对于企业大规模部署, 请参考我们的 [Kubernetes 配置](https://github.com/meta-d/ocap/tree/develop/.deploy/k8s), 用来部署 Metad 分析平台到 Kubernetes 集群环境中，如 [Aliyun k8s 集群](https://cn.aliyun.com/product/kubernetes).

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
