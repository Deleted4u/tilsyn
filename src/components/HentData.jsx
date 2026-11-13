import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listReports } from "@/lib/db";
import { TYPES, typeOf } from "@/lib/reportTypes";

const label = (r) => [r.name, r.sl_nr].filter(Boolean).join(" · ") || r.address || r.title;

// "Hent data": henter Navn, SL-Nr og Adresse fra en eksisterende rapport.
// Kommer man fra en anden rapport (fromId), står knappen klar med den rapports navn.
export default function HentData({ fromId, onPick }) {
  const [reports, setReports] = useState(null);
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState("");

  useEffect(() => {
    let active = true;
    listReports()
      .then((r) => active && setReports(r))
      .catch(() => active && setReports([]));
    return () => {
      active = false;
    };
  }, []);

  const source = fromId && reports ? reports.find((r) => r.id === fromId) : null;

  const pick = (r) => {
    onPick({ name: r.name || "", sl_nr: r.sl_nr || "", address: r.address || "" });
    setDone(`Data hentet fra ${label(r)}`);
    setOpen(false);
  };

  if (!reports || reports.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {source ? (
          <Button type="button" variant="outline" onClick={() => pick(source)}>
            <Download className="mr-2 h-4 w-4" /> Hent data fra {label(source)}
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            <Download className="mr-2 h-4 w-4" /> Hent data
          </Button>
        )}
        {source && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="text-sm text-muted-foreground underline underline-offset-2"
          >
            Vælg en anden
          </button>
        )}
        {done && <span className="text-sm text-muted-foreground">{done}</span>}
      </div>
      {open && (
        <ul className="max-h-64 divide-y divide-border overflow-auto rounded-xl border border-border bg-card">
          {reports.slice(0, 30).map((r) => {
            const { Icon } = TYPES[typeOf(r)];
            return (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => pick(r)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left text-sm hover:bg-accent"
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{label(r)}</span>
                    {r.address && <span className="block truncate text-muted-foreground">{r.address}</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
