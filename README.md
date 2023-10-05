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
  <a href="https://github.com/meta-d/ocap/releases" target="_blank">
    <img src="https://img.shields.io/github/v/release/meta-d/ocap?color=white" alt="Release">
  </a>
  <a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank">
    <img src="https://img.shields.io/badge/License-AGPL%20v3-blue.svg" alt="License: AGPL v3">
  </a>
  <a href="https://gitpod.io/#https://github.com/meta-d/ocap" target="_blank">
    <img src="https://img.shields.io/badge/Gitpod-Ready--to--Code-blue?logo=gitpod" alt="Gitpod Ready-to-Code">
  </a>
</p>

# Metad Analytics Platform

## 💡 What's New

We released new version which includes [AI Copilot](https://mtda.cloud/en/blog/copilot-1-assist-data-query) in query lab, it can assit you to write and optimize SQL or MDX queries.

## 🌟 What is it

[Metad Platform][uri_metad] - **Open-Source Analytics Platform** for Enterprise Data Analysis Indicator Management and Reporting.

* **Semantic Model**: Perform multi-dimensional data modeling and analysis, allowing users to explore data from various dimensions and hierarchies.
* **Story Dashboard**: Create compelling visual narratives with Story Dashboards, combining interactive visualizations, narrative elements, and data-driven storytelling.
* **Indicator Management**: Easily define, manage, and monitor key performance indicators (KPIs) to ensure data quality, consistency, and effective performance analysis.
* **AI Copilot**: Benefit from AI-driven insights and recommendations to enhance decision-making processes and identify actionable opportunities.

![Story Workspace](https://github.com/meta-d/meta-d/blob/main/img/en/story-workspace.png)

![Indicator Application](https://github.com/meta-d/meta-d/blob/main/img/en/indicator-application.png)

## ✨ Features

Main features:

* **Data Sources**: connects with lots of different databases and data warehouses.
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
  * **AI Copilot**: assist users quickly design and implement story dashboards.

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
* Dark / Light / Thin and other themes

## 🌼 Screenshots

<details>
<summary>Show / Hide Screenshots</summary>

### Sales overview [open in new tab](https://app.mtda.cloud/public/story/892690e5-66ab-4649-9bf5-c1a9c432c01b)
![Sales overview Screenshot](https://github.com/meta-d/meta-d/blob/main/img/adv-sales-overview.png)

### Pareto analysis [open in new tab](https://app.mtda.cloud/public/story/892690e5-66ab-4649-9bf5-c1a9c432c01b?pageKey=bsZ0sjxnxI)
![Pareto analysis Screenshot](https://github.com/meta-d/meta-d/blob/main/img/en/story-pareto-analysis.png)

### Product profit analysis [open in new tab](https://app.mtda.cloud/public/story/892690e5-66ab-4649-9bf5-c1a9c432c01b?pageKey=6S4oEUnVO3)
![Product profit analysis Screenshot](https://github.com/meta-d/meta-d/blob/main/img/profit-margin-analysis.jpg)

### Reseller analysis [open in new tab](https://app.mtda.cloud/public/story/a58112aa-fc9c-4b5b-a04e-4ea9b57ebba9?pageKey=nrEZxh1aqp)
![Reseller analysis Screenshot](https://github.com/meta-d/meta-d/blob/main/img/reseller-profit-analysis.png)

### Bigview dashboard [open in new tab](https://app.mtda.cloud/public/story/9c462bea-89f6-44b8-a35e-34b21cd15a36)
![Bigview dashboard Screenshot](https://github.com/meta-d/meta-d/blob/main/img/bigview-supermart-sales.png)

### Indicator application [open in new tab](https://www.mtda.cloud/en/blog/2023/07/24/sample-adv-7-indicator-app)
![Indicator application Screenshot](https://github.com/meta-d/meta-d/blob/main/img/en/indicator-application.png)

### Indicator mobile app [open in new tab](https://www.mtda.cloud/en/blog/2023/07/24/sample-adv-7-indicator-app)
![Indicator mobile app Screenshot](https://github.com/meta-d/meta-d/blob/main/img/indicator-app-mobile.jpg)

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
- [Angular](https://angular.io)
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

Please refer to our official [Platform Documentation](https://mtda.cloud/en/docs/) and to our [Wiki](https://github.com/meta-d/ocap/wiki) (WIP).

## 🚀 Quick Start

### With Docker Compose

- Clone repo.
- Make sure you have Docker Compose [installed locally](https://docs.docker.com/compose/install).
- Copy `.env.compose` file into `.env` file in the root of mono-repo (the file contains default env variables definitions).
- Run `docker-compose -f docker-compose.demo.yml up`, if you want to run the platform using our prebuild Docker images. _(Note: it uses latest images pre-build automatically from head of `main` branch using GitHub CI/CD.)_
- Run `docker-compose up`, if you want to build everything (code and Docker images) locally. _(Note: this is extremely long process, option above is much faster.)_
- Open <http://localhost:4200> in your browser.
- The first time you will enter the onborading page. Follow the prompts to complete the initial settings ( organization, samples and connect your data source), and then you can start using it.
- Enjoy!

### Manually

#### Required

- Install [NodeJs](https://nodejs.org/en/download) LTS version or later, e.g. 18.x.
- Install [Yarn](https://github.com/yarnpkg/yarn) (if you don't have it) with `npm i -g yarn`.
- Install NPM packages and bootstrap solution using the command `yarn bootstrap`.
- Copy [`.env.local`](./.env.local) file into `.env` and adjust settings in the file which is used in local runs.
- Run command `docker-compose -f docker-compose.dev.yml up -d` to start PostgreSQL database and redis services.
- Run both API, UI and OLAP engine with a single command: `yarn start`, or run them separately with `yarn start:api`, `yarn start:cloud` and `yarn start:olap`.
- Open Metad UI on <http://localhost:4200> in your browser (API runs on <http://localhost:3000/api>).
- Onboarding...
- Enjoy!

### Production

- For simple deployment scenarios (e.g. for yourself or your own small organization), check our [Docker Compose file](./docker-compose.demo.yml), which we are using to deploy Metad Analytics Platform to docker cluster.
- For production deployment scenarios (e.g. for enterprise organization), check our [Kubernetes configurations](https://github.com/meta-d/ocap/tree/develop/.deploy/k8s), which we are using to deploy Metad Analytics Platform into Kubernetes platform, for example [Aliyun k8s cluster](https://cn.aliyun.com/product/kubernetes).

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
