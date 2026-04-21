#!/usr/bin/env node
/**
 * Reads a school config and patches app.json before an EAS build.
 * Usage: SCHOOL=<slug> node scripts/prepare-build.js
 */
const fs = require('fs')
const path = require('path')

const slug = process.env.SCHOOL
if (!slug) { console.error('SCHOOL env var required'); process.exit(1) }

const configPath = path.join(__dirname, '..', 'school-configs', `${slug}.json`)
if (!fs.existsSync(configPath)) { console.error(`Config not found: ${configPath}`); process.exit(1) }

const school = JSON.parse(fs.readFileSync(configPath, 'utf8'))
const appJsonPath = path.join(__dirname, '..', 'app.json')
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'))

appJson.expo.name = school.appName
appJson.expo.slug = school.schoolSlug
appJson.expo.icon = school.iconPath
appJson.expo.splash.image = school.splashPath
appJson.expo.splash.backgroundColor = school.primaryColour
appJson.expo.ios.bundleIdentifier = school.bundleId
appJson.expo.android.package = school.bundleId
appJson.expo.android.adaptiveIcon.backgroundColor = school.primaryColour

fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2))
console.log(`app.json patched for school: ${school.appName}`)
