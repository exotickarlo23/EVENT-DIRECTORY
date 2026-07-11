"use client";

import Link from "next/link";
import { useActionState, useMemo } from "react";
import {
  previewCsvImport,
  confirmCsvImport,
  type CsvPreviewResult,
  type CsvImportResult,
} from "@/lib/actions/admin";
import { Button, Label, Textarea, Badge } from "@/components/ui";

export function ImportWizard() {
  const [preview, previewAction, previewPending] = useActionState<CsvPreviewResult | null, FormData>(
    previewCsvImport,
    null
  );
  const [result, confirmAction, confirmPending] = useActionState<CsvImportResult | null, FormData>(
    confirmCsvImport,
    null
  );

  const validRows = useMemo(
    () => (preview?.rows ?? []).filter((r) => r.errors.length === 0),
    [preview]
  );

  if (result?.ok) {
    return (
      <div className="rounded-card border border-teal/30 bg-teal/5 p-8 text-center">
        <h2 className="font-display text-xl font-semibold text-plum">Import dovršen</h2>
        <p className="mt-2 text-sm text-muted">
          Uvezeno: <strong>{result.imported}</strong> · Preskočeno: <strong>{result.skipped}</strong>
        </p>
        <Link href="/admin/oglasi" className="mt-4 inline-block font-bold text-teal underline">
          Otvori popis oglasa →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form action={previewAction} className="rounded-card border border-line bg-white p-6 shadow-card">
        <div className="grid gap-4">
          <div>
            <Label htmlFor="csv-file">CSV datoteka</Label>
            <input
              id="csv-file"
              type="file"
              name="file"
              accept=".csv,text/csv"
              className="block w-full text-sm text-ink file:mr-3 file:rounded-full file:border-0 file:bg-plum file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
            />
          </div>
          <div>
            <Label htmlFor="csv-text">…ili zalijepi CSV sadržaj</Label>
            <Textarea id="csv-text" name="csv_text" className="min-h-32 font-mono text-xs" placeholder={"name,category_slug,location_slug\nMoj biznis,catering-i-hrana,zagreb"} />
          </div>
        </div>
        {preview && !preview.ok ? (
          <p role="alert" className="mt-3 rounded-xl bg-coral/10 px-4 py-3 text-sm font-semibold text-coral-dark">
            {preview.error}
          </p>
        ) : null}
        <Button type="submit" disabled={previewPending} className="mt-4">
          {previewPending ? "Analiza…" : "Prikaži pregled"}
        </Button>
      </form>

      {preview?.ok && preview.rows ? (
        <div className="rounded-card border border-line bg-white p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold text-plum">
            Pregled ({preview.rows.length} redaka · {validRows.length} ispravnih)
          </h2>
          <div className="mt-4 max-h-96 overflow-auto rounded-xl border border-line">
            <table className="w-full min-w-[700px] text-xs">
              <thead>
                <tr className="border-b border-line text-left font-bold uppercase text-muted">
                  <th className="p-2">#</th>
                  <th className="p-2">Naziv</th>
                  <th className="p-2">Kategorija</th>
                  <th className="p-2">Lokacija</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row) => (
                  <tr key={row.rowNumber} className="border-b border-line last:border-0">
                    <td className="p-2 text-muted">{row.rowNumber}</td>
                    <td className="p-2 font-semibold text-plum">{row.data.name || "—"}</td>
                    <td className="p-2">{row.data.category_slug || "—"}</td>
                    <td className="p-2">{row.data.location_slug || "—"}</td>
                    <td className="p-2">
                      {row.errors.length > 0 ? (
                        <span className="font-semibold text-coral-dark">{row.errors.join("; ")}</span>
                      ) : row.duplicates.length > 0 ? (
                        <Badge variant="warning">
                          Mogući duplikat: {row.duplicates.map((d) => `${d.name} (${d.reason})`).join(", ")}
                        </Badge>
                      ) : (
                        <Badge variant="success">OK</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {validRows.length > 0 ? (
            <form action={confirmAction} className="mt-4 space-y-3">
              <input type="hidden" name="rows_json" value={JSON.stringify(validRows.map((r) => r.data))} />
              <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-plum">
                <input type="checkbox" name="publish" className="h-4 w-4 accent-coral" />
                Odmah objavi (inače se uvoze kao draft)
              </label>
              {result && !result.ok ? (
                <p role="alert" className="rounded-xl bg-coral/10 px-4 py-3 text-sm font-semibold text-coral-dark">
                  {result.error}
                </p>
              ) : null}
              <Button type="submit" variant="secondary" disabled={confirmPending}>
                {confirmPending ? "Uvoz…" : `Uvezi ${validRows.length} ispravnih redaka`}
              </Button>
            </form>
          ) : (
            <p className="mt-4 text-sm font-semibold text-coral-dark">
              Nijedan redak nije ispravan — ispravi greške i pokušaj ponovno.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
