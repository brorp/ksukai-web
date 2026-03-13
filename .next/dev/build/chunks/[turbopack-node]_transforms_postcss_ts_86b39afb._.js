module.exports = [
"[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/code/KSUKAI-web/postcss.config.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "chunks/7972d__pnpm_1cb66232._.js",
  "chunks/[root-of-the-server]__15442d2a._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/code/KSUKAI-web/postcss.config.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript)");
    });
});
}),
];