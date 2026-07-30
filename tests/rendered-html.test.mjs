import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("builds the resume builder landing route", async () => {
  const html = await readFile(
    new URL("../out/index.html", import.meta.url),
    "utf8",
  );

  assert.match(html, /<title>ATS Resume Builder and Job Copilot<\/title>/i);
  assert.match(html, /ATS resume and reviewed job application workspace/);
  assert.match(html, /Profile and job description/);
  assert.match(html, /Jobs and applications/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Building your site/i);
});

test("keeps the project configured for Netlify and Next.js", async () => {
  const [page, layout, packageJson, netlifyToml] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../netlify.toml", import.meta.url), "utf8"),
  ]);

  assert.match(page, /<ResumeBuilderApp \/>/);
  assert.match(layout, /ATS Resume Builder and Job Copilot/);
  assert.doesNotMatch(layout, /_sites-preview|codex-preview/);
  assert.doesNotMatch(packageJson, /vinext|wrangler|drizzle|react-loading-skeleton/);
  assert.match(packageJson, /"build": "next build"/);
  assert.match(netlifyToml, /publish = "out"/);
});
