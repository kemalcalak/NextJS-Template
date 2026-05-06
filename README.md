# ⚛️ Next.js 16 + React 19 + TypeScript Enterprise Template

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-8%2B-blue)](https://pnpm.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-blue)](https://www.typescriptlang.org/)

A modern, production-ready Next.js template utilizing Next.js 16, React 19, TypeScript, and a clean project structure with built-in internationalization (i18n) support. This template is designed for building robust and scalable full-stack applications with clear separation of concerns, easy testing, comprehensive i18n capabilities, and high maintainability.

## 💡 Why This Template?

While standard Next.js starters or Create React App provide a blank canvas, they leave you spending hours (or days) configuring architectural foundations, linting rules, state management, and internationalization. This template targets **Enterprise-Grade Readiness** from minute zero.

- **Pre-Configured Tooling:** ESLint, Prettier, TypeScript, Vitest, and Playwright are interlinked instantly. No conflicting configurations.
- **Scalable Architecture vs. Flat Folders:** Replaces the typical flat `src/` directory with a structured, feature-based layered architecture meant to hold hundreds of components without becoming a "spaghetti" mess.
- **Built-In Internationalization:** `react-i18next` is pre-configured with English and Turkish support, including localized validation/error/success messages ready for backend integration.
- **Strict State Separation:** Enforces best practices out of the box—Zustand handles global UI state, while React Query exclusively manages asynchronous server state and caching.
- **Next.js Server Components Ready:** Leverages Next.js 16 App Router with locale-based routing and server-side rendering capabilities.
- **Immediate E2E Testing:** Playwright is pre-installed and configured. You don't have to bolt it on later when the project is already complex.

---

## 🏗 Architecture Philosophy

This template strictly follows a **Feature-Based / Layered UI Architecture with Next.js Server Components**:

- **API Abstraction Layer (`src/lib/api`):** All external data fetching is isolated here. UI components never call `fetch` or `axios` directly. Uses Axios for consistent HTTP client behavior.
- **Shared UI Primitives (`src/components/ui`):** Uses Radix UI + Tailwind for a highly customizable, accessible, and unstyled base. Includes shadcn integration.
- **Domain / Feature Modules:** Complex parts of the app are encapsulated by feature, not just by file type. Auth and protected routes follow convention-based routing.
- **Global vs Local State:** Global UI state is handled purely by `Zustand` (located in `src/stores`), while remote data is handled by `React Query`.
- **Locale-Based Routing:** Built-in support for multi-language routing using Next.js dynamic segments (`[locale]`).

---

## 🔗 Backend Compatibility

This frontend template is designed to seamlessly integrate with the companion **FastAPI Layered Architecture Template**.
You can find the backend template here: [kemalcalak/fastapi-template](https://github.com/kemalcalak/fastapi-template).

The API proxy is pre-configured in `next.config.ts` to forward requests from your app to the backend API.

---

## 🚀 Features

- **Latest React version:** [React 19](https://react.dev/) with concurrent rendering features.
- **Modern Meta Framework:** [Next.js 16](https://nextjs.org/) with App Router for file-based routing, server components, and built-in optimization.
- **Type Safety:** [TypeScript](https://www.typescriptlang.org/) for static typing and better developer experience.
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/) for global state and [React Query](https://tanstack.com/query) for server state/data fetching.
- **HTTP Client:** [Axios](https://axios-http.com/) with centralized API configuration and interceptors.
- **Styling & UI:** [Tailwind CSS 4](https://tailwindcss.com/) with [Radix UI](https://www.radix-ui.com/) primitives and [shadcn](https://ui.shadcn.com/) integration for pre-built accessible components.
- **Forms & Validation:** [React Hook Form](https://react-hook-form.com/) combined with [Zod](https://zod.dev/) for schema-based, type-safe validation.
- **Code Quality:** ESLint 9 and Prettier pre-configured for consistent code style and formatting.
- **Pre-commit Hooks:** [Husky](https://typicode.github.io/husky/) + [lint-staged](https://github.com/lint-staged/lint-staged) auto-run ESLint + Prettier on staged files before every commit.
- **Error Tracking:** [Sentry](https://sentry.io/) integration for client, server, and edge runtimes. Skipped automatically when no DSN is provided.
- **Internationalization:** `react-i18next` with multi-language support (English & Turkish included) featuring localized validation/error/success messages matching backend responses.
- **Dark Mode:** [next-themes](https://github.com/pacocoursey/next-themes) for effortless light/dark theme switching.
- **Icons & Animations:** [Lucide React](https://lucide.dev/) for beautiful icons and [Motion](https://motion.dev/) for smooth animations.
- **Toast Notifications:** [Sonner](https://sonner.emilkowal.ski/) for elegant success/error toast notifications.
- **Testing:** Comprehensive test suite setup utilizing **Vitest** for unit/component tests and **Playwright** for End-to-End (E2E) testing.
- **Mocking:** MSW (Mock Service Worker) for API mocking during testing and development.
- **Protected Routes:** Built-in auth flow with protected route segments using Next.js conventions.

---

## ✅ CI/CD Ready

The repository structure supports standard Continuous Integration pipelines out-of-the-box. Ensure you configure your CI (GitHub Actions, GitLab CI, etc.) to run:

1.  **Dependency Install:** `pnpm install --frozen-lockfile`
2.  **Linting:** `pnpm run lint`
3.  **Formatting Check:** `pnpm run format:check`
4.  **Unit & Component Tests:** `pnpm vitest run` (Vitest)
5.  **Type Checking & Build:** `pnpm run build`
6.  **E2E Tests:** `pnpm run test:e2e` (Playwright)

---

## 📦 Setup & Local Development

### Prerequisites

- Node.js (v18 or higher recommended)
- **`pnpm` package manager** (strictly recommended for this project)
  - `pnpm` offers faster dependency resolution, better disk space efficiency, and strict dependency isolation compared to npm. It's configured in `pnpm-workspace.yaml` and `package.json` for optimal monorepo support and lockfile consistency.

### 1. Install Dependencies

Navigate to your project folder and install the required dependencies using `pnpm`:

```bash
pnpm install
```

### 2. Environment Variables

Create a `.env.local` file (or copy from `.env.example`) and configure your API endpoints:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_PREFIX=/api/v1
NEXT_PUBLIC_APP_NAME=MyApp

# Sentry (leave empty to disable error tracking)
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0
SENTRY_TRACES_SAMPLE_RATE=0
# Source map upload (CI only — leave empty locally)
SENTRY_ORG=
SENTRY_PROJECT=
SENTRY_AUTH_TOKEN=
```

**Environment Variables Explained:**

- `NEXT_PUBLIC_API_URL`: Base URL of your FastAPI backend server
- `NEXT_PUBLIC_API_PREFIX`: API version prefix (commonly `/api/v1`)
- `NEXT_PUBLIC_APP_NAME`: Application name displayed throughout the UI

**Optional — Sentry (leave empty to disable):**

- `NEXT_PUBLIC_SENTRY_DSN`: DSN used by the browser SDK (`src/instrumentation-client.ts`)
- `SENTRY_DSN`: DSN used by the server / edge SDK (`src/instrumentation.ts`)
- `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE` / `SENTRY_TRACES_SAMPLE_RATE`: Performance sampling (0–1, default 0)
- `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN`: Required only in CI to upload source maps. Leave empty locally.

### 3. Start the Development Server

Start the Next.js development server with Hot Module Replacement (HMR):

```bash
pnpm run dev
```

The application will be available at `http://localhost:3000`.

---

## 🛠️ Available Scripts / Commands

This project uses `pnpm` to manage dependencies and run scripts. Below are the key commands available:

### 🏃‍♂️ Running the App

- **`pnpm run dev`**: Starts the local Next.js development server with hot reload.
- **`pnpm run build`**: Compiles TypeScript and builds the app for production into the `.next` directory.
- **`pnpm start`**: Starts the production server (requires `pnpm run build` first).

### 🧪 Testing

The project uses [Vitest](https://vitest.dev/) for unit and component testing, and [Playwright](https://playwright.dev/) for End-to-End (E2E) testing.

- **`pnpm vitest run`**: Runs unit and component tests once (CI-style).
- **`pnpm vitest`**: Runs Vitest in watch mode.
- **`pnpm vitest run path/to/file.test.tsx`**: Runs a single test file.
- **`pnpm run test:e2e`**: Runs Playwright E2E tests in the `tests-e2e` folder to simulate user interactions across the entire application.
- **`pnpm run test:e2e --project=chromium-desktop`**: Runs E2E in a single browser project.
- **`pnpm run test:e2e:report`**: Shows the Playwright test report from the latest test run.

### 🧹 Code Quality & Formatting

This project uses ESLint v9 for catching logical errors and Prettier for code formatting.

- **`pnpm run lint`**: Runs ESLint to find problems in your code.
- **`pnpm run format`**: Automatically formats all supported files using Prettier.
- **`pnpm run format:check`**: Checks if files are properly formatted (useful for CI/CD pipelines).
- **`pnpm tsc -b`**: TypeScript type check (CI runs this).

### 🪝 Git Hooks (Husky + lint-staged)

Husky installs the hooks on `pnpm install` (via the `prepare` script). Two hooks ship:

**`pre-commit`** (~10–15 s) — runs on every `git commit`:

1. `pnpm lint-staged` — staged files only:
   - `*.{ts,tsx,js,mjs,cjs}` → `eslint --fix` then `prettier --write`
   - `*.{json,md,css,yml,yaml}` → `prettier --write`
2. `pnpm tsc -b` — full project TypeScript type check (incremental cache after the first run).

If ESLint can't auto-fix an issue or `tsc` reports a type error, the commit is aborted.

**`pre-push`** (~30–90 s) — runs on every `git push`:

- `pnpm build` — full production build. Catches issues that escape typecheck (RSC boundary violations, missing env vars validated by `src/env.ts`, route conflicts) before anything reaches the remote.

Configuration lives in `lint-staged.config.mjs`, `.husky/pre-commit`, and `.husky/pre-push`. Build / Vitest / Playwright run in CI on top of all this — see `.github/workflows/ci.yml`.

---

## 📂 Project Structure

```bash
├── src/
│   ├── app/              # Next.js App Router (Pages, Layouts, and Route Handlers)
│   │   ├── globals.css   # Global styles
│   │   ├── layout.tsx    # Root layout
│   │   ├── global-error.tsx  # Root-level error boundary (Sentry capture)
│   │   ├── [locale]/     # Locale-based routing segment
│   │   │   ├── page.tsx              # Home page
│   │   │   ├── layout.tsx            # Locale layout
│   │   │   ├── (auth)/               # Auth routes group
│   │   │   └── (protected)/          # Protected routes group
│   │   └── ...           # Additional routes, API handlers, etc.
│   ├── components/       # Reusable UI components organized by feature
│   │   ├── auth/         # Authentication-related components
│   │   ├── common/       # Common/shared components (Header, Footer, etc.)
│   │   ├── profile/      # Profile-related components
│   │   └── ui/           # Base UI primitives (Button, Input, Dialog, etc.)
│   ├── hooks/            # Custom React hooks (useAuth, useTheme, etc.)
│   │   ├── api/          # API-related hooks
│   │   └── __tests__/    # Hook tests
│   ├── lib/              # Utilities and library abstractions
│   │   ├── api/          # Centralized API client configuration
│   │   ├── config/       # App configuration constants
│   │   ├── seo/          # SEO utilities
│   │   ├── types/        # Global TypeScript types
│   │   └── utils.ts      # Utility functions
│   ├── i18n/             # Internationalization configuration
│   │   ├── config.ts     # i18next configuration
│   │   ├── server.ts     # Server-side i18n helpers
│   │   └── locales/      # Translation files (en/, tr/)
│   ├── providers/        # React Context Providers
│   │   ├── ClientSideProviders.tsx  # Client-side providers wrapper
│   │   ├── QueryProvider.tsx         # React Query provider
│   │   └── ThemeProvider.tsx         # Theme provider
│   ├── schemas/          # Zod validation schemas
│   │   ├── auth.ts       # Auth-related schemas
│   │   └── user.ts       # User-related schemas
│   ├── stores/           # Zustand global state stores
│   │   ├── auth.store.ts # Authentication store
│   │   └── __tests__/    # Store tests
│   ├── test/             # Test utilities and setup
│   │   ├── setup.ts      # Vitest setup
│   │   ├── test-utils.tsx # Testing utilities
│   │   └── msw/          # Mock Service Worker setup
│   ├── proxy.ts          # Locale routing + auth guard (Next.js 16 successor to middleware.ts)
│   ├── instrumentation.ts        # Sentry init for server / edge runtimes
│   └── instrumentation-client.ts # Sentry init for browser runtime
├── tests-e2e/            # Playwright E2E tests
│   ├── auth/             # Auth-related E2E tests
│   ├── common/           # Common feature E2E tests
│   ├── dashboard/        # Dashboard E2E tests
│   └── base-test.ts      # Base test configuration
├── public/               # Static assets (images, favicon, etc.)
├── .husky/               # Git hooks managed by Husky
│   └── pre-commit        # Runs lint-staged before every commit
├── .env.example          # Example environment variables
├── .prettierrc           # Prettier configuration
├── .prettierignore       # Files Prettier should skip
├── components.json       # shadcn configuration
├── eslint.config.mjs     # ESLint unified configuration
├── lint-staged.config.mjs # lint-staged file-pattern → command map
├── next.config.ts        # Next.js configuration (proxy + Sentry wrapper)
├── package.json          # Dependencies and scripts
├── playwright.config.ts  # Playwright configuration
├── postcss.config.mjs    # PostCSS configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── vitest.config.ts      # Vitest configuration
```

---

## 🌐 Internationalization (i18n)

This template comes with a fully configured `react-i18next` setup supporting **English (en)** and **Turkish (tr)**:

### Add a New Language

1. Create new language files in `src/i18n/locales/{lang}/`:

   ```
   src/i18n/locales/de/ (for German)
   ├── auth.json
   ├── common.json
   ├── validation.json
   └── ...
   ```

2. Update `src/i18n/config.ts` to import and register the new language

3. Update `src/i18n/server.ts` if you need server-side language detection

### Using Translations in Components

```tsx
import { useTranslation } from "react-i18next";

export function MyComponent() {
  const { t } = useTranslation(["auth", "common"]);
  return <h1>{t("common:welcome")}</h1>;
}
```

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

> This project follows [Conventional Commits](https://www.conventionalcommits.org/).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See the `LICENSE` file at the root of the workspace for more information.

---

## 🚀 Getting Started Checklist

- [ ] Clone the repository
- [ ] Run `pnpm install`
- [ ] Set up `.env.local` with your API endpoints
- [ ] Start the development server with `pnpm run dev`
- [ ] Open `http://localhost:3000` in your browser
- [ ] Review the project structure and familiarize yourself with the codebase
- [ ] Check the E2E tests in `tests-e2e/` to understand the testing patterns
- [ ] Update the i18n translation files in `src/i18n/locales/` as needed

---

Created with ❤️ by [kemalcalak](https://github.com/kemalcalak)
