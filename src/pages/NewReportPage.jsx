import { useNavigate, useSearchParams } from "react-router-dom";
import ReportForm from "@/components/ReportForm";
import { createReport } from "@/lib/db";
import { isType } from "@/lib/reportTypes";
import { useSettings } from "@/lib/settings";

export default function NewReportPage() {
  const navigate = useNavigate();
  const settings = useSettings();
  const [params] = useSearchParams();
  const wanted = params.get("type");
  const initialType = isType(wanted) ? wanted : isType(settings.defaultType) ? settings.defaultType : "tilsyn";
  const fromId = params.get("from");

  return (
    <ReportForm
      key={`${initialType}-${fromId || ""}`}
      mode="new"
      initialType={initialType}
      fromId={fromId}
      onSubmit={async (fields, images) => {
        const id = await createReport(fields, images);
        navigate(`/reports/${id}`);
      }}
    />
  );
}
