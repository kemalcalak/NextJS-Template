import type { Rule } from "antd/es/form";
import type { z } from "zod";

// Adapts a zod schema into an antd Form.Item rule. Uses synchronous safeParse
// since our auth/admin schemas have no async refinements; this avoids a
// microtask per keystroke and keeps validation responsive.
export function zodFieldRule(schema: z.ZodType): Rule {
  return {
    validator: (_rule, value) => {
      const result = schema.safeParse(value);
      if (!result.success) {
        const message = result.error.issues[0]?.message ?? "Invalid";
        return Promise.reject(new Error(message));
      }
      return Promise.resolve();
    },
  };
}
