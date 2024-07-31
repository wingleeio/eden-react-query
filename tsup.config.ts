import { defineConfig } from "tsup";

export default defineConfig({
    entry: {
        index: "src/index.ts",
    },
    format: ["cjs", "esm"],
    outDir: "dist",
    splitting: false,
    external: ["@tanstack/react-query"],
    esbuildOptions: (options, context) => {
        if (context.format === "esm") {
            options.outExtension = { ".js": ".mjs" }; // Use .mjs for ESM
        } else if (context.format === "cjs") {
            options.outExtension = { ".js": ".cjs" }; // Use .cjs for CJS
        }
    },
});
