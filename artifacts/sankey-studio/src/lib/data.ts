import type { Row } from "@/data/templates";

export type ImportSummary = {
  rows: Row[];
  columns: string[];
  valid: number;
  ignored: number;
  errors: string[];
  fileName?: string;
};

const safeString = (value: unknown) => String(value ?? "").trim();

export function parseDelimited(text: string): ImportSummary {
  const lines = text.replace(/\r/g, "").split("\n").filter((line) => line.trim().length > 0);
  if (!lines.length) return { rows: [], columns: [], valid: 0, ignored: 0, errors: ["No rows found."] };
  const delimiter = lines[0].includes("\t") ? "\t" : ",";
  const parseLine = (line: string) => line.split(delimiter).map((cell) => cell.replace(/^"|"$/g, "").trim());
  const columns = parseLine(lines[0]).map((column, index) => safeString(column) || `Column ${index + 1}`);
  const rows: Row[] = [];
  let ignored = 0;
  const errors: string[] = [];
  lines.slice(1).forEach((line, rowIndex) => {
    const values = parseLine(line);
    if (values.every((value) => !value)) { ignored += 1; return; }
    const row: Row = {};
    columns.forEach((column, columnIndex) => {
      const raw = values[columnIndex] ?? "";
      const numeric = Number(raw.replace(/[$,%]/g, ""));
      row[column] = raw !== "" && Number.isFinite(numeric) && /[$%]|\d/.test(raw) ? numeric : raw;
    });
    if (Object.values(row).some((value) => safeString(value))) rows.push(row);
    else { ignored += 1; errors.push(`Row ${rowIndex + 2} is empty.`); }
  });
  return { rows, columns, valid: rows.length, ignored, errors };
}

export function parseJson(text: string): ImportSummary {
  try {
    const parsed: unknown = JSON.parse(text);
    const list = Array.isArray(parsed) ? parsed : (parsed && typeof parsed === "object" && "data" in parsed && Array.isArray((parsed as { data: unknown }).data) ? (parsed as { data: unknown[] }).data : []);
    const objects = list.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object" && !Array.isArray(item));
    if (!objects.length) return { rows: [], columns: [], valid: 0, ignored: 0, errors: ["JSON must contain an array of row objects."] };
    const columns = Array.from(new Set(objects.flatMap((item) => Object.keys(item))));
    const rows = objects.map((item) => Object.fromEntries(columns.map((column) => {
      const value = item[column];
      return [column, typeof value === "number" && Number.isFinite(value) ? value : safeString(value)];
    })));
    return { rows, columns, valid: rows.length, ignored: list.length - objects.length, errors: [] };
  } catch {
    return { rows: [], columns: [], valid: 0, ignored: 0, errors: ["Could not read this JSON file."] };
  }
}

export async function parseSpreadsheetBuffer(buffer: ArrayBuffer): Promise<ImportSummary> {
  try {
    const XLSX = await import("xlsx") as any;
    const workbook = XLSX.read(buffer, { type: "array", cellDates: false });
    const firstSheet = workbook.SheetNames[0];
    if (!firstSheet) return { rows: [], columns: [], valid: 0, ignored: 0, errors: ["This workbook has no sheets."] };
    const sheet = workbook.Sheets[firstSheet];
    const json: Array<Record<string, unknown>> = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    const columns = Array.from(new Set(json.flatMap((row) => Object.keys(row))));
    const rows = json.map((row) => Object.fromEntries(columns.map((column) => {
      const value = row[column];
      return [column, typeof value === "number" && Number.isFinite(value) ? value : safeString(value)];
    })));
    return { rows, columns, valid: rows.length, ignored: 0, errors: [] };
  } catch {
    return { rows: [], columns: [], valid: 0, ignored: 0, errors: ["Could not read this spreadsheet in the browser."] };
  }
}

export function rowsToCsv(rows: Row[], columns: string[]) {
  return [columns.join(","), ...rows.map((row) => columns.map((column) => JSON.stringify(row[column] ?? "")).join(","))].join("\n");
}