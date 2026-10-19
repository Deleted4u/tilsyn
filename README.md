# Tilsyn Plus – selvstændig version (uden Base44)

En gratis tilsynsapp, der gemmer alt **på din egen enhed** (telefon eller computer). Ingen server, ingen database, ingen Base44, ingen betalte tjenester.

## Vigtigt at vide først

- **Data synkroniseres IKKE automatisk mellem enheder.** Rapporter oprettet på din iPhone ligger kun på din iPhone (i den browser, du brugte). Hvis en kollega skal se eller overtage en rapport, skal du dele en **PDF** eller en **backupfil** (fx via OneDrive).
- Hvis du rydder browserens data/historik, eller sletter appen fra hjemmeskærmen, kan rapporterne forsvinde. **Lav jævnligt en backup** (menuen "Backup").
- Der er ingen login. Hvem der end åbner appen på din enhed, ser rapporterne.

## Din arbejdsgang med OneDrive

1. Opret og gem tilsynet i appen.
2. Åbn rapporten og tryk **Lav PDF** (til læsning) og/eller **Lav backupfil** (til import i appen).
3. Tryk **Del** og vælg OneDrive (eller tryk **Download** og læg filen i den delte OneDrive-mappe).
4. Den anden bruger henter filen fra OneDrive og vælger **Backup → Importér backup** i appen.

## Trin 0: Gem din oprindelige kode

Behold din Base44-kode i en separat mappe, som du ikke lægger på GitHub. Den nye app ændrer ikke noget i Base44.

## Trin 1: Test lokalt på din computer (valgfrit)

1. Installér **Node.js (LTS)** fra nodejs.org.
2. Åbn en terminal i denne mappe.
3. Kør `npm install` (kun første gang).
4. Kør `npm run dev` og åbn adressen, der vises (typisk `http://localhost:5173`).
5. Kør `npm run build` for at kontrollere, at appen kan bygges. Der oprettes en mappe `dist`.

## Trin 2: Publicér gratis på GitHub Pages

Det kræver en gratis GitHub-konto. Appen indeholder **ingen** rapportdata eller hemmeligheder, så et offentligt repository er sikkert. Dine rapporter ligger aldrig i repositoriet.

1. På github.com: **New repository**. Giv det et navn, fx `tilsyn-plus`, og vælg **Public** (GitHub Pages er gratis for offentlige repositories).
2. Upload alle filer fra denne mappe. Gør det gerne i denne rækkefølge:
   - **Add file → Upload files**, og træk alt indhold ind **undtagen** mapperne `.github` og `node_modules`.
   - Filen til automatisk publicering ligger i `.github/workflows/deploy.yml`. Opret den manuelt: **Add file → Create new file**, skriv `.github/workflows/deploy.yml` som filnavn, og indsæt filens indhold.
3. Gå til **Settings → Pages**. Under **Source** vælger du **GitHub Actions**.
4. Gå til fanen **Actions**. Vent til kørslen "Byg og publicér til GitHub Pages" er grøn (1-3 minutter). Er den rød, så kopiér fejlteksten og send den til mig.
5. Adressen står under **Settings → Pages**, typisk `https://dit-brugernavn.github.io/tilsyn-plus/`.

**Alternativ uden GitHub:** kør `npm run build` og træk mappen `dist` ind på netlify.com/drop (gratis) eller upload den til Cloudflare Pages.

## Brug på iPhone

1. Åbn adressen i **Safari**.
2. Tryk på del-ikonet og vælg **Føj til hjemmeskærm**, så den ligner en app.
3. Tilføj billeder med **Vælg billeder** eller **Tag billede**.

Husk: data ligger i den browser eller app-genvej, du bruger. Safari og hjemmeskærm-genvejen kan have hver sin lagring, så brug helst kun én af dem.

## Hvad er ændret i forhold til Base44-versionen

| Før (Base44) | Nu |
|---|---|
| Rapporter og billeder i Base44-skyen | IndexedDB på enheden |
| Login og registrering | Fjernet (ikke nødvendigt uden server) |
| Hurtige kommentarer i Base44 | Gemmes lokalt, administreres under Backup |
| Send PDF som e-mail via Base44 | Lav PDF, og del via enhedens delemenu eller download |
| TanStack Start med serverfunktioner | Ren statisk app (Vite + React Router med `#` i adressen) |

## Begrænsninger

- Ingen automatisk synkronisering og ingen login (se øverst).
- PDF og backupfil laves i to trin (først "Lav", så "Del"), fordi iPhone kun tillader deling direkte efter et tryk.
- Delemenuen med fil virker i Safari på iPhone og i mange mobilbrowsere. På mange computere findes den ikke, og så bruger du **Download**.
- Appen kan ikke sende en e-mail med PDF som vedhæftning automatisk. Brug delemenuen og vælg Mail.
- Billeder skaleres ned til maks. 1600 px på den lange led, for at spare plads. Det er rigeligt til skærm og PDF, men ikke til store udskrifter.
- Tidsstemplet på billeder vises som en tekst oven på billedet (i appen og i PDF'en). Det er ikke brændt ind i selve billedfilen.
- Backupfiler med mange billeder kan blive store (flere hundrede MB). Lav i så fald flere backups af enkeltrapporter.
- PDF-layoutet er nyt (jeg havde ikke den oprindelige `pdf-export.js`), og kan se anderledes ud end i Base44.
