#!/usr/bin/env node
// Syntax-check every inline <script> block of an Anytype mini-app HTML file.
// It compiles each block (without running it) and reports any SyntaxError, so
// missing React / useAnytypeState globals are fine — only parse errors fail.
//
// Usage: node scripts/verify.mjs <file.html> [more.html ...]

import { readFileSync } from "node:fs";
import vm from "node:vm";

const files = process.argv.slice(2);
if (!files.length) {
  console.error("usage: node scripts/verify.mjs <file.html> [...]");
  process.exit(2);
}

let failed = 0;
for (const file of files) {
  let html;
  try {
    html = readFileSync(file, "utf8");
  } catch (e) {
    failed++;
    console.error(`✗ ${file}: cannot read (${e.message})`);
    continue;
  }

  const blocks = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
    .map((m) => m[1])
    .filter((s) => s.trim()); // skip the injected <script src> shims (empty body)

  let ok = 0;
  let bad = 0;
  blocks.forEach((code, i) => {
    try {
      new vm.Script(code, { filename: `${file}#block${i}` });
      ok++;
    } catch (e) {
      bad++;
      failed++;
      console.error(`  ✗ block ${i}: ${e.message}`);
    }
  });

  const mark = bad ? "✗" : "✓";
  console.log(`${mark} ${file}: ${ok}/${blocks.length} inline script blocks OK`);
}

process.exit(failed ? 1 : 0);
