# School configs

Each school gets a JSON file here. When onboarding a new school, create a file
named `<school-slug>.json` and run the build script to produce a branded build.

## Schema

```json
{
  "schoolSlug": "prince-edward",
  "appName": "Prince Edward",
  "bundleId": "org.rusiqe.prince-edward",
  "primaryColour": "#003087",
  "secondaryColour": "#FFD700",
  "iconPath": "./assets/schools/prince-edward/icon.png",
  "splashPath": "./assets/schools/prince-edward/splash.png"
}
```

## Building a school

```bash
# set the config, then trigger an EAS build
SCHOOL=prince-edward node scripts/prepare-build.js
eas build --platform all --profile production
```
