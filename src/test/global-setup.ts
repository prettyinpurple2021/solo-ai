import * as dotenv from 'dotenv';
import path from 'path';

export default async function globalSetup() {
  dotenv.config({
    path: path.resolve(process.cwd(), '.env'),
  });
}
