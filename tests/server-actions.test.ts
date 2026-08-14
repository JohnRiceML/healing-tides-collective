import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import ts from "typescript";
import { describe, expect, it } from "vitest";

function sourceFilesUnder(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFilesUnder(path);
    return /\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

function hasModifier(node: ts.Node, kind: ts.SyntaxKind): boolean {
  return ts.canHaveModifiers(node) && ts.getModifiers(node)?.some((modifier) => modifier.kind === kind) === true;
}

function isAsyncFunctionInitializer(initializer: ts.Expression | undefined): boolean {
  if (!initializer || (!ts.isArrowFunction(initializer) && !ts.isFunctionExpression(initializer))) return false;
  return hasModifier(initializer, ts.SyntaxKind.AsyncKeyword);
}

function invalidRuntimeExports(path: string): string[] {
  const source = ts.createSourceFile(
    path,
    readFileSync(path, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const isServerActionModule = source.statements.some(
    (statement) =>
      ts.isExpressionStatement(statement) &&
      ts.isStringLiteral(statement.expression) &&
      statement.expression.text === "use server",
  );
  if (!isServerActionModule) return [];

  const invalid: string[] = [];
  for (const statement of source.statements) {
    if (!hasModifier(statement, ts.SyntaxKind.ExportKeyword)) continue;
    if (ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)) continue;

    if (ts.isFunctionDeclaration(statement)) {
      if (!hasModifier(statement, ts.SyntaxKind.AsyncKeyword)) invalid.push(statement.name?.text ?? "default function");
      continue;
    }

    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (!isAsyncFunctionInitializer(declaration.initializer)) invalid.push(declaration.name.getText(source));
      }
      continue;
    }

    invalid.push(statement.getText(source).split("\n", 1)[0]);
  }
  return invalid;
}

describe('the "use server" module boundary', () => {
  it("exports only async functions at runtime", () => {
    const appRoot = join(process.cwd(), "app");
    const failures = sourceFilesUnder(appRoot).flatMap((path) =>
      invalidRuntimeExports(path).map((name) => `${path.slice(process.cwd().length + 1)}: ${name}`),
    );

    expect(failures, `Invalid Server Action exports:\n${failures.join("\n")}`).toEqual([]);
  });
});
