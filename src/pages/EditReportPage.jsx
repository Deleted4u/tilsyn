import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import ReportForm from "@/components/ReportForm";
import { friendlyError, getReport, updateReport } from "@/lib/db";

export default function EditReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(undefined); // undefined = indlæser, null = findes ikke
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getReport(id)
      .then((r) => active && setReport(r || null))
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

  return (
    <ReportForm
      initial={report}
      heading="Rediger tilsynsrapport"
      submitLabel="Gem ændringer"
      onSubmit={async (fields, images) => {
        await updateReport(id, fields, images);
        navigate(`/reports/${id}`);
      }}
    />
  );
}
