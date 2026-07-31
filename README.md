# PasteBin - Full Stack Monorepo

[![CI Status](https://github.com/asvandkanakaraj/PasteBin/actions/workflows/ci.yml/badge.svg)](https://github.com/asvandkanakaraj/PasteBin/actions/workflows/ci.yml)

Welcome to the **PasteBin** code-sharing platform project. This is a high-performance, full-stack monorepo structured using npm workspaces.

## Repository Structure

- `apps/web`: React + Vite frontend application.
- `apps/server`: Node.js + Express backend server.
- `packages/database`: Prisma ORM schema and database client configuration.
- `packages/shared`: Shared TypeScript types, utility functions, and Zod verification schemas.
- `docker`: Environment-specific Dockerfiles and compose setups.
- `scripts`: Automation and orchestration utilities.

## Prerequisites

- Node.js (v18 or newer recommended)
- npm (v7 or newer for workspace support)

## Setup

Install dependencies at the root of the workspace:

```bash
npm install
```
