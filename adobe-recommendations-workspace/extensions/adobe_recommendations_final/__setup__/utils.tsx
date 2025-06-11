import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: (): void => {},
    },
  });

// eslint-disable-next-line
export const createWrapper = () => {
  const testQueryClient = createTestQueryClient();
  // eslint-disable-next-line
  return function ({ children }: { children: React.ReactNode }): JSX.Element {
    return (
      <QueryClientProvider client={testQueryClient}>
        {children}
      </QueryClientProvider>
    );
  };
};
