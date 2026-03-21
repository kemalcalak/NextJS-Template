# Agent Instructions — NextJS-Template

## Before Starting ANY Task

1. **Check existing files first** → Never create duplicates
   - Check `src/schemas/` for existing Zod schemas
   - Check `src/stores/` for existing Zustand stores
   - Check `src/lib/api/endpoints/` for existing services
   - Check `src/components/common/` for reusable components

2. **Understand the context**
   - Read the file/folder you're modifying
   - Check test files for patterns and constants
   - Verify the locale routing structure for new pages

3. **Type-first approach**
   - Define types/interfaces first, then implementation
   - Use existing types from `src/lib/types/`
   - Create new types only if they don't exist

---

## Creating a New Page

### Steps:

1. Create page under `src/app/[locale]/{feature}/page.tsx`
2. Add route to `src/lib/config/routes.ts` (if public/protected)
3. Create translation keys in BOTH:
   - `src/i18n/locales/en/{namespace}.json`
   - `src/i18n/locales/tr/{namespace}.json`
4. Use `useLanguage()` for ALL user-facing strings (titles, buttons, labels)
5. Wrap with `"use client"` if interactive
6. Wire API/state through store or React Query
7. Add E2E test in `tests-e2e/` matching folder structure

### Example Page Structure:

```typescript
// src/app/[locale]/profile/page.tsx
"use client";

import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/auth.store";

export default function ProfilePage() {
  const { t } = useTranslation("profile");
  const { user } = useAuthStore();

  return <div>{t("heading")}</div>;
}
```

> **Note**: `page.tsx` requires default export (Next.js App Router). All other components use named exports.

### Add Translations:

```json
// en/profile.json
{ "heading": "User Profile" }

// tr/profile.json
{ "heading": "Kullanıcı Profili" }
```

---

## Creating a New Component

### Decision Tree:

1. **Is it in shadcn/ui?** → Run `pnpm dlx shadcn@latest add <name>`
   - Example: `pnpm dlx shadcn@latest add button`, `pnpm dlx shadcn@latest add dialog`
2. **Is it reusable across multiple pages?** → `src/components/common/`
3. **Is it auth-specific?** → `src/components/auth/`
4. **Is it page-specific?** → Co-locate in the page folder or feature folder
5. **Is it UI primitive?** → `src/components/ui/` (rarely add here)

### Component Template:

```typescript
// src/components/common/MyComponent.tsx
"use client";

import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface MyComponentProps {
  title: string;
  children?: ReactNode;
  onAction: () => void;
}

export function MyComponent({ title, children, onAction }: MyComponentProps) {
  return (
    <div>
      <h2>{title}</h2>
      {children}
      <Button onClick={onAction}>Action</Button>
    </div>
  );
}
```

### Component Rules:

- Use TypeScript interfaces for props (not types)
- Export as named export
- If using translations, pass `t` from parent via props
- Use Tailwind classes only (no inline styles)
- Keep max complexity manageable (aim for 50-100 lines)

---

## Creating a New API Call

### Steps:

1. Create/update schema in `src/schemas/`
2. Create/update service function in `src/lib/api/endpoints/{feature}.ts`
3. Use React Query hooks in components (`useQuery`, `useMutation`)
4. Type all payloads and responses with Zod

### Example API Flow:

**1. Schema** (`src/schemas/user.ts`):

```typescript
import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name required"),
  email: z.string().email(),
});

export type UpdateProfilePayload = z.infer<typeof updateProfileSchema>;
```

**2. API Service** (`src/lib/api/endpoints/users.ts`):

```typescript
import { updateProfileSchema } from "@/schemas/user";
import type { UpdateProfilePayload } from "@/schemas/user";
import api from "../api";

export const userService = {
  updateProfile: async (payload: UpdateProfilePayload) => {
    return api.patch("/users/me", payload);
  },
};
```

**3. Component Usage**:

```typescript
import { useMutation } from "@tanstack/react-query";
import { userService } from "@/lib/api/endpoints/users";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { updateProfileSchema } from "@/schemas/user";

const { mutate, isPending } = useMutation({
  mutationFn: userService.updateProfile,
});

const form = useForm({
  resolver: zodResolver(updateProfileSchema),
});

onSubmit={(data) => mutate(data)};
```

---

## Creating a New Store (Zustand)

### Steps:

1. Create `src/stores/{feature}.store.ts`
2. Define TypeScript interface for state
3. Use `persist` middleware for localStorage
4. Export as named store
5. Use in components with `const { state } = useStore()`

### Store Template:

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/lib/types/user";

interface ProfileState {
  preferences: {
    theme: "light" | "dark";
    language: string;
  };
  updatePreferences: (prefs: Partial<ProfileState["preferences"]>) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      preferences: {
        theme: "light",
        language: "en",
      },
      updatePreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),
    }),
    {
      name: "profile-storage",
    },
  ),
);
```

### Store Rules:

- Never hold API response data that React Query manages
- Use for UI state (theme, sidebar open/closed), auth state only
- Prefer React Query for server state

---

## Writing E2E Tests

### Steps:

1. Create `tests-e2e/{feature}/{action}.spec.ts`
2. Use Base Test from `base-test.ts` for mocked API
3. Follow Page Object pattern for reusability
4. Mock API responses explicitly in each test

### Test Template:

```typescript
import { test, expect } from "@/tests-e2e/base-test";
import { LoginPage } from "@/tests-e2e/pages/LoginPage";

test("user can log in", async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Mock API response
  await page.route("**/api/v1/auth/login", async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({ access_token: "mock_token" }),
    });
  });

  // Test
  await loginPage.goto();
  await loginPage.fillEmail("user@example.com");
  await loginPage.fillPassword("password");
  await loginPage.clickLogin();

  await expect(page).toHaveURL("/en/dashboard");
});
```

### Page Object Pattern:

```typescript
import { type Page } from "@playwright/test";

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/en/login");
  }

  async fillEmail(email: string) {
    await this.page.fill('input[name="email"]', email);
  }

  async clickLogin() {
    await this.page.click("button:has-text('Log In')");
  }
}
```

### Test Rules:

- Always mock API calls (never hit real backend)
- Use Page Objects for reusable test helpers
- Test happy path + error cases
- Run with `pnpm test:e2e`

---

## Modifying Existing Files

### Before Changes:

1. Read the entire file to understand structure
2. Check for related tests
3. Check if changes affect other files (search usage)

### After Changes:

1. Run `pnpm lint` to check for errors
2. Run `pnpm format` to auto-fix formatting
3. Add/update types and schemas if needed
4. Update tests if behavior changed

---

## Adding Translations

### Process:

1. Identify namespace (auth, errors, success, profile, common, etc.)
2. Add key to BOTH `en/{namespace}.json` and `tr/{namespace}.json`
3. Use in component: `const { t } = useTranslation('namespace'); t('key')`
4. Never hardcode strings in JSX

### Example:

```json
// src/i18n/locales/en/errors.json
{ "email_required": "Email is required", "password_short": "Password must be at least 8 characters" }

// src/i18n/locales/tr/errors.json
{ "email_required": "E-posta gerekli", "password_short": "Şifre en az 8 karakter olmalı" }
```

Usage in component:

```typescript
const { t } = useTranslation("errors");
<span>{t("email_required")}</span>
```

---

## Forbidden Actions

- ❌ Do NOT create `middleware.ts` — use `src/proxy.ts` instead
- ❌ Do NOT use default exports
- ❌ Do NOT call `fetch()` or `axios` directly — use API abstraction
- ❌ Do NOT hardcode URLs — use env vars
- ❌ Do NOT create CSS files — use Tailwind only
- ❌ Do NOT add webpack config — Turbopack is default
- ❌ Do NOT skip Zod validation — all API payloads must have schemas
- ❌ Do NOT use `useEffect` for external API calls — use React Query
- ❌ Do NOT commit `.env` files

---

## Quick Reference

| Task           | Where?                        | Pattern                   |
| -------------- | ----------------------------- | ------------------------- |
| State (client) | `src/stores/`                 | Zustand + persist         |
| State (server) | Components                    | React Query hooks         |
| API calls      | `src/lib/api/endpoints/`      | Typed service functions   |
| Validation     | `src/schemas/`                | Zod schemas               |
| UI component   | `src/components/common/`      | Named export + TypeScript |
| Auth component | `src/components/auth/`        | Reusable auth flows       |
| Page           | `src/app/[locale]/{feature}/` | Page + translations       |
| Translation    | `src/i18n/locales/{en,tr}/`   | Namespace + key           |
| E2E test       | `tests-e2e/{feature}/`        | Page Object pattern       |

---

## Development Workflow

1. **Create schema** → Define types with Zod
2. **Create API service** → Function that calls endpoint
3. **Create component** → Use React Query or Zustand
4. **Add translations** → Both en + tr
5. **Test locally** → `pnpm dev`
6. **Write E2E test** → Playwright
7. **Lint & format** → `pnpm lint && pnpm format`
8. **Commit** → Conventional commit message
