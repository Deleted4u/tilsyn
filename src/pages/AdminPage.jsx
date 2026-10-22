import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, DatabaseBackup, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import FileActions from "@/components/FileActions";
import LocalDataNotice from "@/components/LocalDataNotice";
import { analyzeBackup, applyImport, buildBackup } from "@/lib/backup";
import { friendlyError } from "@/lib/db";
import { todayIso } from "@/lib/format";

const MODES = [
  { value: "skip", label: "Behold mine rapporter (spring over dubletter)", hint: "Sikreste valg" },
  { value: "copy", label: "Gem dubletter som kopier", hint: "Ingenting overskrives" },
  { value: "overwrite", label: "Overskriv mine rapporter med filens version", hint: "Dine ændringer kan gå tabt" },
];

export default function AdminPage() {
  const fileRef = useRef(null);
  const [analysis, setAnalysis] = useState(null);
  const [mode, setMode] = useState("skip");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [storage, setStorage] = useState(null);

  useEffect(() => {
    document.title = "Backup";
    (async () => {
      try {
        const est = await navigator.storage?.estimate?.();
        const persisted = await navigator.storage?.persisted?.();
        if (est) setStorage({ usage: est.usage, quota: est.quota, persisted });
      } catch {
        /* ikke kritisk */
      }
    })();
  }, [result]);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setResult(null);
    setAnalysis(null);
    setBusy(true);
    try {
      setAnalysis(await analyzeBackup(await file.text()));
      setMode("skip");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  const doImport = async () => {
    if (!analysis) return;
    if (
      mode === "overwrite" &&
      analysis.conflicts > 0 &&
      !window.confirm(`${analysis.conflicts} rapport(er) på denne enhed bliver overskrevet. Er du sikker?`)
    ) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      setResult(await applyImport(analysis.data, mode));
      setAnalysis(null);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  const mb = (n) => `${(n / 1024 / 1024).toFixed(0)} MB`;

  return (
    <div className="space-y-10">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Tilbage
      </Link>

      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Backup</h1>
        <p className="mt-1 text-muted-foreground">Del rapporter mellem enheder og lav sikkerhedskopier.</p>
      </div>

      <LocalDataNotice showLink={false} />

      <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold tracking-tight">Eksportér backup</h2>
        <p className="text-sm text-muted-foreground">
          Gemmer alle rapporter med billeder og hurtige kommentarer i én fil. Læg filen i den delte OneDrive-mappe.
        </p>
        <FileActions
          label="Lav backup af alle rapporter"
          icon={DatabaseBackup}
          build={async () => ({ blob: await buildBackup(), filename: `Tilsyn-backup-${todayIso()}.json` })}
        />
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold tracking-tight">Importér backup</h2>
        <p className="text-sm text-muted-foreground">
          Vælg en backupfil (fx fra OneDrive). Du ser først, hvad der vil ske, og intet overskrives uden din
          bekræftelse.
        </p>
        <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={onFile} />
        <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={busy}>
          <Upload className="mr-2 h-4 w-4" /> Vælg backupfil
        </Button>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {analysis && (
          <div className="space-y-4 rounded-xl border border-border p-4">
            <p className="text-sm">
              Filen indeholder <strong>{analysis.total}</strong> rapport{analysis.total === 1 ? "" : "er"}:{" "}
              <strong>{analysis.fresh}</strong> nye og <strong>{analysis.conflicts}</strong> der allerede findes på
              denne enhed.
            </p>
            {analysis.conflicts > 0 && (
              <fieldset className="space-y-2">
                <legend className="mb-1 text-sm font-medium">Hvad skal der ske med dubletter?</legend>
                {MODES.map((m) => (
                  <label key={m.value} className="flex cursor-pointer items-start gap-2 text-sm">
                    <input
                      type="radio"
                      name="mode"
                      value={m.value}
                      checked={mode === m.value}
                      onChange={() => setMode(m.value)}
                      className="mt-1"
                    />
                    <span>
                      {m.label} <span className="text-muted-foreground">({m.hint})</span>
                    </span>
                  </label>
                ))}
              </fieldset>
            )}
            <div className="flex gap-2">
              <Button onClick={doImport} disabled={busy}>
                Importér
              </Button>
              <Button variant="ghost" onClick={() => setAnalysis(null)} disabled={busy}>
                Annuller
              </Button>
            </div>
          </div>
        )}

        {result && (
          <div className="rounded-xl border border-border bg-muted/60 p-4 text-sm">
            <p className="font-medium">Import færdig</p>
            <p className="text-muted-foreground">
              Nye: {result.added} · Sprunget over: {result.skipped} · Gemt som kopi: {result.copied} · Overskrevet:{" "}
              {result.overwritten} · Fejlede: {result.failed} · Nye hurtige kommentarer: {result.quick}
            </p>
            <Link to="/" className="mt-2 inline-block underline underline-offset-2">
              Gå til oversigten
            </Link>
          </div>
        )}
      </section>

      {storage && (
        <p className="text-xs text-muted-foreground">
          Lagerplads brugt af appen: {mb(storage.usage || 0)} af ca. {mb(storage.quota || 0)}.{" "}
          {storage.persisted
            ? "Browseren har lovet ikke at rydde data automatisk."
            : "Browseren kan rydde data, hvis enheden mangler plads – lav derfor jævnligt en backup."}
        </p>
      )}
    </div>
  );
}
