import { defineConfig } from "drizzle-kit";

// drizzle-kit doesn't know about Next's .env.local, so load it explicitly.
// process.loadEnvFile is built into Node 20.12+ — no dotenv dependency needed.
try {
  process.loadEnvFile(".env.local");
} catch {
  // Absent locally is fine; db:push will report the missing URL itself.
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
