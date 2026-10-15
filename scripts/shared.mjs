import { spawnSync } from "node:child_process";

// Production builds must not inherit the local preview URL or output directory.
export const productionEnv = {
  ...process.env,
  SITE_URL: "https://kyouritsu-sysadmin.github.io",
  HOME_URL: "https://kyouritsu-sysadmin.github.io/",
  BASE_URL: "/manuals/",
};
delete productionEnv.BUILD_DIR;

export function run(command, args, cwd, env = productionEnv) {
  const result = spawnSync(command, args, { cwd, env, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(`${command} ${args.join(" ")} failed (${result.status ?? result.signal})`);
}
