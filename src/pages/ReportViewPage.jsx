import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Check,
  DatabaseBackup,
  FileSpreadsheet,
  FileText,
  Hash,
  Loader2,
  MapPin,
  Minus,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import BlobImage from "@/components/BlobImage";
import FileActions from "@/components/FileActions";
import { deleteReport, friendlyError, getReport } from "@/lib/db";
import { buildReportPdf } from "@/lib/pdf";
import { buildCloudXlsx } from "@/lib/cloud";
import { EL_INFO_LABEL, EL_ITEMS, TYPES, mergeCloud, mergeEl, typeOf } from "@/lib/reportTypes";
import { buildBackup } from "@/lib/backup";
import { formatDate, safeFileName, stampText } from "@/lib/format";
import { useSettings } from "@/lib/settings";

function ImageGrid({ images, report, settings }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {images.map((img) => {
        const stamp = stampText({ name: report.name, timestamp: img.timestamp }, settings);
        return (
          <div key={img.id} className="space-y-3 rounded-2xl border border-border bg-card p-3">
            <div className="relative overflow-hidden rounded-xl bg-muted">
              <BlobImage blob={img.blob} className="w-full object-cover" />
              {stamp && (
                <span className="absolute bottom-2 left-2 max-w-[80%] truncate rounded bg-black/60 px-2 py-0.5 text-xs text-white">
                  {stamp}
                </span>
              )}
            </div>
            {img.comment && <p className="whitespace-pre-wrap px-1 text-sm">{img.comment}</p>}
          </div>
        );
      })}
    </div>
  );
}

function OkMark({ ok }) {
  return ok ? (
    <span className="inline-flex items-center gap-1 text-sm font-medium">
      <Check className="h-4 w-4" /> OK
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
      <Minus className="h-4 w-4" /> Ikke afkrydset
    </span>
  );
}

export default function ReportViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const settings = useSettings();
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

  const type = typeOf(report);
  const { Icon: TypeIcon } = TYPES[type];
  const baseName = safeFileName(`${type === "el" ? "TilsynEL" : "Tilsyn"} ${report.name || report.title} ${report.date}`);
  const cloud = mergeCloud(report.cloud);
  const el = mergeEl(report.el);
  const profileMissing = !settings.profileFirm && !settings.profileName && !settings.profileInitials;
  const generalImages = report.images.filter((i) => !i.section);

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
        <h1 className="flex items-center gap-3 text-3xl font-semibold tracking-tight">
          <TypeIcon className="h-6 w-6 shrink-0 text-muted-foreground" aria-label={TYPES[type].title} />
          {report.title}
        </h1>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
          {report.name && (
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" /> {report.name}
            </span>
          )}
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

      {type === "cloud" && (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold tracking-tight">Konfiguration</h2>
          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Max tilgængelig Amp</dt>
              <dd className="font-medium">{cloud.maxAmp || "–"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Max forbrug (sikringsstørrelse)</dt>
              <dd className="font-medium">{cloud.maxUse || "–"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Tilslutningspunkt</dt>
              <dd className="font-medium">{cloud.connection || "–"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Placering</dt>
              <dd className="font-medium">{cloud.placement || "–"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Ladeboks iD</dt>
              <dd className="font-medium">{cloud.chargerIds.filter(Boolean).join(", ") || "–"}</dd>
            </div>
          </dl>
        </div>
      )}

      {type === "el" && (
        <div className="space-y-6 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold tracking-tight">Kontrolpunkter</h2>
          <div className="flex items-center justify-between gap-4">
            <span className="font-medium">{EL_INFO_LABEL} læst</span>
            <OkMark ok={el.infoOk} />
          </div>
          {EL_ITEMS.map((it) => {
            const imgs = report.images.filter((i) => i.section === it.key);
            return (
              <div key={it.key} className="space-y-3 border-t border-border pt-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium">{it.label}</span>
                  <OkMark ok={el.items[it.key].ok} />
                </div>
                {el.items[it.key].text && <p className="whitespace-pre-wrap text-sm">{el.items[it.key].text}</p>}
                {imgs.length > 0 && <ImageGrid images={imgs} report={report} settings={settings} />}
              </div>
            );
          })}
        </div>
      )}

      {type !== "cloud" && report.comment && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">Kommentar</h2>
          <p className="whitespace-pre-wrap">{report.comment}</p>
        </div>
      )}

      {type !== "cloud" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">
            {type === "el" ? "Øvrige billeder" : "Billeder"}
            {generalImages.length > 0 ? ` (${generalImages.length})` : ""}
          </h2>
          {generalImages.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ingen billeder i denne rapport.</p>
          ) : (
            <ImageGrid images={generalImages} report={report} settings={settings} />
          )}
        </div>
      )}

      <div className="space-y-6 rounded-2xl border border-border bg-card p-6">
        {type === "cloud" ? (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">Excel</h2>
            {profileMissing && (
              <p className="text-sm text-muted-foreground">
                Tip: Udfyld Firma, Kunde og navn under{" "}
                <Link to="/settings" className="underline underline-offset-2">
                  Indstillinger
                </Link>{" "}
                – så kommer de automatisk med i filen.
              </p>
            )}
            <FileActions
              label="Lav Excel"
              icon={FileSpreadsheet}
              build={() =>
                buildCloudXlsx(report, {
                  firm: settings.profileFirm,
                  customer: settings.profileCustomer,
                  initials: settings.profileInitials,
                  fullName: settings.profileName,
                })
              }
            />
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">PDF</h2>
            <FileActions
              label="Lav PDF"
              icon={FileText}
              build={async () => ({
                blob: await buildReportPdf(report, { timestamp: settings.timestamp, nameStamp: settings.nameStamp }),
                filename: `${baseName}.pdf`,
              })}
            />
          </div>
        )}
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
