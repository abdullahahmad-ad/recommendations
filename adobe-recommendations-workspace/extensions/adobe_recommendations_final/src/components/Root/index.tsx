import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StyleSheetManager } from "styled-components";
import { IntlProvider } from "react-intl";
import useMarketplaceContext from "../../hooks/useMarketplaceContext";
import MarketplaceContextProvider from "../../providers/MarketplaceContextProvider";
import App from "../App/index";
import messagesEn from "../../translations/en.json";
import MantineProviderWrapper from "../../providers/MantineProvider/MantineProvider";

const messages = {
  en: messagesEn,
  "en-US": messagesEn,
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // don't retry failed requests
      suspense: false, // enable <Suspense>
      refetchOnWindowFocus: false, // unless you are doing a live dashboard or some other live use case
      staleTime: 3000, // won't refetch for 3 seconds
    },
  },
});

const RootApp = (): JSX.Element => {
  const { locale } = useMarketplaceContext();
  return (
    <MantineProviderWrapper>
      <QueryClientProvider client={queryClient}>
        <StyleSheetManager
          target={document.getElementById("microui-app-styles")}
        >
          <IntlProvider
            locale={locale}
            defaultLocale="en"
            messages={messages[locale]}
          >
            <App />
          </IntlProvider>
        </StyleSheetManager>
      </QueryClientProvider>
    </MantineProviderWrapper>
  );
};

const Root = (): JSX.Element => (
  <MarketplaceContextProvider>
    <RootApp />
  </MarketplaceContextProvider>
);
export default Root;
