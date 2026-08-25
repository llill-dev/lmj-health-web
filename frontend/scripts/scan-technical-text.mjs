#!/usr/bin/env node
/**
 * scan-technical-text.mjs
 *
 * Scans the entire frontend (src/) for user-facing text that leaks
 * technical/developer-only content: raw API endpoints, messageKeys,
 * stack traces, HTTP status jargon, English debug strings mixed into
 * Arabic UI, TODO/DEBUG markers rendered to the DOM, etc.
 *
 * It uses the TypeScript compiler API to walk the real AST (not naive
 * regex-over-lines), so it only flags text that actually reaches the
 * user: JSX text children, JSX attributes that render as visible text
 * (title, placeholder, aria-label, alt), and string arguments passed to
 * known "show this to the user" call sites (toast(...), alert(...),
 * t(..., "fallback"), <Tooltip content=...>, etc.
 *
 * Usage:
 *   node scripts/scan-technical-text.mjs [--root src] [--format json|md] [--out report.json]
 *
 * Exit code: 0 always (report tool). Use --fail-on-findings to exit 1
 * when any HIGH severity finding is present (useful in CI).
 */

import ts from "typescript";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_ROOT = path.resolve(__dirname, "..");

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
function argVal(name, def) {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return def;
  return args[i + 1];
}
const ROOT = path.resolve(FRONTEND_ROOT, argVal("root", "src"));
const FORMAT = argVal("format", "md");
const OUT = argVal("out", null);
const FAIL_ON_FINDINGS = args.includes("--fail-on-findings");

// ---------------------------------------------------------------------------
// File discovery
// ---------------------------------------------------------------------------
const EXCLUDE_DIRS = new Set(["node_modules", "dist", "build", ".git", "test", "__mocks__"]);
const EXCLUDE_FILE_RE = /\.(test|spec|stories)\.[tj]sx?$/;

/** @type {string[]} */
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      walk(full);
    } else if (/\.(tsx?|jsx?)$/.test(entry.name) && !EXCLUDE_FILE_RE.test(entry.name)) {
      files.push(full);
    }
  }
}
walk(ROOT);

// ---------------------------------------------------------------------------
// Heuristics: what counts as "technical text that must not reach the user"
// ---------------------------------------------------------------------------

/** Call-site names whose string args are known to render visibly to the user. */
const USER_FACING_CALLS = new Set([
  "toast", "alert", "confirm", "prompt", "notify",
  "showToast", "showError", "showSuccess", "showWarning", "showInfo",
]);
/** JSX attributes whose string value is visible/read to the user. */
const USER_FACING_ATTRS = new Set([
  "title", "placeholder", "alt", "aria-label", "aria-description",
  "label", "helperText", "errorText", "description", "content", "tooltip",
]);

const RULES = [
  {
    id: "raw-api-endpoint",
    severity: "HIGH",
    re: /\/api\/[a-z0-9/_\-{}:.]+/i,
    message: "نص يحتوي على مسار API خام (endpoint) يظهر للمستخدم.",
  },
  {
    id: "message-key",
    severity: "HIGH",
    re: /\b[a-zA-Z_]+\.(error|success|failed|failure)\.[a-zA-Z_.]+\b|messageKey/i,
    message: "تسريب messageKey تقني بدل رسالة مترجمة للمستخدم.",
  },
  {
    id: "stack-trace",
    severity: "HIGH",
    re: /\bat\s+\S+\s+\(.*:\d+:\d+\)|\.stack\b|Traceback \(most recent call last\)/,
    message: "نص يشبه stack trace أو تفاصيل استثناء تقنية.",
  },
  {
    id: "http-status-jargon",
    severity: "MEDIUM",
    re: /\b(4\d{2}|5\d{2})\s*(error|Error|Bad Request|Unauthorized|Forbidden|Not Found|Internal Server Error)\b/,
    message: "كود حالة HTTP خام أو مصطلح خطأ تقني (يجب ترجمته لرسالة مفهومة للمستخدم).",
  },
  {
    id: "network-error-raw",
    severity: "MEDIUM",
    re: /\b(Network ?Error|Failed to fetch|ECONNREFUSED|ETIMEDOUT|CORS error|TypeError:|ReferenceError:|SyntaxError:)\b/,
    message: "رسالة خطأ برمجية خام (JS/Network) تسربت للواجهة.",
  },
  {
    id: "null-undefined-leak",
    severity: "MEDIUM",
    re: /\b(undefined|null|NaN|\[object Object\])\b/,
    message: "قيمة برمجية خام (undefined/null/NaN) قد تظهر كنص للمستخدم.",
  },
  {
    id: "debug-marker",
    severity: "HIGH",
    re: /\b(TODO|FIXME|DEBUG|WIP|placeholder text|lorem ipsum|test only|dummy data)\b/i,
    message: "علامة تطوير/تجربة (TODO/DEBUG/placeholder) ظاهرة للمستخدم.",
  },
  {
    id: "technical-field-name",
    severity: "LOW",
    re: /\b([a-z]+_id|[a-z]+Id|uuid|payload|endpoint|query ?param|request ?body|response ?body|schema|enum value)\b/,
    message: "اسم حقل/متغير تقني (snake_case أو camelCase برمجي) بدل تسمية مفهومة للمستخدم.",
  },
  {
    id: "json-blob",
    severity: "MEDIUM",
    re: /^\s*\{"[a-zA-Z_]+":/,
    message: "نص يشبه JSON خام يُعرض كما هو للمستخدم.",
  },
  {
    id: "console-in-jsx",
    severity: "LOW",
    re: /console\.(log|warn|error|debug)/,
    message: "استدعاء console.* داخل شجرة JSX (احتمال تسريب أثناء التطوير).",
  },
];

/** @typedef {{file:string, line:number, col:number, id:string, severity:string, message:string, text:string, kind:string}} Finding */
/** @type {Finding[]} */
const findings = [];

function relFile(f) {
  return path.relative(FRONTEND_ROOT, f).replace(/\\/g, "/");
}

function checkText(text, file, line, col, kind) {
  const trimmed = text.trim();
  if (!trimmed) return;
  for (const rule of RULES) {
    if (rule.re.test(trimmed)) {
      findings.push({
        file: relFile(file),
        line,
        col,
        id: rule.id,
        severity: rule.severity,
        message: rule.message,
        text: trimmed.slice(0, 160),
        kind,
      });
    }
  }
}

function getCallName(expr) {
  if (ts.isIdentifier(expr)) return expr.text;
  if (ts.isPropertyAccessExpression(expr)) return expr.name.text;
  return null;
}

function scanFile(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  const sf = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith(".tsx") || filePath.endsWith(".jsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );

  function posOf(node) {
    const { line, character } = sf.getLineAndCharacterOfPosition(node.getStart(sf));
    return { line: line + 1, col: character + 1 };
  }

  function visit(node) {
    // 1. JSX text children: <div>هذا النص</div>
    if (ts.isJsxText(node)) {
      const { line, col } = posOf(node);
      checkText(node.text, filePath, line, col, "jsx-text");
    }

    // 2. JSX expression children that are plain string literals: <div>{"..."}</div>
    if (ts.isJsxExpression(node) && node.expression && ts.isStringLiteralLike(node.expression)) {
      const { line, col } = posOf(node.expression);
      checkText(node.expression.text, filePath, line, col, "jsx-expr-string");
    }

    // 3. JSX attributes that render as visible text
    if (ts.isJsxAttribute(node) && ts.isIdentifier(node.name)) {
      const attrName = node.name.text;
      if (USER_FACING_ATTRS.has(attrName) && node.initializer) {
        let strNode = null;
        if (ts.isStringLiteral(node.initializer)) strNode = node.initializer;
        else if (
          ts.isJsxExpression(node.initializer) &&
          node.initializer.expression &&
          ts.isStringLiteralLike(node.initializer.expression)
        ) {
          strNode = node.initializer.expression;
        }
        if (strNode) {
          const { line, col } = posOf(strNode);
          checkText(strNode.text, filePath, line, col, `jsx-attr:${attrName}`);
        }
      }
    }

    // 4. Known user-facing call sites: toast("..."), alert("..."), t(key, "fallback")
    if (ts.isCallExpression(node)) {
      const name = getCallName(node.expression);
      if (name && USER_FACING_CALLS.has(name)) {
        for (const arg of node.arguments) {
          if (ts.isStringLiteralLike(arg)) {
            const { line, col } = posOf(arg);
            checkText(arg.text, filePath, line, col, `call:${name}()`);
          } else if (ts.isObjectLiteralExpression(arg)) {
            for (const prop of arg.properties) {
              if (
                ts.isPropertyAssignment(prop) &&
                ts.isIdentifier(prop.name) &&
                ["title", "description", "message"].includes(prop.name.text) &&
                ts.isStringLiteralLike(prop.initializer)
              ) {
                const { line, col } = posOf(prop.initializer);
                checkText(prop.initializer.text, filePath, line, col, `call:${name}({${prop.name.text}})`);
              }
            }
          }
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sf);
}

for (const f of files) {
  try {
    scanFile(f);
  } catch (e) {
    console.error(`[scan-technical-text] failed to parse ${relFile(f)}: ${e.message}`);
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
const severityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
findings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity] || a.file.localeCompare(b.file) || a.line - b.line);

const summary = {
  filesScanned: files.length,
  totalFindings: findings.length,
  bySeverity: {
    HIGH: findings.filter((f) => f.severity === "HIGH").length,
    MEDIUM: findings.filter((f) => f.severity === "MEDIUM").length,
    LOW: findings.filter((f) => f.severity === "LOW").length,
  },
};

function toMarkdown() {
  let out = `# تقرير فحص النصوص التقنية الظاهرة للمستخدم\n\n`;
  out += `- الملفات المفحوصة: ${summary.filesScanned}\n`;
  out += `- إجمالي الملاحظات: ${summary.totalFindings} (خطيرة: ${summary.bySeverity.HIGH}, متوسطة: ${summary.bySeverity.MEDIUM}, منخفضة: ${summary.bySeverity.LOW})\n\n`;
  if (findings.length === 0) {
    out += "لا توجد ملاحظات.\n";
    return out;
  }
  out += `| الخطورة | الملف | السطر | النوع | التفصيل | النص |\n`;
  out += `|---|---|---|---|---|---|\n`;
  for (const f of findings) {
    const text = f.text.replace(/\|/g, "\\|").replace(/\n/g, " ");
    out += `| ${f.severity} | \`${f.file}\` | ${f.line} | ${f.kind} | ${f.id} — ${f.message} | \`${text}\` |\n`;
  }
  return out;
}

const output = FORMAT === "json" ? JSON.stringify({ summary, findings }, null, 2) : toMarkdown();

if (OUT) {
  fs.writeFileSync(path.resolve(FRONTEND_ROOT, OUT), output, "utf8");
  console.log(`Report written to ${OUT}`);
} else {
  console.log(output);
}

console.error(
  `\n[scan-technical-text] scanned ${summary.filesScanned} files, ${summary.totalFindings} findings (HIGH ${summary.bySeverity.HIGH} / MEDIUM ${summary.bySeverity.MEDIUM} / LOW ${summary.bySeverity.LOW})`
);

if (FAIL_ON_FINDINGS && summary.bySeverity.HIGH > 0) {
  process.exit(1);
}
