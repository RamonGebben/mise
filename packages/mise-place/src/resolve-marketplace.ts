import * as os from "node:os";
import * as path from "node:path";

export const resolveMarketplaceSource = (argv: string[]): string => {
  const flagIndex = argv.indexOf("--marketplace");
  if (flagIndex !== -1) {
    const value = argv[flagIndex + 1];
    if (!value) {
      throw new Error("--marketplace requires a value");
    }
    return value;
  }

  const fromEnv = process.env.MISE_MARKETPLACE;
  if (fromEnv) {
    return fromEnv;
  }

  return path.join(os.homedir(), "Projects", "mise");
};
