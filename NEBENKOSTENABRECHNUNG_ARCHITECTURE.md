# Nebenkostenabrechnung - Systemarchitektur

## Überblick

Vollständige, rechtssichere Lösung für Nebenkostenabrechnungen gemäß § 556 BGB und Betriebskostenverordnung (BetrKV).

---

## Datenbankschema

### Erweiterte Tabellen

```sql
-- Abrechnungszeitraum
CREATE TABLE AccountingPeriod (
  id TEXT PRIMARY KEY,
  propertyId TEXT NOT NULL,
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  status ENUM('DRAFT', 'FINALIZED', 'SENT'),
  createdAt TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (propertyId) REFERENCES Property(id)
);

-- Kostenarten mit Verteilerschlüssel
CREATE TABLE CostCategory (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  allocationType ENUM('PER_UNIT', 'PER_SQM', 'PER_PERSON', 'CONSUMPTION', 'MEA'),
  isAllocable BOOLEAN DEFAULT true,
  betrkvCategory TEXT -- §1-§17 BetrKV
);

-- Verbrauchszähler
CREATE TABLE ConsumptionMeter (
  id TEXT PRIMARY KEY,
  tenantId TEXT NOT NULL,
  unitId TEXT,
  meterType ENUM('HEATING', 'HOT_WATER', 'COLD_WATER', 'ELECTRICITY'),
  meterNumber TEXT,
  FOREIGN KEY (tenantId) REFERENCES Tenant(id)
);

-- Zählerstände
CREATE TABLE MeterReading (
  id TEXT PRIMARY KEY,
  meterId TEXT NOT NULL,
  readingDate DATE NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  previousValue DECIMAL(10,2),
  consumption DECIMAL(10,2),
  FOREIGN KEY (meterId) REFERENCES ConsumptionMeter(id)
);

-- Vorauszahlungen
CREATE TABLE AdvancePayment (
  id TEXT PRIMARY KEY,
  tenantId TEXT NOT NULL,
  periodId TEXT NOT NULL,
  monthlyAmount DECIMAL(10,2) NOT NULL,
  totalPaid DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (tenantId) REFERENCES Tenant(id),
  FOREIGN KEY (periodId) REFERENCES AccountingPeriod(id)
);

-- Kostenposition
CREATE TABLE CostItem (
  id TEXT PRIMARY KEY,
  periodId TEXT NOT NULL,
  categoryId TEXT NOT NULL,
  totalAmount DECIMAL(10,2) NOT NULL,
  allocableAmount DECIMAL(10,2),
  description TEXT,
  FOREIGN KEY (periodId) REFERENCES AccountingPeriod(id),
  FOREIGN KEY (categoryId) REFERENCES CostCategory(id)
);

-- Mieter-spezifische Daten
ALTER TABLE Tenant ADD COLUMN squareMeters DECIMAL(8,2);
ALTER TABLE Tenant ADD COLUMN numberOfPersons INT DEFAULT 1;
ALTER TABLE Tenant ADD COLUMN eigentumsanteil DECIMAL(5,4); -- MEA (Miteigentumsanteil)
```

---

## Verteilerschlüssel

### 1. Nach Wohnfläche (PER_SQM)
```typescript
tenantShare = (tenantSqm / totalSqm) * totalCost
```

### 2. Nach Anzahl Personen (PER_PERSON)
```typescript
tenantShare = (tenantPersons / totalPersons) * totalCost
```

### 3. Nach Verbrauch (CONSUMPTION)
```typescript
tenantShare = (tenantConsumption / totalConsumption) * totalCost
```

### 4. Nach Einheiten (PER_UNIT)
```typescript
tenantShare = (1 / totalUnits) * totalCost
```

### 5. Nach Miteigentumsanteil (MEA)
```typescript
tenantShare = tenantMEA * totalCost
```

---

## Kostenarten nach BetrKV

**§ 2 BetrKV - Umlagefähige Betriebskosten:**

1. **Grundsteuer** (Property Tax) - PER_SQM or MEA
2. **Wasserversorgung** (Water Supply) - CONSUMPTION or PER_PERSON
3. **Entwässerung** (Sewage) - CONSUMPTION or PER_PERSON
4. **Heizung** (Heating) - CONSUMPTION (§7-§9 HeizkostenV: 50-70% nach Verbrauch, 30-50% nach Fläche)
5. **Warmwasser** (Hot Water) - CONSUMPTION
6. **Aufzug** (Elevator) - PER_UNIT or PER_SQM
7. **Straßenreinigung** (Street Cleaning) - PER_SQM
8. **Müllbeseitigung** (Waste Disposal) - PER_UNIT or PER_PERSON
9. **Gebäudereinigung** (Building Cleaning) - PER_SQM
10. **Gartenpflege** (Garden Maintenance) - PER_SQM
11. **Beleuchtung** (Lighting) - PER_SQM
12. **Schornsteinreinigung** (Chimney Sweep) - PER_UNIT
13. **Versicherungen** (Insurance) - PER_SQM or MEA
14. **Hausmeister** (Caretaker) - PER_SQM
15. **Antenne/Kabel** (TV/Cable) - PER_UNIT
16. **Wascheinrichtungen** (Laundry Facilities) - PER_UNIT
17. **Sonstige** (Other) - Individual

---

## Berechnungslogik

### Ablauf:

1. **Erfassung Abrechnungszeitraum** (z.B. 01.01.2025 - 31.12.2025)
2. **Erfassung aller Kosten** nach Kategorien
3. **Zählerstände ablesen** (Heizung, Wasser, etc.)
4. **Vorauszahlungen summieren** pro Mieter
5. **Kosten verteilen** nach Verteilerschlüssel
6. **Mieteranteil berechnen**:
   - Aktive Monate im Zeitraum berücksichtigen
   - Leerstandszeiten abziehen
7. **Saldo berechnen**:
   - Vorauszahlung - tatsächliche Kosten
   - Positiv = Guthaben
   - Negativ = Nachzahlung

### Beispiel-Berechnung (Heizkosten):

```typescript
// § 7 HeizkostenV: Mind. 50% nach Verbrauch, Rest nach Fläche

const heatingCosts = 10000; // Gesamtkosten
const consumptionPart = heatingCosts * 0.7; // 70% nach Verbrauch
const areaPart = heatingCosts * 0.3; // 30% nach Fläche

// Verbrauchsanteil
const tenantConsumption = 1200; // kWh
const totalConsumption = 15000; // kWh
const tenantConsumptionShare = (tenantConsumption / totalConsumption) * consumptionPart;

// Flächenanteil
const tenantSqm = 65;
const totalSqm = 800;
const tenantAreaShare = (tenantSqm / totalSqm) * areaPart;

// Gesamt
const tenantHeatingCost = tenantConsumptionShare + tenantAreaShare;
```

---

## API-Struktur

### Accounting Periods
- `POST /api/accounting-periods` - Create period
- `GET /api/accounting-periods` - List periods
- `PUT /api/accounting-periods/:id/finalize` - Finalize period

### Cost Items
- `POST /api/accounting-periods/:id/costs` - Add cost
- `GET /api/accounting-periods/:id/costs` - List costs

### Meter Readings
- `POST /api/meters` - Create meter
- `POST /api/meters/:id/readings` - Add reading
- `GET /api/meters/:id/readings` - List readings

### Nebenkostenabrechnung
- `GET /api/nka/generate?tenantId=X&periodId=Y` - Generate statement
- `GET /api/nka/pdf?tenantId=X&periodId=Y` - Download PDF
- `GET /api/nka/excel?periodId=Y` - Export all for period

### Advance Payments
- `POST /api/advance-payments` - Record payment
- `GET /api/advance-payments?tenantId=X&periodId=Y` - Get totals

---

## DSGVO-Konformität

1. **Datensparsamkeit**: Nur erforderliche Daten speichern
2. **Löschpflicht**: Abrechnungen nach 10 Jahren automatisch löschen (§ 147 AO)
3. **Zugriffskontrolle**: Nur Vermieter sieht fremde Mieter-Daten
4. **Verschlüsselung**: Sensible Daten (Bank, Personalien) verschlüsselt
5. **Audit-Log**: Wer hat wann welche Abrechnung erstellt/geändert

---

## PDF-Struktur (Rechtssicher)

### Pflichtangaben:

1. **Kopfzeile**
   - "Betriebskostenabrechnung für [Jahr]"
   - Erstellt am [Datum]
   - Vermieter-Daten
   - Mieter-Daten
   - Objektadresse

2. **Abrechnungszeitraum**
   - Von - Bis
   - Aktive Monate des Mieters
   - Anpassungsfaktor bei Teil-Jahr

3. **Gesamtkosten Objekt**
   - Tabelle aller Kostenarten
   - Gesamtbetrag
   - Umlagefähig / Nicht umlagefähig

4. **Verteilerschlüssel**
   - Pro Kostenart: Welcher Schlüssel?
   - Werte (z.B. 65m² von 800m² = 8,125%)

5. **Mieteranteil**
   - Pro Kostenart: Berechnungsweg
   - Teilbeträge
   - Summe

6. **Vorauszahlungen**
   - Monatlich geleistet: [Betrag]
   - Monate: [Anzahl]
   - Gesamt: [Summe]

7. **Saldo**
   - Kosten: [Betrag]
   - Vorauszahlung: [Betrag]
   - **Nachzahlung** / **Guthaben**: [Betrag]

8. **Fußnote**
   - Widerspruchsfrist (12 Monate nach Zugang)
   - Rechtsgrundlage (§ 556 BGB, BetrKV)

---

## Skalierbarkeit

- **Multi-Mandantenfähigkeit**: Ein System für mehrere Vermieter
- **Bulk-Processing**: Alle Abrechnungen eines Objekts auf Knopfdruck
- **Template-System**: Individuelle Layouts pro Vermieter
- **API-Integration**: Anbindung an Buchhaltungssoftware (DATEV, Lexware)

---

## Nächste Schritte

1. Erweiterte Prisma-Schema implementieren
2. Kostenarten-Verwaltung UI
3. Verbrauchszähler-System
4. Vorauszahlungen-Tracking
5. Erweiterte Berechnungslogik
6. Rechtssicheres PDF-Template
7. Excel-Export
8. Massen-Abrechnung (alle Mieter eines Objekts)

---

**Status:** Wird jetzt implementiert 🔱
