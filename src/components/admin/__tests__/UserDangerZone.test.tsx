import { fireEvent, render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { UserDangerZone } from "@/components/admin/UserDangerZone";
import type { AdminUser } from "@/lib/types/admin";
import { SystemRole } from "@/lib/types/user";

const baseUser: AdminUser = {
  id: "u1",
  email: "u@test.com",
  first_name: "U",
  last_name: "Ser",
  title: null,
  role: SystemRole.USER,
  is_active: true,
  is_verified: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  deactivated_at: null,
  deletion_scheduled_at: null,
};

const renderZone = (overrides: Partial<React.ComponentProps<typeof UserDangerZone>> = {}) => {
  const props = {
    user: baseUser,
    isSelf: false,
    disabled: false,
    onAction: vi.fn(),
    ...overrides,
  };
  render(<UserDangerZone {...props} />);
  return props;
};

describe("UserDangerZone", () => {
  it("shows 'deactivate' for active users and 'activate' for inactive ones", () => {
    const { rerender } = render(
      <UserDangerZone user={baseUser} isSelf={false} disabled={false} onAction={vi.fn()} />,
    );
    expect(
      screen.getByRole("button", { name: /admin:userDetail\.deactivate/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /admin:userDetail\.activate/ }),
    ).not.toBeInTheDocument();

    rerender(
      <UserDangerZone
        user={{ ...baseUser, is_active: false }}
        isSelf={false}
        disabled={false}
        onAction={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /admin:userDetail\.activate/ })).toBeInTheDocument();
  });

  it("disables destructive buttons for the admin's own account", () => {
    renderZone({ isSelf: true });
    expect(screen.getByRole("button", { name: /admin:userDetail\.deactivate/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /admin:userDetail\.delete/ })).toBeDisabled();
    // Reset-password stays enabled — an admin may want to rotate their own secrets.
    expect(screen.getByRole("button", { name: /admin:userDetail\.resetPassword/ })).toBeEnabled();
  });

  it("invokes onAction with the correct kind when buttons are clicked", () => {
    const props = renderZone();
    fireEvent.click(screen.getByRole("button", { name: /admin:userDetail\.resetPassword/ }));
    fireEvent.click(screen.getByRole("button", { name: /admin:userDetail\.deactivate/ }));
    fireEvent.click(screen.getByRole("button", { name: /admin:userDetail\.delete/ }));
    expect(props.onAction).toHaveBeenCalledWith("reset");
    expect(props.onAction).toHaveBeenCalledWith("deactivate");
    expect(props.onAction).toHaveBeenCalledWith("delete");
  });

  it("disables every button when the disabled flag is set", () => {
    renderZone({ disabled: true });
    for (const button of screen.getAllByRole("button")) {
      expect(button).toBeDisabled();
    }
  });
});
