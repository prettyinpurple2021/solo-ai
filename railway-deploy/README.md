# railway-deploy (optional)

This directory is an **alternate** minimal Docker layout (`Dockerfile` + `build-dist`) used only if you explicitly build and push that image.

**Default Railway setup for this repo:** build from the **repository root** with **`server/Dockerfile`** and root **`railway.toml`**. That image includes shared monorepo paths (`src/lib/shared`, `src/types`, etc.).

Do not point Railway at this folder unless you maintain a separate build pipeline that populates `build-dist/`.
