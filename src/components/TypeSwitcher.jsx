import { TYPES, TYPE_KEYS } from "@/lib/reportTypes";

// Tre små ikoner (ingen tekst). Det udfyldte ikon viser, hvilken rapporttype man er i.
export default function TypeSwitcher({ value, onSelect }) {
  return (
    <div className="flex items-center gap-1.5" role="group" aria-label="Rapporttype">
      {TYPE_KEYS.map((k) => {
        const { Icon, title } = TYPES[k];
        const active = value === k;
        return (
          <button
            key={k}
            type="button"
            title={title}
            aria-label={title}
            aria-pressed={active}
            onClick={() => onSelect(k)}
            className={
              "flex h-9 w-9 items-center justify-center rounded-lg border transition-colors " +
              (active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:bg-accent hover:text-foreground")
            }
          >
            <Icon className="h-[18px] w-[18px]" />
          </button>
        );
      })}
    </div>
  );
}
