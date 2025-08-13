import { defineStackbitConfig } from '@stackbit/types';

export default defineStackbitConfig({
    "stackbitVersion": "~0.6.0",
    "nodeVersion": "18",
    "ssgName": "nextjs",
    // contentSources is intentionally left empty as a placeholder. Add sources as needed.
    "contentSources": [],
    "postInstallCommand": "npm i --no-save @stackbit/types"
})