
import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" }); // Changed to .env to match what I saw in file list

export default defineConfig({
  out: "./drizzle_introspect",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
});
