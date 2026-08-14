// Pure, client-safe public entry point for export/import validation. No
// `@/db/*` imports here — this module is bundled into the settings UI for a
// live preview before anything is sent to the server, where the same rules
// are re-run as the authoritative check (lib/export-import.ts).

import { validateTables } from "./export-import-rules";
import type { ImportPayload } from "./export-import-types";

export const SCHEMA_VERSION = 1;

export { TABLE_NAMES, validateTables } from "./export-import-rules";
export type { ImportPayload, ImportTables } from "./export-import-types";

export class SchemaVersionError extends Error {
  constructor(public readonly fileVersion: unknown) {
    super(
      `Unsupported schema version ${JSON.stringify(fileVersion)} — this app expects ${SCHEMA_VERSION}`,
    );
    this.name = "SchemaVersionError";
  }
}

export class ValidationError extends Error {
  constructor(public readonly issues: string[]) {
    super(`Import validation failed: ${issues.join("; ")}`);
    this.name = "ValidationError";
  }
}

/** Full structural validation of an untrusted import file; throws on any problem. */
export function validate(data: unknown): ImportPayload {
  if (typeof data !== "object" || data === null) {
    throw new ValidationError(["payload: expected an object"]);
  }
  const obj = data as Record<string, unknown>;

  if (typeof obj.schemaVersion !== "number") {
    throw new ValidationError(["schemaVersion: expected a number"]);
  }
  if (obj.schemaVersion !== SCHEMA_VERSION) {
    throw new SchemaVersionError(obj.schemaVersion);
  }

  const issues: string[] = [];
  if (typeof obj.exportedAt !== "string") {
    issues.push("exportedAt: expected a string");
  }
  const tables = validateTables(obj.tables, issues);
  if (issues.length > 0 || !tables) throw new ValidationError(issues);

  return {
    schemaVersion: obj.schemaVersion,
    exportedAt: obj.exportedAt as string,
    tables,
  };
}
