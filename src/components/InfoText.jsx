import infoText from "@/content/info-tilsyn-el.txt?raw";

// Viser teksten fra src/content/info-tilsyn-el.txt. Linjer der starter med "# " vises som overskrift.
export default function InfoText() {
  const lines = infoText.replace(/\r/g, "").split("\n");
  return (
    <div className="space-y-1 text-sm">
      {lines.map((line, i) =>
        line.startsWith("# ") ? (
          <p key={i} className="pt-2 font-semibold">
            {line.slice(2)}
          </p>
        ) : line.trim() === "" ? (
          <div key={i} className="h-1" />
        ) : (
          <p key={i}>{line}</p>
        )
      )}
    </div>
  );
}
