import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { UsersTable } from "@/components/admin/UsersTable";
import type { AdminUser } from "@/lib/types/admin";
import { SystemRole } from "@/lib/types/user";
import { renderWithProviders } from "@/test/test-utils";

const active: AdminUser = {
  id: "u1",
  email: "u1@test.com",
  first_name: "Ann",
  last_name: "Active",
  title: null,
  role: SystemRole.USER,
  is_active: true,
  is_verified: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  deactivated_at: null,
  deletion_scheduled_at: null,
  suspended_at: null,
};

const suspended: AdminUser = {
  ...active,
  id: "u2",
  email: "u2@test.com",
  is_active: false,
  suspended_at: "2026-04-20T10:00:00Z",
};

const makeProps = () => ({
  currentUserId: null,
  onAction: vi.fn(),
});

describe("UsersTable", () => {
  it("renders a row per user and hides the empty state", () => {
    const props = makeProps();
    renderWithProviders(<UsersTable rows={[active, suspended]} isLoading={false} {...props} />);
    expect(screen.getByText("u1@test.com")).toBeInTheDocument();
    expect(screen.getByText("u2@test.com")).toBeInTheDocument();
    expect(screen.queryByText(/admin:users\.empty/)).not.toBeInTheDocument();
  });

  it("shows the empty translation key when no rows and not loading", () => {
    const props = makeProps();
    renderWithProviders(<UsersTable rows={[]} isLoading={false} {...props} />);
    expect(screen.getByText(/admin:users\.empty/)).toBeInTheDocument();
  });

  it("shows the loading label when the table is waiting on the first page", () => {
    const props = makeProps();
    renderWithProviders(<UsersTable rows={[]} isLoading {...props} />);
    expect(screen.getByText(/admin:users\.loading/)).toBeInTheDocument();
  });

  // Radix DropdownMenu only opens through pointer events — jsdom+fireEvent.click
  // alone leaves it in `data-state="closed"`, so these tests use userEvent which
  // dispatches the full pointer+click sequence.
  it("opens the row-actions menu and calls onAction('suspend') for an active user", async () => {
    const user = userEvent.setup();
    const props = makeProps();
    renderWithProviders(<UsersTable rows={[active]} isLoading={false} {...props} />);

    await user.click(screen.getByRole("button", { name: /admin:users\.rowActions\.menu/ }));
    const menu = await screen.findByRole("menu");
    await user.click(within(menu).getByText(/admin:users\.rowActions\.suspend/));
    expect(props.onAction).toHaveBeenCalledWith("suspend", active);
  });

  it("swaps the menu to unsuspend for suspended users", async () => {
    const user = userEvent.setup();
    const props = makeProps();
    renderWithProviders(<UsersTable rows={[suspended]} isLoading={false} {...props} />);
    await user.click(screen.getByRole("button", { name: /admin:users\.rowActions\.menu/ }));
    const menu = await screen.findByRole("menu");
    await user.click(within(menu).getByText(/admin:users\.rowActions\.unsuspend/));
    expect(props.onAction).toHaveBeenCalledWith("unsuspend", suspended);
  });

  it("calls onAction('delete') from the menu", async () => {
    const user = userEvent.setup();
    const props = makeProps();
    renderWithProviders(<UsersTable rows={[active]} isLoading={false} {...props} />);
    await user.click(screen.getByRole("button", { name: /admin:users\.rowActions\.menu/ }));
    const menu = await screen.findByRole("menu");
    await user.click(within(menu).getByText(/admin:users\.rowActions\.delete/));
    expect(props.onAction).toHaveBeenCalledWith("delete", active);
  });
});
