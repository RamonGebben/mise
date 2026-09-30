#!/usr/bin/env node

// Changesets bumps plugins/<name>/package.json (a private, unpublished
// package that exists only so Changesets can version the plugin). Claude
// Code itself only ever reads plugins/<name>/.claude-plugin/plugin.json for
// the version it uses to detect updates, so this copies package.json's
// version into plugin.json after every `changeset version` run.

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const pluginsDir = path.join(dirname, '..', 'plugins');

const syncPluginVersion = name => {
  const pluginDir = path.join(pluginsDir, name);
  const packageJsonPath = path.join(pluginDir, 'package.json');
  const manifestPath = path.join(pluginDir, '.claude-plugin', 'plugin.json');

  if (!existsSync(packageJsonPath) || !existsSync(manifestPath)) return null;

  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  const manifestRaw = readFileSync(manifestPath, 'utf8');
  const currentVersion = manifestRaw.match(/"version":\s*"([^"]+)"/)?.[1];

  if (currentVersion === packageJson.version) return null;

  // A targeted replace (rather than JSON.parse + stringify the whole file)
  // keeps the rest of plugin.json's formatting untouched.
  const updated = manifestRaw.replace(
    /"version":\s*"[^"]+"/,
    `"version": "${packageJson.version}"`,
  );
  writeFileSync(manifestPath, updated);
  console.log(
    `${name}: plugin.json ${currentVersion} -> ${packageJson.version}`,
  );
  return name;
};

const changed = readdirSync(pluginsDir).map(syncPluginVersion).filter(Boolean);

console.log(
  changed.length === 0
    ? 'All plugin.json versions already in sync.'
    : `Synced ${changed.length} plugin.json version(s).`,
);
