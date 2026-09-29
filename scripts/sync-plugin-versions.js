#!/usr/bin/env node

// Changesets bumps plugins/<name>/package.json (a private, unpublished
// package that exists only so Changesets can version the plugin). Claude
// Code itself only ever reads plugins/<name>/.claude-plugin/plugin.json for
// the version it uses to detect updates, so this copies package.json's
// version into plugin.json after every `changeset version` run.

const fs = require("node:fs");
const path = require("node:path");

const pluginsDir = path.join(__dirname, "..", "plugins");

let changed = 0;

for (const name of fs.readdirSync(pluginsDir)) {
  const pluginDir = path.join(pluginsDir, name);
  const packageJsonPath = path.join(pluginDir, "package.json");
  const manifestPath = path.join(pluginDir, ".claude-plugin", "plugin.json");

  if (!fs.existsSync(packageJsonPath) || !fs.existsSync(manifestPath)) {
    continue;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const manifestRaw = fs.readFileSync(manifestPath, "utf8");
  const currentVersion = manifestRaw.match(/"version":\s*"([^"]+)"/)?.[1];

  if (currentVersion === packageJson.version) {
    continue;
  }

  // A targeted replace (rather than JSON.parse + stringify the whole file)
  // keeps the rest of plugin.json's formatting untouched.
  const updated = manifestRaw.replace(/"version":\s*"[^"]+"/, `"version": "${packageJson.version}"`);
  fs.writeFileSync(manifestPath, updated);
  console.log(`${name}: plugin.json ${currentVersion} -> ${packageJson.version}`);
  changed++;
}

console.log(changed === 0 ? "All plugin.json versions already in sync." : `Synced ${changed} plugin.json version(s).`);
