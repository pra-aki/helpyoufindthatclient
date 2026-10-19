// Triggers a browser download of in-memory data. No backend involved — just a
// Blob and a throwaway <a download> link, which works fine on the deployed
// site (this isn't a sandboxed artifact preview, where that pattern is blocked).

export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadJson(filename: string, data: unknown) {
  downloadBlob(filename, new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
}

/** One CSV field, quoted and escaped only when it needs to be. */
function csvField(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

/** Builds a CSV string from column headers and row objects (keyed by header). */
export function toCsv(headers: string[], rows: Record<string, unknown>[]): string {
  const lines = [headers.map(csvField).join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => csvField(row[h])).join(","));
  }
  // Leading BOM so Excel opens UTF-8 CSVs (e.g. non-English lead text) without mangling them.
  return "﻿" + lines.join("\r\n");
}

export function downloadCsv(filename: string, headers: string[], rows: Record<string, unknown>[]) {
  downloadBlob(filename, new Blob([toCsv(headers, rows)], { type: "text/csv;charset=utf-8" }));
}
