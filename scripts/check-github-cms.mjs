import fs from "node:fs";
import path from "node:path";

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const token = process.env.GITHUB_TOKEN?.trim();
const repo = process.env.GITHUB_REPO?.trim();
const branch = process.env.GITHUB_BRANCH?.trim() || "main";

if (!token || !repo) {
  console.error("Missing GITHUB_TOKEN or GITHUB_REPO in .env.local");
  process.exit(1);
}

const [owner, name] = repo.split("/");
if (!owner || !name) {
  console.error("GITHUB_REPO must be owner/name");
  process.exit(1);
}

function tokenKind(value) {
  if (value.startsWith("github_pat_")) return "fine-grained";
  if (value.startsWith("ghp_")) return "classic";
  return "unknown";
}

const headers = {
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

async function githubRequest(apiPath, init) {
  const response = await fetch(`https://api.github.com${apiPath}`, {
    ...init,
    headers: { ...headers, ...(init?.headers ?? {}) },
  });
  const body = await response.text();
  return { ok: response.ok, status: response.status, body };
}

function encodeRepoPath(filePath) {
  return filePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

console.log(`Checking GitHub CMS access for ${owner}/${name} (${branch})`);
console.log(`Token kind: ${tokenKind(token)}\n`);

const repoCheck = await githubRequest(`/repos/${owner}/${name}`);
if (!repoCheck.ok) {
  console.error(`Repository access failed (${repoCheck.status}):`);
  console.error(repoCheck.body);
  process.exit(1);
}

const meta = JSON.parse(repoCheck.body);
const canRead = meta.permissions?.pull === true;
const canPush = meta.permissions?.push === true;

console.log("Repository permissions:", meta.permissions ?? "(none)");
console.log(`canRead (pull): ${canRead}`);
console.log(`canPush (push):  ${canPush}`);

const contentsCheck = await githubRequest(
  `/repos/${owner}/${name}/contents/content/en?ref=${encodeURIComponent(branch)}`,
);

console.log(`\nContents list (content/en): ${contentsCheck.status}`);
if (!contentsCheck.ok) {
  console.error(contentsCheck.body.slice(0, 300));
  process.exit(1);
}

const entries = JSON.parse(contentsCheck.body);
const firstMdx = entries.find((entry) => entry.name.endsWith(".mdx"));
if (!firstMdx) {
  console.error("No MDX files found under content/en");
  process.exit(1);
}

const filePath = `content/en/${firstMdx.name}`;
const fileCheck = await githubRequest(
  `/repos/${owner}/${name}/contents/${encodeRepoPath(filePath)}?ref=${encodeURIComponent(branch)}`,
);
console.log(`\nRead probe file (${firstMdx.name}): ${fileCheck.status}`);

if (!fileCheck.ok) {
  console.error(fileCheck.body.slice(0, 300));
  process.exit(1);
}

const file = JSON.parse(fileCheck.body);
const writeCheck = await githubRequest(
  `/repos/${owner}/${name}/contents/${encodeRepoPath(filePath)}`,
  {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "cms: write access probe",
      content: file.content,
      branch,
      sha: file.sha,
    }),
  },
);

console.log(`Write probe (Contents API PUT): ${writeCheck.status}`);

if (writeCheck.ok) {
  console.log("\n✓ Token can write via Contents API. CMS saves should work.");
  console.log("Add the same GITHUB_TOKEN to Vercel and redeploy.");
  process.exit(0);
}

console.error("\n✗ Contents API write failed.");
console.error(writeCheck.body.slice(0, 400));
if (canPush) {
  console.error(
    "\nMetadata shows push=true but PUT failed. For org repos, create the " +
      "fine-grained token with Resource owner = saifcores (the organization), " +
      "Contents Read and write, and authorize SSO.",
  );
} else {
  console.error(
    "\nFix: fine-grained PAT → Contents Read and write. Or classic PAT → repo scope.",
  );
}
process.exit(1);
