import { useContext } from "react";
import { MarketplaceContextResp } from "../providers/types";
import { MarketplaceContext } from "../providers/MarketplaceContextProvider";

const useMarketplaceContext = (): MarketplaceContextResp =>
  useContext(MarketplaceContext);

export default useMarketplaceContext;
