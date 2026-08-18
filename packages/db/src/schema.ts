import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Schema foundation only. Product tables are added in Stage 3.
 * This migration-ledger row exists so the package compiles and the
 * local D1 binding can apply a reviewed SQL file.
 */
export const schemaMigrations = sqliteTable("schema_migrations", {
  id: text("id").primaryKey(),
  appliedAt: integer("applied_at").notNull(),
});

export const schema = { schemaMigrations };
