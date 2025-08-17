import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: [
      "src/hooks/useAdvancedMemo.ts",
      "src/hooks/useIntelligentPreload.ts", 
      "src/hooks/usePerformanceOptimization.ts",
      "src/hooks/useTabVisibility.ts",
      "src/utils/advancedCache.ts",
      "src/utils/dynamicImports.ts",
      "src/components/performance/**/*"
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/exhaustive-deps": "warn"
    }
  }
];

export default eslintConfig;
