import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { ActivityTable } from "@/components/admin/ActivityTable";
import type { AdminActivity } from "@/lib/types/admin";

const makeRow = (overrides: Partial<AdminActivity> = {}): AdminActivity => ({
  id: "a-1",
  user_id: "user-123",
  activity_type: "login",
  resource_type: "auth",
  resource_id: null,
  details: { reason: "ok" },
  status: "success",
  ip_address: "127.0.0.1",
  user_agent: "test",
  created_at: "2026-04-19T12:00:00Z",
  ...overrides,
});

describe("ActivityTable", () => {
  it("renders the 'loading' state when isLoading is true and there are no rows", () => {
    render(<ActivityTable rows={[]} isLoading />);
    expect(screen.getByText(/admin:activities\.loading/)).toBeInTheDocument();
  });

  it("renders the empty state when not loading and no rows", () => {
    render(<ActivityTable rows={[]} />);
    expect(screen.getByText(/admin:activities\.empty/)).toBeInTheDocument();
  });

  it("uses the custom empty label when one is provided", () => {
    render(<ActivityTable rows={[]} emptyLabel="nothing to see" />);
    expect(screen.getByText("nothing to see")).toBeInTheDocument();
  });

  it("renders scalar details as key/value chips", () => {
    render(<ActivityTable rows={[makeRow({ details: { reason: "invalid_password" } })]} />);
    expect(screen.getByText("reason")).toBeInTheDocument();
    expect(screen.getByText("invalid_password")).toBeInTheDocument();
  });

  it("falls back to pretty-printed JSON when details contain a nested object", () => {
    render(<ActivityTable rows={[makeRow({ details: { nested: { key: "value" } } })]} />);
    // JSON.stringify formats across multiple lines — text queries stay loose
    // so whitespace differences don't brittle-fail.
    expect(screen.getByText(/"nested"/)).toBeInTheDocument();
    expect(screen.getByText(/"value"/)).toBeInTheDocument();
  });

  it("shows an em-dash when details is empty", () => {
    render(<ActivityTable rows={[makeRow({ details: {} })]} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("hides the user column when showUser=false", () => {
    render(<ActivityTable rows={[makeRow()]} showUser={false} />);
    expect(screen.queryByText(/admin:activities\.columns\.user/)).not.toBeInTheDocument();
  });

  it("renders first 8 chars of user_id for each row when showing users", () => {
    render(<ActivityTable rows={[makeRow({ user_id: "abcdef0123456789" })]} />);
    expect(screen.getByText("abcdef01")).toBeInTheDocument();
  });
});
