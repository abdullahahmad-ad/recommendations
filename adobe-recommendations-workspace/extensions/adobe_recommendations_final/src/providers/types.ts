export enum FetchStatus {
  success = "success",
  loading = "loading",
  error = "error",
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Bootstrap {
  UserInfo: {
    [key: string]: any;
  } | null;
  CHANNEL_SETTINGS: {
    partner: string;
    [key: string]: any;
  };
  CompanyInfo: {
    [key: string]: any;
  };
  locale: string;
  [key: string]: any;
}

export interface MarketplaceContextResp {
  bootstrap: Bootstrap | undefined;
  theme: any;
  tenant: string;
  locale: string;
  status: FetchStatus;
}

export interface ApiResponse {
  data: any;
  error: any;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

declare global {
  interface Window {
    bootstrapData: any;
  }
}
