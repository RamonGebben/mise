import { spawnSync } from "node:child_process";

export interface CommandResult {
  status: number;
  stdout: string;
}

export function runCaptured(command: string, args: string[]): CommandResult {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.error) {
    throw result.error;
  }
  return { status: result.status ?? 1, stdout: result.stdout ?? "" };
}

export function runInherited(command: string, args: string[]): number {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.error) {
    throw result.error;
  }
  return result.status ?? 1;
}
