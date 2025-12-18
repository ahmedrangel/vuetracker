import { drizzle } from "drizzle-orm/d1";
import { db, schema } from "hub:db";
import * as dbTables from "../db/schema";

export { sql, eq, and, or, count, desc, asc, exists, notExists } from "drizzle-orm";
export const tables = dbTables;

export const useDB = () => {
  return drizzle(db, { schema, casing: "snake_case" });
};
