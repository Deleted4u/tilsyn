import { useNavigate } from "react-router-dom";
import ReportForm from "@/components/ReportForm";
import { createReport } from "@/lib/db";

export default function NewReportPage() {
  const navigate = useNavigate();
  return (
    <ReportForm
      onSubmit={async (fields, images) => {
        const id = await createReport(fields, images);
        navigate(`/reports/${id}`);
      }}
    />
  );
}
