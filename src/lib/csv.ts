/**
 * Mali CSV parser (RFC 4180 osnovna podrška: navodnici, zarezi, novi redovi u ćelijama).
 * Za MVP bez vanjske ovisnosti.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  const src = text.replace(/^﻿/, ""); // BOM

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(cell);
      cell = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
    } else {
      cell += ch;
    }
  }
  row.push(cell);
  if (row.some((c) => c.trim() !== "")) rows.push(row);
  return rows;
}

/** Stupci koje CSV import podržava (redoslijed nije bitan — mapira se po headeru). */
export const CSV_COLUMNS = [
  "name",
  "business_name",
  "category_slug",
  "location_slug",
  "short_description",
  "description",
  "price_from",
  "price_to",
  "price_model",
  "phone",
  "whatsapp",
  "email",
  "website",
  "instagram",
  "facebook",
  "address",
  "occasions",
  "service_areas",
  "data_source",
] as const;

export type CsvColumn = (typeof CSV_COLUMNS)[number];
