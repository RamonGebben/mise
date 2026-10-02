const DEFAULT_SOURCE = 'RamonGebben/mise';

export const resolveMarketplaceSource = (argv: Array<string>): string => {
  const flagIndex = argv.indexOf('--marketplace');
  if (flagIndex !== -1) {
    const value = argv[flagIndex + 1];
    if (!value) {
      throw new Error('--marketplace requires a value');
    }
    return value;
  }

  const fromEnv = process.env.MISE_MARKETPLACE;
  if (fromEnv) {
    return fromEnv;
  }

  return DEFAULT_SOURCE;
};
