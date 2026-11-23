import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const sourceRoot = process.argv[2]
  ? resolve(process.argv[2])
  : fileURLToPath(new URL('../src/', import.meta.url));

function* controllerFiles(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) yield* controllerFiles(path);
    else if (entry.name.endsWith('.controller.ts')) yield path;
  }
}

function hasPublicDecorator(node) {
  return (ts.getDecorators(node) ?? []).some((decorator) => {
    const expression = decorator.expression;
    return (
      ts.isCallExpression(expression) &&
      ts.isIdentifier(expression.expression) &&
      expression.expression.text === 'Public'
    );
  });
}

function declaresAuthenticatedRequest(node) {
  if (!node) return false;
  if (
    ts.isTypeReferenceNode(node) &&
    ts.isIdentifier(node.typeName) &&
    node.typeName.text === 'AuthenticatedRequest'
  )
    return true;
  return ts.forEachChild(node, declaresAuthenticatedRequest) ?? false;
}

const errors = [];
for (const path of controllerFiles(sourceRoot)) {
  const source = ts.createSourceFile(
    path,
    readFileSync(path, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  for (const statement of source.statements) {
    if (!ts.isClassDeclaration(statement)) continue;
    const classIsPublic = hasPublicDecorator(statement);
    for (const member of statement.members) {
      if (
        !ts.isMethodDeclaration(member) ||
        !(classIsPublic || hasPublicDecorator(member))
      )
        continue;
      for (const parameter of member.parameters) {
        if (!declaresAuthenticatedRequest(parameter.type)) continue;
        const { line } = source.getLineAndCharacterOfPosition(parameter.getStart(source));
        errors.push(
          `${relative(process.cwd(), path)}:${line + 1}: Public route ${member.name.getText(source)} cannot declare AuthenticatedRequest`,
        );
      }
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
}
