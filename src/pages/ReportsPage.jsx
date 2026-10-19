import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Plus, ClipboardList, Loader2 } from "lucide-react";
import LocalDataNotice from "@/components/LocalDataNotice";
import { listReports, friendlyError } from "@/lib/db";
import { formatDate } from "@/lib/format";

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [isPending, setPending] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Tilsynsrapporter";
    let active = true;
    listReports()
      .then((r) => active && setReports(r))
      .catch((e) => active && setError(friendlyError(e)))
      .finally(() => active && setPending(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Tilsynsrapporter</h1>
          <p className="mt-1 text-muted-foreground">
            {reports.length > 0
              ? `${reports.length} rapport${reports.length === 1 ? "" : "er"}`
              : "Opret din første rapport"}
          </p>
        </div>
        <Button asChild>
          <Link to="/reports/new">
            <Plus className="mr-2 h-4 w-4" /> Ny rapport
          </Link>
        </Button>
      </div>

      <LocalDataNotice />

      {error && <p className="rounded-xl border border-destructive/40 p-4 text-sm text-destructive">{error}</p>}

      {isPending ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ClipboardList className="h-7 w-7" />
          </div>
          <div>
            <p className="text-lg font-medium">Ingen rapporter endnu</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Opret en ny tilsynsrapport med billeder og kommentarer.
            </p>
          </div>
          <Button asChild>
            <Link to="/reports/new">
              <Plus className="mr-2 h-4 w-4" /> Opret rapport
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {reports.map((r) => (
            <Link
              key={r.id}
              to={`/reports/${r.id}`}
              className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-sm"
            >
              <h3 className="font-semibold leading-tight tracking-tight group-hover:text-primary">{r.title}</h3>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <div className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(r.date)}
                  {r.time ? ` — ${r.time}` : ""}
                </div>
                {r.address && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0" /> {r.address}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
