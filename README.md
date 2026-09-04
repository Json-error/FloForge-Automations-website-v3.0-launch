# FloForge

> A CRM and business automation platform built to help small businesses organize customer data and automate repetitive workflows.

[![Status](https://img.shields.io/badge/status-active%20development-blue)](https://github.com/Json-error/FloForge-Automations-website-v3.0-launch)
[![License](https://img.shields.io/badge/license-not%20specified-lightgrey)](https://github.com/Json-error/FloForge-Automations-website-v3.0-launch)

## Overview

FloForge is a full-stack SaaS project focused on practical business automation. The goal is simple: reduce repetitive administrative work by connecting customer information, workflows, scheduling, communication, and business systems in one place.

This repository contains the current FloForge website/application codebase, including the frontend, backend, automated tests, scripts, and supporting project documentation.

## What FloForge Is Built Around

- **CRM workflows** — organize contacts, companies, and business information.
- **Workflow automation** — reduce repetitive manual tasks and data entry.
- **Scheduling workflows** — support booking, confirmations, and related follow-up processes.
- **Business operations** — move information between systems and keep teams informed.
- **Integrations** — connect the tools businesses already use rather than forcing every process into one application.
- **Security and account management** — build authentication, permissions, and account controls into the product as it develops.

## Tech Stack

### Frontend

- React 19
- React Router
- Tailwind CSS
- Framer Motion
- Recharts
- Axios
- Radix UI
- React Hook Form
- Zod

### Backend

The repository includes a dedicated `backend/` application alongside the React frontend.

### Project Tooling

- Create React App / CRACO
- ESLint
- PostCSS
- GitHub
- Vercel configuration

## Repository Structure

```text
.
├── backend/          # Backend application and server-side functionality
├── frontend/         # React application
├── memory/           # Project-related memory/context files
├── scripts/          # Development and utility scripts
├── tests/            # Automated tests
├── test_reports/     # Test/report artifacts
├── design_guidelines.json
├── test_result.md
└── vercel.json
```

## Getting Started

### Prerequisites

- Node.js
- Yarn
- Access to any required backend services and environment variables

### Install dependencies

From the frontend directory:

```bash
cd frontend
yarn install
```

### Start the frontend

```bash
yarn start
```

### Create a production build

```bash
yarn build
```

### Run tests

```bash
yarn test
```

> Environment variables and backend configuration may be required for parts of the application that depend on external services. Do not commit secrets, API keys, or private credentials to the repository.

## Development Status

FloForge is an actively developed project. APIs, integrations, authentication, automation workflows, and product features may change as development continues.

The repository should therefore be treated as a development project rather than a promise that every feature listed above is production-ready.

## Why This Project Exists

Small businesses often have customer information scattered across spreadsheets, inboxes, calendars, forms, CRMs, and other tools. FloForge explores how those disconnected processes can be turned into repeatable workflows.

The larger objective is not simply to build another dashboard. It is to make business operations more programmable: capture information once, trigger the right workflow, keep systems synchronized, and reduce unnecessary manual work.

## Roadmap

Planned areas of development include:

- [ ] Expand CRM functionality
- [ ] Build additional workflow automation capabilities
- [ ] Improve scheduling and booking workflows
- [ ] Expand third-party integrations
- [ ] Improve authentication and account security
- [ ] Improve testing and reliability
- [ ] Improve documentation for developers
- [ ] Continue refining the user experience

## Contributing

Issues, feature ideas, bug reports, and technical feedback are welcome.

If you want to contribute, start by opening an issue describing the problem or proposed change. For larger changes, discuss the approach before submitting a pull request.

## Security

Never commit secrets or credentials. Use environment variables for API keys, authentication secrets, database credentials, and other sensitive configuration.

If you discover a security issue, do not publish sensitive details in a public issue. Contact the project owner privately instead.

## Project Links

- **Repository:** https://github.com/Json-error/FloForge-Automations-website-v3.0-launch
- **Owner:** https://github.com/Json-error

---

Built as an independent SaaS project exploring CRM, integrations, and business automation.
