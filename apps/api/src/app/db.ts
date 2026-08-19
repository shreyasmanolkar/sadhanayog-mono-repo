import { createDb, type D1Binding } from "@sadhanayog/db";
import type { AppEnv } from "./bindings.js";

/** Typed D1 boot. Product queries land with Stage 3 schema work. */
export function dbFromBindings(env: AppEnv["Bindings"]) {
  if (env.DB === undefined) {
    return undefined;
  }
  return createDb(env.DB as D1Binding);
}
