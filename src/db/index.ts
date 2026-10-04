import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

/**
 * Neon's HTTP driver rather than the WebSocket Pool: every query here is a
 * single-shot read or write with no transactions or session state, which is
 * exactly what the HTTP driver is for, and it has the lower cold-start cost.
 */
const url = process.env.DATABASE_URL;

/**
 * The map is the product; RSVPs are an addition to it. Without a database the
 * site must still render and browse perfectly, so this is nullable by design
 * instead of throwing at import time and taking the whole page down.
 */
export const isDbConfigured = Boolean(url);

const client = url ? drizzle(neon(url), { schema }) : null;

/** Use in write paths, where failing loudly is correct. */
export function getDb() {
  if (!client) {
    throw new Error("DATABASE_URL is not set — RSVP features are unavailable.");
  }
  return client;
}

/** Use in read paths, which should degrade to "no RSVPs" rather than error. */
export function tryGetDb() {
  return client;
}
