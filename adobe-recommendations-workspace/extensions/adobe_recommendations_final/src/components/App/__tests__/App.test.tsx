import React from "react";
import { render } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { axe, toHaveNoViolations } from "jest-axe";
import { IntlProvider } from "react-intl";
import useMarketplaceAccount from "../../../hooks/useMarketplaceAccount";
import App from "../index";

expect.extend(toHaveNoViolations);
jest.mock("../../../hooks/useMarketplaceAccount");

const mockedUseMarketplaceAccount = useMarketplaceAccount as jest.Mock<any>;

describe("App", () => {
  mockedUseMarketplaceAccount.mockImplementation(() => ({
    data: {},
    isSuccess: true,
    isError: false,
    isLoading: false,
  }));
  window.get_extension_asset = jest.fn();

  it("renders", () => {
    const { container } = render(
      <MantineProvider>
        <IntlProvider locale="en-US" onError={(): void => {}}>
          <App />
        </IntlProvider>
      </MantineProvider>
    );
    expect(container).toBeDefined();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <MantineProvider>
        <IntlProvider locale="en-US" onError={(): void => {}}>
          <App />
        </IntlProvider>
      </MantineProvider>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
