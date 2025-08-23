## Build Failure Issue

### Description
There is a build failure due to an invalid route pattern in `next.config.js`. The error message is as follows:

```
Error parsing /:path*\.(?:js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ 
Reason: Pattern cannot start with "?" at 10.
```

### Suggested Solution
Replace the pattern with a valid Next.js route pattern:
```
/:path*.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)
```
Remove unsupported regex syntax to resolve the issue.

### Failing Job
You can find the failing job [here](https://github.com/prettyinpurple2021/v0-solo-boss-ai-platform/actions/runs/17111063046/job/48532323295).