# Nebenkostenabrechnung UI - Implementation Status

**Datum:** 27. Februar 2026  
**Status:** Phase 1 Complete ✅

---

## ✅ Was Jetzt Funktioniert

### 1. **Abrechnungszeiträume Verwalten** ✅

**Seite:** `/dashboard/nka/periods`

**Features:**
- Liste aller Abrechnungszeiträume
- Gruppiert nach Objekt
- Status-Badges (Entwurf, Finalisiert, Versendet, Archiviert)
- Neuen Zeitraum erstellen (Dialog)
- Automatische Validierung (kein Duplikat pro Jahr/Objekt)

**API:**
- `GET /api/nka/periods` - Liste aller Zeiträume
- `POST /api/nka/periods` - Neuen Zeitraum erstellen

### 2. **Zeitraum-Details & Kostenerfassung** ✅

**Seite:** `/dashboard/nka/periods/[id]`

**Features:**
- Vollständige Zeitraum-Übersicht
- Zusammenfassung: Gesamtkosten, Umlagefähig, Anzahl Kostenarten
- Liste aller erfassten Kosten mit Details
- Kosten hinzufügen (Dialog)
- Kostenart aus 19 vordefinierten Kategorien wählen
- Automatischer Verteilerschlüssel pro Kategorie
- Umlagefähiger Betrag (optional anders als Gesamtbetrag)
- Rechnung

snummer & -datum
- Beschreibung

**API:**
- `GET /api/nka/periods/[id]` - Zeitraum mit allen Kosten
- `PUT /api/nka/periods/[id]` - Status ändern
- `POST /api/nka/costs` - Kosten hinzufügen
- `GET /api/nka/categories` - Kostenarten

### 3. **Kostenarten (19 Vordefiniert)** ✅

**Nach § 2 BetrKV:**

| Nr | Kostenart | Verteilerschlüssel | Umlagefähig |
|----|-----------|-------------------|-------------|
| 1 | Grundsteuer | Nach m² | ✅ |
| 2 | Wasserversorgung | Nach Verbrauch | ✅ |
| 3 | Entwässerung | Nach Verbrauch | ✅ |
| 4 | **Heizkosten** | **70% Verbrauch + 30% Fläche** | ✅ |
| 5 | Warmwasser | Nach Verbrauch | ✅ |
| 6 | Aufzug | Nach Einheiten | ✅ |
| 7 | Straßenreinigung | Nach m² | ✅ |
| 8 | Müllbeseitigung | Nach Einheiten | ✅ |
| 9 | Gebäudereinigung | Nach m² | ✅ |
| 10 | Gartenpflege | Nach m² | ✅ |
| 11 | Beleuchtung | Nach m² | ✅ |
| 12 | Schornsteinreinigung | Nach Einheiten | ✅ |
| 13 | Gebäudeversicherung | Nach m² | ✅ |
| 14 | Hausmeister | Nach m² | ✅ |
| 15 | Antenne/Kabel | Nach Einheiten | ✅ |
| 16 | Wascheinrichtungen | Nach Einheiten | ✅ |
| 17 | Sonstige | Nach m² | ✅ |
| 18 | Reparaturen | Nach m² | ❌ Nicht umlagefähig |
| 19 | Verwaltungskosten | Nach m² | ❌ Nicht umlagefähig |

### 4. **Verbesserte UI-Komponenten** ✅

**Neue Komponenten:**
- `Dialog` mit `DialogTrigger` - Modal-Dialoge
- `Select` / `SelectTrigger` / `SelectValue` / `SelectContent` / `SelectItem` - Dropdown-Select
- `SimpleSelect` - Backward-kompatible native Select für alte Forms

**Navigation:**
- Neuer Menüpunkt "Nebenkostenabrechnung" → `/dashboard/nka/periods`

---

## 🚧 Was Noch Fehlt

### Phase 2: Verbrauchszähler & Ablesungen

**Seiten zu bauen:**
1. `/dashboard/nka/meters` - Zähler-Verwaltung
2. `/dashboard/nka/meters/readings` - Zählerstände erfassen

**Features:**
- Zähler anlegen (Heizung, Warmwasser, Kaltwasser, Gas, Strom)
- Zähler Mietern zuordnen
- Zählerstände erfassen (Datum, Wert)
- Automatische Verbrauchsberechnung (aktuell - vorher)
- Verbrauch in NKA-Berechnung einbeziehen

**API-Endpunkte:**
- `POST /api/nka/meters` - Zähler anlegen
- `GET /api/nka/meters?tenantId=X` - Zähler eines Mieters
- `POST /api/nka/meters/[id]/readings` - Ablesung hinzufügen
- `GET /api/nka/meters/[id]/readings` - Ablesungen anzeigen

### Phase 3: Vorauszahlungen Tracking

**Seiten zu bauen:**
1. `/dashboard/nka/advances` - Vorauszahlungen-Übersicht

**Features:**
- Vorauszahlungen pro Mieter & Zeitraum erfassen
- Monatlicher Betrag × Anzahl Monate
- Automatische Berechnung Gesamtsumme
- In NKA-Saldierung einbeziehen

**API-Endpunkte:**
- `POST /api/nka/advances` - Vorauszahlung erfassen
- `GET /api/nka/advances?tenantId=X&periodId=Y` - Vorauszahlungen abrufen

### Phase 4: Erweiterte Mieter-Daten

**UI zu erweitern:**
- Mieter-Formular um Felder ergänzen:
  - Wohnfläche (m²)
  - Personenzahl
  - Miteigentumsanteil (optional)

**Bereits in DB vorhanden:**
- `Tenant.squareMeters`
- `Tenant.numberOfPersons`
- `Tenant.eigentumsanteil`

**Nur UI fehlt!**

### Phase 5: Abrechnungen Generieren & PDF

**Seite zu bauen:**
1. `/dashboard/nka/periods/[id]/calculate` - Abrechnungen erstellen

**Features:**
- Alle Mieter des Objekts anzeigen
- "Abrechnung erstellen" pro Mieter
- API-Call zu `/api/nka-pro/generate`
- Ergebnis anzeigen (Kosten, Vorauszahlungen, Saldo)
- PDF generieren mit allen Details
- PDF herunterladen

**PDF-Inhalt (Rechtssicher):**
1. Kopfzeile mit Vermieter/Mieter-Daten
2. Abrechnungszeitraum
3. Aktive Monate (bei Teiljahr)
4. Gesamtkosten Objekt (Tabelle)
5. Verteilerschlüssel-Erklärung
6. Mieteranteil pro Kostenart
7. Vorauszahlungen
8. Saldo (Nachzahlung/Guthaben)
9. Fußnote: Widerspruchsfrist, § 556 BGB

### Phase 6: Massen-Abrechnung

**Features:**
- Alle Mieter eines Zeitraums auf einmal abrechnen
- Bulk-PDF-Generierung
- ZIP-Download aller PDFs
- Status-Tracking (welche Abrechnungen versendet)

### Phase 7: Excel-Export

**Features:**
- Komplette Abrechnung als XLSX
- Sheet 1: Übersicht
- Sheet 2-N: Pro Mieter Detail
- Formeln für Nachvollziehbarkeit

---

## 📊 Berechnungslogik (Bereits Implementiert)

**Datei:** `lib/nkaCalculations.ts`

**Funktionen:**
- ✅ `calculateNebenkostenabrechnung()` - Hauptfunktion
- ✅ `validateNKAInputs()` - Validierung
- ✅ Aktive Monate berechnen
- ✅ 6 Verteilerschlüssel-Methoden
- ✅ Vorauszahlungs-Saldierung
- ✅ Detaillierte Berechnungswege

**API:**
- ✅ `GET /api/nka-pro/generate?tenantId=X&periodId=Y`

**Rückgabe:**
```json
{
  "period": { "id", "year", "startDate", "endDate", "status" },
  "tenant": { "id", "name", "email", "squareMeters", ... },
  "property": { "id", "address", "totalSquareMeters", "totalUnits", ... },
  "calculation": {
    "tenant": { "activeMonths": 12, "factor": 1.0 },
    "property": { "totalSquareMeters", "totalUnits", "totalPersons" },
    "costs": {
      "byCategory": {
        "Heizkosten": {
          "total": 10000,
          "allocable": 10000,
          "tenantShare": 803.75,
          "allocationType": "HEATING_MIXED",
          "calculation": "(1200/15000) × 7000 + (65/800) × 3000 = 803.75"
        },
        ...
      },
      "totalPropertyCosts": 25000,
      "totalTenantCosts": 2150.50
    },
    "advancePayments": {
      "monthlyAmount": 200,
      "months": 12,
      "total": 2400
    },
    "balance": {
      "costs": 2150.50,
      "advances": 2400,
      "difference": 249.50,
      "type": "GUTHABEN"
    }
  }
}
```

---

## 🎯 Nächste Schritte (Empfohlen)

### Sofort (Phase 2):
1. ✅ Seeding der 19 Kostenarten (`npm run seed`)
2. Mieter-Daten erweitern (Wohnfläche, Personen, MEA)
3. Verbrauchszähler-System bauen

### Dann (Phase 3-5):
4. Vorauszahlungen-UI
5. Abrechnungs-Generator-UI
6. PDF-Generierung verbessern

### Später (Phase 6-7):
7. Massen-Abrechnung
8. Excel-Export
9. E-Mail-Versand

---

## 🌐 Deployment

**Status:** ✅ Deployed (Auto-Deployment aktiv)

**URL:** https://propmaster-ggj3hazu-daviddordic-3083s-projects.vercel.app

**Neue Seiten:**
- `/dashboard/nka/periods` - Abrechnungszeiträume
- `/dashboard/nka/periods/[id]` - Zeitraum-Details & Kostenerfassung

**API-Endpunkte (Live):**
- `GET /api/nka/periods`
- `POST /api/nka/periods`
- `GET /api/nka/periods/[id]`
- `POST /api/nka/costs`
- `GET /api/nka/categories`
- `GET /api/nka-pro/generate`

---

## 📂 Wichtige Dateien (Neu)

```
/app/(dashboard)/nka/
├── periods/
│   ├── page.tsx                 ← Liste aller Zeiträume
│   └── [id]/page.tsx            ← Zeitraum-Details
/app/api/nka/
├── periods/
│   ├── route.ts                 ← GET/POST Zeiträume
│   └── [id]/route.ts            ← GET/PUT Zeitraum
├── costs/route.ts               ← POST Kosten
└── categories/route.ts          ← GET Kostenarten
/components/nka/
├── CreatePeriodForm.tsx         ← Zeitraum-Formular
└── AddCostForm.tsx              ← Kosten-Formular
/components/ui/
├── dialog.tsx                   ← Modal-Dialog (erweitert)
├── select.tsx                   ← Custom Select Component
└── simple-select.tsx            ← Native Select Wrapper
```

---

## 🔐 Rechtssicherheit

**Implementiert:**
- ✅ § 556 BGB konforme Struktur
- ✅ § 2 BetrKV Kostenarten
- ✅ HeizkostenV § 7-9 (70/30-Regel)
- ✅ Nachvollziehbare Berechnungen
- ✅ Umlagefähig/Nicht-umlagefähig Markierung

**Noch zu tun:**
- PDF mit Widerspruchsbelehrung
- 12-Monats-Frist Tracking
- Belegverwaltung (10 Jahre Aufbewahrung)

---

## 📈 Nutzungs-Flow

### Aktueller Flow (Phase 1):

1. **Zeitraum erstellen**
   - Gehe zu "Nebenkostenabrechnung"
   - Klicke "Neuer Zeitraum"
   - Wähle Objekt, Jahr, Start-/Enddatum
   - Erstellen

2. **Kosten erfassen**
   - Öffne Zeitraum
   - Klicke "Kosten hinzufügen"
   - Wähle Kostenart (z.B. Heizkosten)
   - Gib Betrag ein (z.B. 10.000€)
   - Optional: Rechnungsnr., Datum, Beschreibung
   - Speichern
   - Wiederhole für alle Kosten

3. **Berechnungen erstellen** (Phase 5)
   - Klicke "Abrechnungen erstellen"
   - Wähle Mieter aus
   - System berechnet automatisch
   - PDF generieren
   - Download

### Vollständiger Flow (nach Phase 7):

1. Zeitraum erstellen
2. Zählerstände erfassen
3. Kosten erfassen
4. Vorauszahlungen prüfen
5. Abrechnungen generieren
6. PDFs herunterladen
7. Optional: Per E-Mail versenden

---

**Status:** Phase 1 Complete ✅  
**Build:** Successful ✅  
**Deployed:** Live ✅  
**Nächstes Ziel:** Mieter-Daten erweitern + Verbrauchszähler  

🔱 **PropMaster Professional NKA - Made in Germany**
