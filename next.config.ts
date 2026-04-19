import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16+ 使用 Turbopack 作為預設開發引擎
  // 使用頂層 turbopack 欄位 (非 experimental)，將 yahoo-finance2 帶入的 Deno 測試模組路由至空值
  turbopack: {
    resolveAlias: {
      '@std/testing/mock': { default: './empty-module.js' },
      '@std/testing/bdd': { default: './empty-module.js' },
      '@gadicc/fetch-mock-cache/runtimes/deno.ts': { default: './empty-module.js' },
      '@gadicc/fetch-mock-cache/stores/fs.ts': { default: './empty-module.js' },
    },
  },
};

export default nextConfig;
