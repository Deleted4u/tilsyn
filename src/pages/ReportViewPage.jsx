import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, DatabaseBackup, FileText, Hash, Loader2, MapPin, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import BlobImage from "@/components/BlobImage";
import FileActions from "@/components/FileActions";
import { deleteReport, friendlyError, getReport } from "@/lib/db";
import { buildReportPdf } from "@/lib/pdf";
import { buildBackup } from "@/lib/backup";
import { formatDate, formatTimestamp, safeFileName } from "@/lib/format";

export default function ReportViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(undefined); // undefined = indlæser, null = findes ikke
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getReport(id)
      .then((r) => {
        if (!active) return;
        setReport(r || null);
        if (r) document.title = r.title;
      })
      .catch((e) => {
        if (active) {
          setError(friendlyError(e));
          setReport(null);
        }
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (report === undefined) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (report === null) {
    return (
      <div className="space-y-4 py-10 text-center">
        <p className="text-lg font-medium">{error || "Rapporten blev ikke fundet på denne enhed."}</p>
        <Link to="/" className="text-sm underline underline-offset-2">
          Tilbage til oversigten
        </Link>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!window.confirm("Slet rapporten permanent? Det kan ikke fortrydes. Lav gerne en backup først.")) return;
    try {
      await deleteReport(id);
      navigate("/");
    } catch (e) {
      setError(friendlyError(e));
    }
  };

  const baseName = safeFileName(`Tilsyn ${report.title} ${report.date}`);

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Tilbage
        </Link>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to={`/reports/${id}/edit`}>
              <Pencil className="mr-2 h-3.5 w-3.5" /> Rediger
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={handleDelete}>
            <Trash2 className="mr-2 h-3.5 w-3.5" /> Slet
          </Button>
        </div>
      </div>

      {error && <p className="rounded-xl border border-destructive/40 p-4 text-sm text-destructive">{error}</p>}

      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{report.title}</h1>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(report.date)}
            {report.time ? ` — ${report.time}` : ""}
          </span>
          {report.sl_nr && (
            <span className="inline-flex items-center gap-1.5">
              <Hash className="h-3.5 w-3.5" /> SL-Nr: {report.sl_nr}
            </span>
          )}
          {report.address && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> {report.address}
            </span>
          )}
        </div>
      </div>

      {report.comment && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">Kommentar</h2>
          <p className="whitespace-pre-wrap">{report.comment}</p>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">
          Billeder{report.images.length > 0 ? ` (${report.images.length})` : ""}
        </h2>
        {report.images.length === 0 ? (
          <p className="text-sm text-muted-foreground">Ingen billeder i denne rapport.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {report.images.map((img) => (
              <div key={img.id} className="space-y-3 rounded-2xl border border-border bg-card p-3">
                <div className="relative overflow-hidden rounded-xl bg-muted">
                  <BlobImage blob={img.blob} className="w-full object-cover" />
                  {report.timestamp_enabled && img.timestamp && (
                    <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
                      {formatTimestamp(img.timestamp)}
                    </span>
                  )}
                </div>
                {img.comment && <p className="whitespace-pre-wrap px-1 text-sm">{img.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6 rounded-2xl border border-border bg-card p-6">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">PDF</h2>
          <FileActions
            label="Lav PDF"
            icon={FileText}
            build={async () => ({ blob: await buildReportPdf(report), filename: `${baseName}.pdf` })}
          />
        </div>
        <div className="space-y-3 border-t border-border pt-6">
          <h2 className="text-lg font-semibold tracking-tight">Backup af denne rapport</h2>
          <p className="text-sm text-muted-foreground">
            En backupfil kan importeres i appen på en anden enhed, inkl. billeder og kommentarer.
          </p>
          <FileActions
            label="Lav backupfil"
            icon={DatabaseBackup}
            variant="outline"
            build={async () => ({ blob: await buildBackup({ ids: [id] }), filename: `${baseName} - backup.json` })}
          />
        </div>
      </div>
    </div>
  );
}
