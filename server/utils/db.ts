import { drizzle } from "drizzle-orm/d1";
import { db } from "hub:db";
import * as schema from "../database/schema";

export { sql, eq, and, or, count, desc, asc, exists, notExists } from "drizzle-orm";
export const tables = schema;

export const useDB = () => {
  return drizzle(db, { schema, casing: "snake_case" });
};
