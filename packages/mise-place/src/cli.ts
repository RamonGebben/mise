#!/usr/bin/env node

import { resolveMarketplaceSource } from './resolve-marketplace.js';
import { runCaptured, runInherited } from './run-command.js';

const MARKETPLACE_NAME = 'mise';
const PLUGINS = ['typescript', 'architecture', 'react', 'testing', 'init'];
const RECIPE_PROMPT = '/init:setup';

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const parseJsonArray = (stdout: string): Array<unknown> => {
  const parsed: unknown = JSON.parse(stdout);
  return Array.isArray(parsed) ? parsed : [];
};

const checkClaudeAvailable = (): boolean => {
  try {
    const { status } = runCaptured('claude', ['--version']);
    return status === 0;
  } catch {
    return false;
  }
};

const isMarketplaceAdded = (): boolean => {
  const { status, stdout } = runCaptured('claude', [
    'plugin',
    'marketplace',
    'list',
    '--json',
  ]);
  if (status !== 0) {
    return false;
  }
  return parseJsonArray(stdout).some(
    entry => isRecord(entry) && entry.name === MARKETPLACE_NAME,
  );
};

const installedPluginIds = (): Set<string> => {
  const { status, stdout } = runCaptured('claude', [
    'plugin',
    'list',
    '--json',
  ]);
  if (status !== 0) {
    return new Set();
  }
  const ids = parseJsonArray(stdout)
    .filter(isRecord)
    .map(entry => entry.id)
    .filter((id): id is string => typeof id === 'string');
  return new Set(ids);
};

const ensureMarketplaceAdded = (source: string): void => {
  if (isMarketplaceAdded()) {
    console.log(`Marketplace "${MARKETPLACE_NAME}" already added.`);
    return;
  }
  console.log(`Adding marketplace "${MARKETPLACE_NAME}" from ${source}...`);
  const status = runInherited('claude', [
    'plugin',
    'marketplace',
    'add',
    source,
  ]);
  if (status !== 0) {
    throw new Error(`Failed to add marketplace from ${source}`);
  }
};

const ensurePluginsInstalled = (): void => {
  const installed = installedPluginIds();
  for (const plugin of PLUGINS) {
    const id = `${plugin}@${MARKETPLACE_NAME}`;
    if (installed.has(id)) {
      console.log(`Plugin "${id}" already installed.`);
      continue;
    }
    console.log(`Installing "${id}"...`);
    const status = runInherited('claude', ['plugin', 'install', id, '--yes']);
    if (status !== 0) {
      throw new Error(`Failed to install ${id}`);
    }
  }
};

const main = (): void => {
  const argv = process.argv.slice(2);

  if (!checkClaudeAvailable()) {
    console.error(
      'claude CLI not found on PATH. Install Claude Code first: https://claude.com/claude-code',
    );
    process.exit(1);
  }

  const source = resolveMarketplaceSource(argv);

  ensureMarketplaceAdded(source);
  ensurePluginsInstalled();

  console.log(`Handing off to claude with ${RECIPE_PROMPT}...`);
  const status = runInherited('claude', [RECIPE_PROMPT]);
  process.exit(status);
};

main();
