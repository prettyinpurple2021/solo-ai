import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export default defineConfig({
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL!
    },
    schema: './src/db/schema/index.ts',
    /**
     * Never edit the migrations directly, only use drizzle.
     * There are scripts in the package.json "db:generate" and "db:migrate" to handle this.
     */
    out: './migrations'
});