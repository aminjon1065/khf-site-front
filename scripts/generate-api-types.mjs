import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";

const root = process.cwd();
const bundledSchemaPath = resolve(root, "openapi/openapi.json");
const workspaceSchemaPath = resolve(
  root,
  process.env.OPENAPI_SCHEMA ?? "../khf-site-cms/openapi/openapi.json",
);
const outputPath = resolve(root, "lib/api.generated.ts");
const checkOnly = process.argv.includes("--check");

const bundledRaw = await readFile(bundledSchemaPath, "utf8").catch(() => null);
const workspaceRaw = await readFile(workspaceSchemaPath, "utf8").catch(
  () => null,
);

if (checkOnly && bundledRaw && workspaceRaw && bundledRaw !== workspaceRaw) {
  throw new Error(
    "Bundled OpenAPI snapshot differs from the CMS schema. Run `npm run api:types`.",
  );
}

const raw = checkOnly
  ? bundledRaw
  : (workspaceRaw ?? bundledRaw);

if (!raw) {
  throw new Error(
    `OpenAPI schema is missing at ${bundledSchemaPath} and ${workspaceSchemaPath}.`,
  );
}

if (!checkOnly && workspaceRaw && bundledRaw !== workspaceRaw) {
  await mkdir(resolve(root, "openapi"), { recursive: true });
  await writeFile(bundledSchemaPath, workspaceRaw);
}

const document = JSON.parse(raw);

if (document.openapi !== "3.1.0") {
  throw new Error(`Expected OpenAPI 3.1.0, received ${document.openapi}`);
}

const schemas = document.components?.schemas;

if (!schemas || typeof schemas !== "object") {
  throw new Error("OpenAPI components.schemas is missing.");
}

const indent = (level) => "  ".repeat(level);
const refName = (ref) => ref.split("/").at(-1);
const propertyName = (name) =>
  /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name) ? name : JSON.stringify(name);

function typeFromSchema(schema, level = 0) {
  if (!schema || typeof schema !== "object") {
    return "unknown";
  }

  if (schema.$ref) {
    return refName(schema.$ref);
  }

  if (schema.oneOf || schema.anyOf) {
    return (schema.oneOf ?? schema.anyOf)
      .map((candidate) => typeFromSchema(candidate, level))
      .join(" | ");
  }

  if (schema.allOf) {
    return schema.allOf
      .map((candidate) => typeFromSchema(candidate, level))
      .join(" & ");
  }

  if (Array.isArray(schema.enum)) {
    return schema.enum.map((value) => JSON.stringify(value)).join(" | ");
  }

  if (Array.isArray(schema.type)) {
    return schema.type
      .map((type) =>
        typeFromSchema({ ...schema, type, enum: undefined }, level),
      )
      .join(" | ");
  }

  switch (schema.type) {
    case "null":
      return "null";
    case "string":
      return "string";
    case "integer":
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "array":
      return `Array<${typeFromSchema(schema.items, level)}>`;
    case "object":
    default:
      return objectType(schema, level);
  }
}

function objectType(schema, level) {
  const properties = schema.properties ?? {};
  const required = new Set(schema.required ?? []);
  const entries = Object.entries(properties);

  if (entries.length === 0) {
    if (schema.additionalProperties && schema.additionalProperties !== true) {
      return `Record<string, ${typeFromSchema(schema.additionalProperties, level)}>`;
    }

    return "Record<string, unknown>";
  }

  const lines = entries.map(([name, property]) => {
    const optional = required.has(name) ? "" : "?";
    return `${indent(level + 1)}${propertyName(name)}${optional}: ${typeFromSchema(
      property,
      level + 1,
    )};`;
  });

  if (schema.additionalProperties) {
    const valueType =
      schema.additionalProperties === true
        ? "unknown"
        : typeFromSchema(schema.additionalProperties, level + 1);
    lines.push(`${indent(level + 1)}[key: string]: ${valueType};`);
  }

  return `{\n${lines.join("\n")}\n${indent(level)}}`;
}

function declaration(name, schema) {
  if (
    schema.type === "object" &&
    Object.keys(schema.properties ?? {}).length > 0 &&
    !schema.oneOf &&
    !schema.anyOf &&
    !schema.allOf
  ) {
    const body = objectType(schema, 0);
    return `export interface ${name} ${body}`;
  }

  return `export type ${name} = ${typeFromSchema(schema)};`;
}

const checksum = createHash("sha256").update(raw).digest("hex").slice(0, 16);
const output = [
  "/**",
  " * Generated from khf-site-cms/openapi/openapi.json.",
  ` * Schema SHA-256: ${checksum}`,
  " * Do not edit by hand; run `npm run api:types`.",
  " */",
  "",
  ...Object.entries(schemas).flatMap(([name, schema]) => [
    declaration(name, schema),
    "",
  ]),
].join("\n");

if (checkOnly) {
  const current = await readFile(outputPath, "utf8").catch(() => "");

  if (current !== output) {
    console.error(
      "Generated API types are stale. Run `npm run api:types` and commit the result.",
    );
    process.exit(1);
  }

  console.log(`API types match OpenAPI schema (${checksum}).`);
} else {
  await writeFile(outputPath, output);
  console.log(
    `Generated ${Object.keys(schemas).length} API types (${checksum}).`,
  );
}
