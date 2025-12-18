import { drizzle } from "drizzle-orm/d1";
import { db, schema } from "hub:db";

export { sql, eq, and, or, count, desc, asc, exists, notExists } from "drizzle-orm";
export const tables = schema;

export const useDB = () => {
  return drizzle(db, { schema, casing: "snake_case" });
};
