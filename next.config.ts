import type { NextConfig } from "next";
import { execSync } from "child_process";

const resolveGitHash = (): string => {
  if (process.env.GIT_HASH) {
    return process.env.GIT_HASH;
  }
  try {
    return (
      execSync("git rev-parse --short HEAD", {
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim() || "dev"
    );
  } catch {
    return "dev";
  }
};

const nextConfig: NextConfig = {
  output: "standalone",
  env: {
    GIT_HASH: resolveGitHash(),
    NEXT_PUBLIC_GIT_HASH: resolveGitHash(),
  },
};

export default nextConfig;
