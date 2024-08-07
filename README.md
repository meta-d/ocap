English | [中文](./README_zh.md)

[uri_metad]: https://mtda.cloud/en/
[uri_license]: https://www.gnu.org/licenses/agpl-3.0.html
[uri_license_image]: https://img.shields.io/badge/License-AGPL%20v3-blue.svg

<p align="center">
  <a href="https://mtda.cloud/en/">
  <img src="https://avatars.githubusercontent.com/u/100019674?v=4" alt="Metad">
  </a>
</p>
<p align="center">
  <em>Open-Source Analytics Platform for Enterprise Data Analysis, Indicator Management and Reporting</em>
</p>
<p align="center">
  <a href="https://github.com/meta-d/ocap/" target="_blank">
    <img src="https://visitor-badge.laobi.icu/badge?page_id=meta-d.ocap" alt="Visitors">
  </a>
  <a href="https://www.npmjs.com/@metad/ocap-core">
    <img src="https://img.shields.io/npm/v/@metad/ocap-core.svg?logo=npm&logoColor=fff&label=NPM+package&color=limegreen" alt="ocap on npm" />
  </a>&nbsp;
  <a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank">
    <img src="https://img.shields.io/badge/License-AGPL%20v3-blue.svg" alt="License: AGPL v3">
  </a>
  <a href="https://gitpod.io/#https://github.com/meta-d/ocap" target="_blank">
    <img src="https://img.shields.io/badge/Gitpod-Ready--to--Code-blue?logo=gitpod" alt="Gitpod Ready-to-Code">
  </a>
</p>

# Metad Analytics Platform

## 💡 What's New
### ChatBI: Natural Language-Driven Business Intelligence Analysis

[ChatBI](https://mtda.cloud/en/docs/chatbi) is an innovative feature we are introducing, combining chat functionality with business intelligence (BI) analysis capabilities. It offers users a more intuitive and convenient data analysis experience through natural language interaction. The main features of ChatBI include:

1. **Natural Language Querying**: Users can ask questions in natural language and get data analysis results directly without needing to understand complex query languages. This feature allows even non-technical personnel to easily obtain data insights.

2. **Multi-Turn Conversations**: Supports multi-turn conversations, allowing for continuous, context-aware interactions. The system remembers previous conversation content, enabling deeper and more precise data analysis.

3. **Support for Various Large Language Models**: ChatBI integrates multiple mainstream large language models, such as ChatGPT and Llama, enhancing the accuracy of natural language understanding and generation to meet different business needs and language support.
4. **Security and Access Control**: Provides strict data security and access control to ensure the protection of sensitive data.
5. **Integration with Multiple Data Sources**: Supports connection and integration with data from various sources, such as databases, cloud services, and SAP ERP systems, providing users with rich data sources.

[More details](https://mtda.cloud/en/blog/releases-2-5-chatbi/)

<video width="600" controls autoplay loop muted>
  <source src="https://github.com/user-attachments/assets/5f7c84be-2307-43cf-8342-bce39524e37d" type="video/mp4">
  Your browser does not support the video tag.
</video>

### Copilot Command Agents
🎉🎉 New version brings several exciting new features, particularly a comprehensive upgrade to [Copilot Command](https://www.mtda.cloud/en/docs/server/copilot/#commands) and [Business Roles](https://www.mtda.cloud/en/docs/server/copilot/#business-roles).

- [New Version 2.4 - Copilot Multi-Agent Command](https://www.mtda.cloud/en/blog/releases-2-4-copilot-multi-agent).
- [AI Digital Business Experts](https://www.mtda.cloud/en/#people-are-talking)

- **Copilot Command Agents**
  - _Dimension Members Retriever_: This feature dynamically retrieves and acquires key information of dimension members, helping users better understand data dimensions.
  - _Few Shot_: By retrieving similar examples, it provides more precise templates, making data analysis more aligned with actual needs.
  - _Suggestion_: Provides dynamic prompt completion functionality, helping users quickly generate high-quality analysis commands.
- **Business Roles** The new version also adds the Business Roles feature to the AI Copilot. Users can switch business roles during use, allowing for more precise business analysis in different scenarios. Each business role has corresponding examples. When the Copilot executes an Agent, it selects the examples most relevant to the current task to send to the LLM, ensuring more accurate results. 

[More details](https://www.mtda.cloud/en/blog/releases-2-3-copilot-agents-roles)

![copilot architecture](https://raw.githubusercontent.com/meta-d/meta-d/main/img/v2.3/copilot-architecture.png)

## 🎯 Mission

__"One Table, One Model, One Indicator System"__

Simple, efficient, integrated. Users can conduct analysis by simply dealing with one fact table. Through the multi-dimensional modeling function provided by the platform, a comprehensive set of indicators can be quickly obtained within the unified semantic model.

## 🌟 What is it

[Metad Platform][uri_metad] - **Open-Source Analytics Platform** for Enterprise Data Analysis Indicator Management and Reporting.

* **Semantic Model**: Perform multi-dimensional data modeling and analysis, allowing users to explore data from various dimensions and hierarchies.
* **Story Dashboard**: Create compelling visual narratives with Story Dashboards, combining interactive visualizations, narrative elements, and data-driven storytelling.
* **Indicator Management**: Easily define, manage, and monitor key performance indicators (KPIs) to ensure data quality, consistency, and effective performance analysis.
* **AI Copilot**: Benefit from AI-driven insights and recommendations to enhance decision-making processes and identify actionable opportunities.

![Story Workspace](https://github.com/meta-d/meta-d/raw/main/img/v2.0/story-workspace.png)

![Indicator Application](https://github.com/meta-d/meta-d/raw/main/img/v2.0/indicator-app-ai-copilot.png)

## ✨ Features

Main features:

- **Data Sources**: connects with lots of different databases and data warehouses.
  - **OLAP**: SAP BW/BPC, HANA, SSAS, Mondrian, Kylin etc.
  - **MPP DB**: StarRocks, Apache Doris, ClickHouse etc.
  - **SQL DB**: MySQL, PostgreSQL etc.
  - **MR Source**: Hive, Trino etc.
* **Semantic Model**: Supports the unified semantic modeling of two olap engines: MDX and SQL, and supports multi-dimensional modeling and analysis.
  * **Query Lab**: An environment for executing and analyzing SQL or MDX queries, with AI Copilot to assist in writing and optimizing SQL or MDX queries.
  * **Virtual Cube**: combine dimensions and measures from multiple cubes.
  * **Access Control**: The access control of the cube defined based on single role or combined role to the row level.
  * **External Cube**: support cube from third-party multiple-dimensional data source, such as SSAS, SAP BW/BPC etc.
  * **Calculated Members**: support calculated dimension members and calculated measures using MDX or SQL expression.
* **Project**: A project is a collection of story dashboards, indicators and other resources that are used to create and deliver analytics content collaborating with colleagues.
* **Indicator Management**: Define, manage, and monitor key performance indicators (KPIs) to ensure data quality, consistency, and effective performance analysis.
  * Indicator registration
  * Indicator certification
  * Indicator business area
  * Derivative indicator
  * Indicator measure
* **Indicator Market**: Publish and share indicators with other users in one place.
* **Indicator Application**: View and analyze indicators in a dedicated single page application.
* **Story Dashboard**: Create compelling visual narratives with Story Dashboards, combining interactive visualizations, narrative elements, and data-driven storytelling.
  * **Bigview Dashboard**: A story dashboard suitable for large screen display, supporting data automatic refresh and scrolling display.
  * **Mobile Design**: support mobile terminal adaptive design, support mobile terminal browser access.
  * **Story Template**: Create and share a unified style and layout template of story.
  * **Execution Explain**: Explain the execution process of SQL or MDX queries inculde query statement, slicers, query result and chart options.
* **AI Copilot**: assist users quickly design and implement story dashboards and indicators.
  * `/query` command to execute SQL or MDX queries.
  * `/story` command to create a story dashboard.
  * `/indicator` command to create an indicator.
  * `/clear` command to clear the screen.
  * ...

Basic feartures of the platform:

* Multi-tenant
* Multiple Organizations Management
* Home Dashboard
* Roles / Permissions
* Tags / Labels
* Custom SMTP
* Email Templates
* Copilot
* Country
* Currency
* Logger
* Storage File
* User
* Invite
* Business Area
* Certification
* Dark / Light and other themes

## 🌼 Screenshots

<details>
<summary>Show / Hide Screenshots</summary>

### Pareto analysis [open in new tab](https://app.mtda.cloud/public/story/892690e5-66ab-4649-9bf5-c1a9c432c01b?pageKey=bsZ0sjxnxI)
![Pareto analysis Screenshot](https://github.com/meta-d/meta-d/raw/main/img/v2.0/story-workspace.png)

### Product profit analysis [open in new tab](https://app.mtda.cloud/public/story/892690e5-66ab-4649-9bf5-c1a9c432c01b?pageKey=6S4oEUnVO3)
![Product profit analysis Screenshot](https://github.com/meta-d/meta-d/raw/main/img/v2.0/story-viewer.png)

### Reseller analysis [open in new tab](https://app.mtda.cloud/public/story/a58112aa-fc9c-4b5b-a04e-4ea9b57ebba9?pageKey=nrEZxh1aqp)
![Reseller analysis Screenshot](https://github.com/meta-d/meta-d/raw/main/img/reseller-profit-analysis.png)

### Bigview dashboard [open in new tab](https://app.mtda.cloud/public/story/9c462bea-89f6-44b8-a35e-34b21cd15a36)
![Bigview dashboard Screenshot](https://github.com/meta-d/meta-d/raw/main/img/bigview-supermart-sales.png)

### Indicator application [open in new tab](https://www.mtda.cloud/en/blog/2023/07/24/sample-adv-7-indicator-app)
![Indicator application Screenshot](https://github.com/meta-d/meta-d/raw/main/img/v2.0/indicator-app-ai-copilot.png)

### Indicator mobile app [open in new tab](https://www.mtda.cloud/en/blog/2023/07/24/sample-adv-7-indicator-app)
![Indicator mobile app Screenshot](https://github.com/meta-d/meta-d/raw/main/img/indicator-app-mobile.jpg)

</details>

## 🔗 Links

* <https://mtda.cloud/en/> check more information about the platform at the official website.
* <https://mtda.cloud/en/docs/> (WIP) check the official documentation and tutorials for more details.
* <https://mtda.cloud/en/blog/> Check out the official blog for the latest updates.
* <https://app.mtda.cloud/> Login to Metad analytics platform for free use.

## 💻 Demo, Downloads, Testing and Production

### Demo

Metad Analytics Platform Demo at <https://app.mtda.cloud>.

Notes:
- You can generate samples data in the home dashbaord page.

### Downloads

You can download [Metad Desktop Agent](https://github.com/meta-d/meta-d/releases) use to connect to your local data sources.

### Production (SaaS)

Metad Analytics Platform SaaS is available at <https://app.mtda.cloud>.

Note: it's currently in Alpha version / in testing mode, please use it with caution!

## 🧱 Technology Stack and Requirements

- [TypeScript](https://www.typescriptlang.org) language
- [NodeJs](https://nodejs.org) / [NestJs](https://github.com/nestjs/nest)
- [Nx](https://nx.dev)
- [Angular](https://angular.dev)
- [RxJS](http://reactivex.io/rxjs)
- [TypeORM](https://github.com/typeorm/typeorm)
- [ECharts](https://echarts.apache.org/)
- [Java](https://www.java.com/)
- [Mondrian](https://github.com/pentaho/mondrian)

For Production, we recommend:

- [PostgreSQL](https://www.postgresql.org)
- [PM2](https://github.com/Unitech/pm2)

Note: thanks to TypeORM, OCAP will support lots of DBs: SQLite (default, for demos), PostgreSQL (development/production), MySql, MariaDb, CockroachDb, MS SQL, Oracle, MongoDb, and others, with minimal changes.

#### See also README.md and CREDITS.md files in relevant folders for lists of libraries and software included in the Platform, information about licenses, and other details

## 📄 Documentation

Please refer to our official [Platform Documentation](https://mtda.cloud/en/docs/) and to our [Wiki](https://github.com/meta-d/ocap/wiki) (WIP) or [api references](https://meta-d.github.io/ocap/) for more details.

## 🚀 Quick Start

Please check our [Wiki - Development](https://github.com/meta-d/ocap/wiki/Development) to get started quickly.

## 💌 Contact Us

- For business inquiries: <mailto:service@mtda.cloud>
- [Metad Platform @ Twitter](https://twitter.com/CloudMtda)

## 🛡️ License

We support the open-source community.

This software is available under the following licenses:

- [Metad Analytics Platform Community Edition](https://github.com/meta-d/ocap/blob/master/LICENSE.md#metad-analytics-platform-community-edition-license)
- [Metad Analytics Platform Small Business](https://github.com/meta-d/ocap/blob/master/LICENSE.md#metad-analytics-platform-small-business-license)
- [Metad Analytics Platform Enterprise](https://github.com/meta-d/ocap/blob/master/LICENSE.md#metad-analytics-platform-enterprise-license)

#### Please see [LICENSE](LICENSE.md) for more information on licenses.

## 🍺 Contribute

- Please give us :star: on Github, it **helps**!
- You are more than welcome to submit feature requests in the [ocap repo](https://github.com/meta-d/ocap/issues)
- Pull requests are always welcome! Please base pull requests against the _develop_ branch and follow the [contributing guide](.github/CONTRIBUTING.md).
