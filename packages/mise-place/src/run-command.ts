import { spawnSync } from 'node:child_process';

export interface CommandResult {
  status: number;
  stdout: string;
}

export const runCaptured = (
  command: string,
  args: Array<string>,
): CommandResult => {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  if (result.error) {
    throw result.error;
  }
  return { status: result.status ?? 1, stdout: result.stdout ?? '' };
};

export const runInherited = (command: string, args: Array<string>): number => {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.error) {
    throw result.error;
  }
  return result.status ?? 1;
};
