export interface AppEnv {
  Bindings: {
    SADHANAYOG_ENV: string;
    RELEASE: string;
    DB?: D1Database;
    ASSETS?: Fetcher;
  };
  Variables: {
    requestId: string;
  };
}

export function isProductionEnv(value: string | undefined): boolean {
  return value === "production";
}
