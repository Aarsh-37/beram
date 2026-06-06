import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";

// Load .env so DATABASE_URL is available to the Prisma CLI
dotenv.config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
