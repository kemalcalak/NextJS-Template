import React from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { MotionConfig } from "motion/react";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

export function renderWithProviders(ui: React.ReactElement) {
  const testQueryClient = createTestQueryClient();
  return {
    ...render(
      <QueryClientProvider client={testQueryClient}>
        <MotionConfig transition={{ duration: 0 }}>{ui}</MotionConfig>
      </QueryClientProvider>,
    ),
    testQueryClient,
  };
}

export const createWrapper = () => {
  const testQueryClient = createTestQueryClient();
  // eslint-disable-next-line react/display-name
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>
      <MotionConfig transition={{ duration: 0 }}>{children}</MotionConfig>
    </QueryClientProvider>
  );
};
