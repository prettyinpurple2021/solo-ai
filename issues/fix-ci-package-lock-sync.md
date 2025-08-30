### Issue: Fix Failing CI

The CI is failing due to the `package-lock.json` being out of sync with `package.json`. The error occurs when running `npm ci`, as several dependencies are missing from the lock file.

### Solution:
1. Run `npm install` locally.
2. Commit the updated `package-lock.json`.
3. Push the changes to the repository.

### Reference Workflow
- Commit Reference: cf0511e4e5821c48330b86d45c0b3bdb053160eb

### Steps to Reproduce:
1. Check the CI logs for errors related to missing dependencies.
2. Notice that the `package-lock.json` does not reflect the dependencies listed in `package.json`. 

### Recommended Action:
- Update the `package-lock.json` to match the `package.json` dependencies to resolve the CI failure.