import { drizzle } from "drizzle-orm/d1";
import { schema } from "./schema.js";

/** Minimal D1 surface so this package does not import Worker types. */
export interface D1Binding {
  prepare(query: string): unknown;
  dump(): Promise<ArrayBuffer>;
  batch<T = unknown>(statements: T[]): Promise<T[]>;
  exec(query: string): Promise<unknown>;
}

export function createDb(binding: D1Binding) {
  return drizzle(binding as Parameters<typeof drizzle>[0], { schema });
}

export type Database = ReturnType<typeof createDb>;
