import { describe, expect, it } from "vitest";

import { buildWsUrl } from "@/lib/websocket/support-socket";

describe("buildWsUrl", () => {
  it("derives a ws(s) url including the api prefix and path", () => {
    const url = buildWsUrl("/support/tickets/abc/ws");
    expect(url).toMatch(/^wss?:\/\//);
    expect(url).toContain("/api/v1/support/tickets/abc/ws");
  });

  it("normalizes a path missing its leading slash", () => {
    expect(buildWsUrl("admin/support/ws")).toBe(buildWsUrl("/admin/support/ws"));
  });

  it("does not keep the http(s) scheme", () => {
    expect(buildWsUrl("/support/tickets/x/ws")).not.toMatch(/^http/);
  });
});
