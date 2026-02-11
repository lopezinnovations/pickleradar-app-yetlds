
# iOS Build Instructions

## The Issue
The iOS build output was being parsed as JSON when it's actually plain text, causing `JSON.parse` errors on messages like "CPU time ...".

## Solution
We've updated the build configuration to treat stdout as plain text and disabled "Launch to testers" for now.

## How to Build iOS

### Option 1: Using npm script (Recommended)
```bash
npm run build:ios
```

This runs: `npx eas-cli@latest build --platform ios --profile production --clear-cache --non-interactive`

### Option 2: Direct CLI command
```bash
npx eas-cli@latest build --platform ios --profile production --clear-cache --non-interactive
```

### Option 3: Preview build (for testing)
```bash
npm run build:ios:preview
```

## Verify Authentication First
Before building, verify your EAS authentication:

```bash
# Check who you're logged in as
npm run eas:whoami

# List recent builds
npm run eas:builds
```

## Build Flags Explained
- `--platform ios` - Build for iOS only
- `--profile production` - Use the production build profile from eas.json
- `--clear-cache` - Clear any cached build artifacts (ensures clean build)
- `--non-interactive` - Don't prompt for input (useful for CI/CD)

## What Changed
1. **Disabled "Launch to testers"** - The submit configuration in eas.json now has placeholder values
2. **Added npm scripts** - Easy commands to run builds without remembering CLI flags
3. **Plain text output** - The `--non-interactive` flag ensures output is treated as plain text, not JSON

## Troubleshooting

### If build fails with JSON.parse error
The build output is being incorrectly parsed as JSON. Make sure you're using the commands above which include `--non-interactive`.

### If you see "CPU time ..." errors
This is plain text output, not an error. The build is processing normally.

### If authentication fails
Run `npm run eas:whoami` to check your login status. If not logged in:
```bash
npx eas-cli@latest login
```

## Next Steps After Successful Build
1. The build will be uploaded to App Store Connect (if configured)
2. You can manually submit to TestFlight or App Store from App Store Connect
3. To enable automatic TestFlight distribution, update the `submit.production.ios` section in eas.json with your actual Apple credentials
