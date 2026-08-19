import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";

export const REQUIRED_SKILLS = [
  "work-issue",
  "record-decision",
  "model-domain",
  "change-d1-schema",
  "build-worker-api",
  "build-flutter-feature",
  "build-web-feature",
  "handle-r2-object",
  "review-security-privacy",
  "audit-accessibility-parity",
  "review-change",
  "manage-release-incident",
];

export const REQUIRED_AGENTS = [
  "AGENTS.md",
  "apps/api/AGENTS.md",
  "apps/web/AGENTS.md",
  "apps/mobile/AGENTS.md",
  "packages/db/AGENTS.md",
  "content/AGENTS.md",
  "docs/issue-tracking/AGENTS.md",
  ".agents/notes/AGENTS.md",
];

export const ROOT_HEADINGS = [
  "Instruction precedence",
  "Mandatory reading before implementation",
  "Safety",
  "Issue lifecycle",
  "Validation",
  "Skills",
];

export const NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const MIN_SCORE = 3;
export const MIN_MARGIN = 0.35;

const STOP = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "this",
  "that",
  "when",
  "use",
  "not",
  "you",
  "your",
  "into",
  "than",
  "then",
  "also",
  "only",
  "any",
  "all",
  "may",
  "must",
  "will",
  "can",
  "are",
  "was",
  "were",
  "been",
  "have",
  "has",
  "had",
  "does",
  "did",
  "but",
  "nor",
  "yet",
  "both",
  "each",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "own",
  "same",
  "too",
  "very",
  "just",
  "about",
  "after",
  "before",
  "over",
  "under",
  "without",
  "within",
  "end",
  "one",
  "out",
]);

const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;

export function parseFrontmatter(src) {
  if (!src.startsWith("---\n") && !src.startsWith("---\r\n")) {
    throw new Error("missing YAML frontmatter");
  }
  const rest = src.startsWith("---\r\n") ? src.slice(5) : src.slice(4);
  const endUnix = rest.indexOf("\n---\n");
  const endWin = rest.indexOf("\n---\r\n");
  let end = endUnix;
  let skip = 5;
  if (endWin !== -1 && (endUnix === -1 || endWin < endUnix)) {
    end = endWin;
    skip = 6;
  }
  if (end === -1) throw new Error("unclosed frontmatter");
  const yaml = rest.slice(0, end);
  const body = rest.slice(end + skip);
  const fields = {};
  for (const line of yaml.split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    fields[match[1]] = value;
  }
  return { fields, body, yaml };
}

export function normalizePrompt(text) {
  return String(text)
    .toLowerCase()
    .replace(/\bsy-\d{4}\b/g, "sy-nnnn");
}

function keepToken(token) {
  if (!token || STOP.has(token)) return false;
  if (token.length >= 3) return true;
  return token.length === 2 && /\d/.test(token);
}

function withStem(token) {
  const out = [token];
  if (token.endsWith("s") && token.length > 4) out.push(token.slice(0, -1));
  return out;
}

export function tokenize(text) {
  const normalized = normalizePrompt(text);
  const tokens = [];
  const push = (token) => {
    for (const part of withStem(token)) {
      if (keepToken(part)) tokens.push(part);
    }
  };
  for (const raw of normalized.split(/[^a-z0-9-]+/)) {
    if (!raw) continue;
    push(raw);
    if (raw.includes("-") && raw !== "sy-nnnn") {
      for (const part of raw.split("-")) {
        if (part !== raw) push(part);
      }
    }
  }
  return tokens;
}

export function loadSkills(root) {
  const dir = join(root, ".agents/skills");
  if (!existsSync(dir)) return [];
  const skills = [];
  for (const name of readdirSync(dir).sort()) {
    const skillDir = join(dir, name);
    if (!statSync(skillDir).isDirectory()) continue;
    const skillFile = join(skillDir, "SKILL.md");
    if (!existsSync(skillFile)) {
      skills.push({
        name,
        path: skillFile,
        error: "missing SKILL.md",
      });
      continue;
    }
    const src = readFileSync(skillFile, "utf8");
    try {
      const parsed = parseFrontmatter(src);
      skills.push({
        name,
        path: skillFile,
        dir: skillDir,
        src,
        fields: parsed.fields,
        body: parsed.body,
        yaml: parsed.yaml,
      });
    } catch (err) {
      skills.push({
        name,
        path: skillFile,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
  return skills;
}

function positiveDescription(description) {
  const split = String(description).split(/do not use/i);
  return split[0] ?? "";
}

function documentTokens(skill) {
  const name = skill.fields?.name ?? skill.name;
  const description = positiveDescription(skill.fields?.description ?? "");
  return tokenize(`${name.replaceAll("-", " ")} ${description}`);
}

function idf(token, docs) {
  const df = docs.filter((tokens) => tokens.includes(token)).length;
  return Math.log((docs.length + 1) / (df + 1)) + 1;
}

export function scorePrompt(prompt, skill, skills) {
  const docs = skills.map(documentTokens);
  const promptTokens = tokenize(prompt);
  const haystack = documentTokens(skill);
  const hayset = new Set(haystack);
  let score = 0;
  const lowered = normalizePrompt(prompt);
  const skillName = (skill.fields?.name ?? skill.name).toLowerCase();
  if (lowered.includes(skillName) || lowered.includes(skillName.replaceAll("-", " "))) {
    score += 8;
  }
  for (const token of promptTokens) {
    if (hayset.has(token)) score += idf(token, docs);
  }
  return score;
}

export function classifyPrompt(prompt, skills) {
  const usable = skills.filter((skill) => !skill.error && skill.fields?.description);
  const ranked = usable
    .map((skill) => ({ skill, score: scorePrompt(prompt, skill, usable) }))
    .sort((a, b) => b.score - a.score);
  if (!ranked.length) return { skill: null, score: 0, second: 0, margin: 0 };
  const best = ranked[0];
  const second = ranked[1]?.score ?? 0;
  const margin = best.score - second;
  if (best.score < MIN_SCORE || margin < MIN_MARGIN) {
    return { skill: null, score: best.score, second, margin };
  }
  return {
    skill: best.skill.fields.name ?? best.skill.name,
    score: best.score,
    second,
    margin,
  };
}

export function headingNames(markdown) {
  return [...markdown.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1].trim());
}

export function markdownLinks(markdown) {
  return [...markdown.matchAll(LINK_RE)].map((match) => ({
    text: match[1],
    href: match[2].split("#")[0],
  }));
}

export function missingSkillBody(skill) {
  const errors = [];
  const headings = headingNames(skill.body ?? "");
  for (const required of ["Stop", "Validate", "Examples", "References"]) {
    if (!headings.includes(required)) errors.push(`missing ## ${required}`);
  }
  const lines = (skill.body ?? "").split(/\r?\n/).length;
  if (lines > 120) errors.push(`body is ${lines} lines; keep skills concise (≤120)`);
  return errors;
}

export function brokenSkillLinks(skill, root) {
  const errors = [];
  const base = dirname(skill.path);
  for (const link of markdownLinks(skill.body ?? "")) {
    const href = link.href;
    if (!href || href.startsWith("http") || href.startsWith("mailto:")) continue;
    const target = join(base, href);
    if (!existsSync(target)) {
      errors.push(`${relative(root, skill.path)}: broken link ${href}`);
    }
  }
  return errors;
}
