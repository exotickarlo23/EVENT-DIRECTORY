import { CSV_COLUMNS } from "@/lib/csv";
import { ImportWizard } from "./import-wizard";

export const dynamic = "force-dynamic";

export default function AdminImportPage() {
  return (
    <div className="max-w-5xl">
      <h1 className="mb-2 font-display text-2xl font-bold text-plum md:text-3xl">CSV import oglasa</h1>
      <p className="mb-6 text-sm text-muted">
        Obavezni stupci: <code className="rounded bg-sand px-1">name</code>,{" "}
        <code className="rounded bg-sand px-1">category_slug</code>,{" "}
        <code className="rounded bg-sand px-1">location_slug</code>. Podržani stupci:{" "}
        {CSV_COLUMNS.join(", ")}. Prigode i područja usluge odvajaju se znakom | (npr.{" "}
        <code className="rounded bg-sand px-1">djecji-rodendan|vjencanje</code>). Import prvo
        prikazuje pregled s greškama i mogućim duplikatima — ništa se ne objavljuje bez potvrde.
      </p>
      <ImportWizard />
    </div>
  );
}
