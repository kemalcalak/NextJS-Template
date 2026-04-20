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
};

const inactive: AdminUser = { ...active, id: "u2", email: "u2@test.com", is_active: false };

const makeProps = () => ({
  currentUserId: null,
  onAction: vi.fn(),
});

describe("UsersTable", () => {
  it("renders a row per user and hides the empty state", () => {
    const props = makeProps();
    renderWithProviders(<UsersTable rows={[active, inactive]} isLoading={false} {...props} />);
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
  it("opens the row-actions menu and calls onAction('deactivate') for an active user", async () => {
    const user = userEvent.setup();
    const props = makeProps();
    renderWithProviders(<UsersTable rows={[active]} isLoading={false} {...props} />);

    await user.click(screen.getByRole("button", { name: /admin:users\.rowActions\.menu/ }));
    const menu = await screen.findByRole("menu");
    await user.click(within(menu).getByText(/admin:users\.rowActions\.deactivate/));
    expect(props.onAction).toHaveBeenCalledWith("deactivate", active);
  });

  it("swaps the menu to activate for inactive users", async () => {
    const user = userEvent.setup();
    const props = makeProps();
    renderWithProviders(<UsersTable rows={[inactive]} isLoading={false} {...props} />);
    await user.click(screen.getByRole("button", { name: /admin:users\.rowActions\.menu/ }));
    const menu = await screen.findByRole("menu");
    await user.click(within(menu).getByText(/admin:users\.rowActions\.activate/));
    expect(props.onAction).toHaveBeenCalledWith("activate", inactive);
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
