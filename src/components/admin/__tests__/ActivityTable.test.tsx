import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { ActivityTable } from "@/components/admin/ActivityTable";
import type { AdminActivity } from "@/lib/types/admin";

const makeRow = (overrides: Partial<AdminActivity> = {}): AdminActivity => ({
  id: "a-1",
  user_id: "user-123",
  user: null,
  activity_type: "login",
  resource_type: "auth",
  resource_id: null,
  details: { reason: "ok" },
  status: "success",
  status_code: 200,
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

  it("falls back to the first 8 chars of user_id when no actor is embedded", () => {
    render(<ActivityTable rows={[makeRow({ user_id: "abcdef0123456789", user: null })]} />);
    expect(screen.getByText("abcdef01")).toBeInTheDocument();
  });

  it("shows the actor's name when the activity embeds a user", () => {
    render(
      <ActivityTable
        rows={[
          makeRow({
            user: { id: "u-1", email: "ada@test.com", first_name: "Ada", last_name: "Admin" },
          }),
        ]}
      />,
    );
    expect(screen.getByText("Ada Admin")).toBeInTheDocument();
  });

  it("shows the actor's email when no name is set", () => {
    render(
      <ActivityTable
        rows={[
          makeRow({
            user: { id: "u-2", email: "noname@test.com", first_name: null, last_name: null },
          }),
        ]}
      />,
    );
    expect(screen.getByText("noname@test.com")).toBeInTheDocument();
  });

  it("renders the HTTP status_code as a badge", () => {
    render(<ActivityTable rows={[makeRow({ status_code: 401 })]} />);
    expect(screen.getByText("401")).toBeInTheDocument();
  });

  it("shows an em-dash when status_code is null", () => {
    render(<ActivityTable rows={[makeRow({ status_code: null, details: { reason: "x" } })]} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
