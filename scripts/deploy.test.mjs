import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const readRepoFile = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const DEPLOY_WORKFLOWS = [
  ".github/workflows/deploy-prod.yml",
  ".github/workflows/deploy-dev.yml",
];

// The site is one page, so every route other than "/" needs its own copy of
// index.html in the bucket, or a reload on that route is a 404.
test("every page route is uploaded by each deploy", () => {
  const routePaths = [...readRepoFile("src/App.jsx").matchAll(/<Route path="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((path) => path !== "/");
  assert.ok(routePaths.length > 0, "expected at least one route besides /");

  const missing = [];
  for (const workflow of DEPLOY_WORKFLOWS) {
    if (!existsSync(new URL(`../${workflow}`, import.meta.url))) continue;
    const text = readRepoFile(workflow);
    for (const path of routePaths) {
      const key = path.slice(1);
      const uploaded = text.includes(`aws s3 cp dist/index.html "s3://\${S3_BUCKET}/${key}"`);
      const keptBySync = text.includes(`--exclude "${key}"`);
      if (!uploaded || !keptBySync) missing.push(`${workflow}: ${path}`);
    }
  }
  assert.deepEqual(missing, []);
});
