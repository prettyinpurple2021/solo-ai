import * as dotenv from 'dotenv';
import path from 'path';

export default async function globalSetup() {
  const root = process.cwd();
  dotenv.config({ path: path.resolve(root, '.env'), quiet: true });
  dotenv.config({ path: path.resolve(root, '.env.local'), quiet: true, override: true });
}
