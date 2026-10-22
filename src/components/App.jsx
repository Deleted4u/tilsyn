import { HashRouter, Link, Route, Routes } from "react-router-dom";
import Layout from "@/components/Layout";
import ReportsPage from "@/pages/ReportsPage";
import NewReportPage from "@/pages/NewReportPage";
import EditReportPage from "@/pages/EditReportPage";
import ReportViewPage from "@/pages/ReportViewPage";
import AdminPage from "@/pages/AdminPage";
import SettingsPage from "@/pages/SettingsPage";

function NotFound() {
  return (
    <div className="space-y-4 py-16 text-center">
      <p className="text-lg font-medium">Siden findes ikke</p>
      <Link to="/" className="text-sm underline underline-offset-2">
        Tilbage til oversigten
      </Link>
    </div>
  );
}

// HashRouter (adresser som #/reports/123) betyder, at genindlæsning af en side
// aldrig giver "404" på gratis statisk hosting som GitHub Pages.
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<ReportsPage />} />
          <Route path="reports/new" element={<NewReportPage />} />
          <Route path="reports/admin" element={<AdminPage />} />
          <Route path="reports/:id" element={<ReportViewPage />} />
          <Route path="reports/:id/edit" element={<EditReportPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
