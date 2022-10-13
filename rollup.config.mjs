import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescriptPlugin from "@rollup/plugin-typescript";
import url from "@rollup/plugin-url";
import external from "rollup-plugin-peer-deps-external";
import typescript from "typescript";
import { readFileSync } from "node:fs";

// https://rollupjs.org/guide/en/#importing-packagejson
const pkg = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url))
);

export default {
  input: "src/index.ts",
  output: [
    {
      file: pkg.main,
      format: "cjs",
      exports: "named",
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: "es",
      exports: "named",
      sourcemap: true,
    },
  ],
  plugins: [
    external(),
    url(),
    resolve(),
    typescriptPlugin({
      typescript,
      declaration: true,
      declarationDir: "dist",
      exclude: ["**.test.tsx", "**.stories.tsx"],
    }),
    commonjs(),
  ],
};
