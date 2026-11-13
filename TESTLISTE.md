# Testliste

Sæt kryds, når punktet er testet. Test både på computer og på iPhone (Safari).

## Publicering
- [ ] GitHub-kørslen under **Actions** er grøn
- [ ] Adressen åbner appen
- [ ] Genindlæs (opdatér siden) på en rapportside: ingen fejl
- [ ] Åbn en rapportadresse direkte (kopiér adressen til en ny fane): rapporten vises

## Oprette
- [ ] Ny rapport med titel, dato, tidspunkt, SL-Nr, adresse og samlet kommentar kan gemmes
- [ ] Manglende titel eller adresse forhindrer gem
- [ ] Rapporten dukker op i oversigten med titel, dato, tidspunkt og adresse

## Billeder
- [ ] Vælg flere billeder på én gang
- [ ] "Tag billede" åbner kameraet (iPhone)
- [ ] Hvert billede kan få sin egen kommentar
- [ ] Et billede kan fjernes, før rapporten gemmes
- [ ] Slå "Tidsstempel alle billeder" til: dato og tid vises på billederne
- [ ] Et stort foto (fra kamera) bliver gemt uden fejl

## Hurtige kommentarer
- [ ] Opret to hurtige kommentarer under **Backup**
- [ ] De vises som knapper under hvert billede og indsættes i kommentaren
- [ ] Slet en hurtig kommentar
- [ ] Efter genåbning af appen findes de stadig

## Genåbne (tab af data)
- [ ] Luk fanen/appen helt og åbn igen: rapporten findes, tekst er intakt
- [ ] Billeder og billedkommentarer vises stadig
- [ ] Tidsstempler vises stadig, hvis de var slået til

## Redigere og slette
- [ ] Rediger titel og kommentar, gem: ændringerne vises
- [ ] Tilføj et billede og fjern et andet i en eksisterende rapport
- [ ] Slet en rapport (bekræftelse vises): den forsvinder fra oversigten

## PDF
- [ ] "Lav PDF" giver en fil med oplysninger, samlet kommentar, billeder og billedkommentarer
- [ ] Æ, ø og å vises korrekt
- [ ] Tidsstempler vises i PDF'en, når de er slået til
- [ ] En rapport med mange billeder (10+) fylder flere sider uden afskårne billeder
- [ ] "Del" åbner delemenuen (iPhone), og filen kan gemmes i OneDrive
- [ ] "Download" gemmer PDF'en

## Eksport og import
- [ ] "Lav backupfil" på en enkelt rapport og på alle rapporter
- [ ] Backupfilen kan lægges i den delte OneDrive-mappe
- [ ] Importér filen på en anden enhed: rapport, billeder og kommentarer er med
- [ ] Importér samme fil igen: appen viser, at rapporterne findes, og beder om valg
- [ ] "Behold mine" ændrer ingenting
- [ ] "Gem som kopier" laver rapporter med "(kopi)" i titlen
- [ ] "Overskriv" beder om bekræftelse
- [ ] Importér en tilfældig fil (fx en PDF eller et billede): tydelig fejlbesked, intet ændres

## Rapporttyper (ikoner øverst)
- [ ] "Ny rapport" åbner den type, der er valgt som Standardrapport i Indstillinger
- [ ] Tre ikoner (tilsyn, sky, lyn) står øverst til højre ved siden af "Tilbage"; det valgte ikon er udfyldt
- [ ] Tryk på et andet ikon i en ny rapport: Navn, SL-Nr og Adresse bliver stående, resten af formularen skifter
- [ ] Åbn en gammel rapport, tryk Rediger, tryk på et andet ikon: en NY rapport åbnes (efter bekræftelse)
- [ ] "Hent data" henter Navn, SL-Nr og Adresse fra den rapport, man kom fra (eller en valgt rapport)
- [ ] Gamle rapporter vises som almindelig TilsynsRapport
- [ ] Forsiden viser Navn, SL-Nr, adresse og et lille ikon for typen på hvert kort

## Profil og Standardrapport (Indstillinger)
- [ ] Firma, Kunde, Dine initialer og Dit navn kan udfyldes og huskes efter genåbning
- [ ] Standardrapport kan skiftes mellem tilsyn, Cloud og TilsynEL

## Cloud Konfig (Excel)
- [ ] Felter: Max tilgængelig Amp, Max forbrug, Tilslutningspunkt (Målerskab), Placering (Terræn), Ladeboks iD
- [ ] "Tilføj iD" tilføjer flere linjer; de havner i B31, B32, B33 … i Excel-filen
- [ ] "Lav Excel" giver en .xlsx med navnet "SL-nr - Konfig CLOUD - V2.xlsx" (uden SL-Nr: datoen i stedet)
- [ ] Firma, elektriker (initialer - navn), SL-Nr, Navn - Adresse og Kunde står de rigtige steder
- [ ] Filen åbner i Excel/Excel-appen, og de låste felter er stadig låste
- [ ] "Del" og "Download" virker som med PDF

## TilsynEL
- [ ] Fire kontrolpunkter med skydeknap (OK), tekst og billeder pr. punkt
- [ ] INFO: (i) viser teksten, og OK-knappen kan slås til
- [ ] PDF'en viser kontrolpunkterne øverst (OK / Ikke afkrydset) og punkternes tekst og billeder
- [ ] Backup og import af en TilsynEL-rapport bevarer afkrydsninger, tekster og billeder pr. punkt

## Beskeder
- [ ] Beskeden om, at data ikke synkroniseres automatisk, kan ses på forsiden og under Backup

## Mobil
- [ ] Ingen vandret scroll på iPhone
- [ ] Felterne zoomer ikke ind, når man trykker i dem
- [ ] Knapper er nemme at ramme med en tommelfinger
- [ ] "Føj til hjemmeskærm" virker

## Fejl
- [ ] (Valgfrit) Fyld enheden op med billeder: en forståelig fejl om manglende plads vises, og eksisterende rapporter er upåvirkede

## Fortrolige data
- [ ] Repositoriet indeholder kun kode (ingen rapporter, PDF'er, backupfiler eller billeder)
