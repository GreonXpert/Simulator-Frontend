# Zero Carbon — Net Reduction API

Reference for the `NET_REDUCTION` ingestion endpoints. Use these routes to push reduction project data (carbon credit measurements) into the platform.

---

## Base URL

```
http://localhost:5000/api/net-reduction
```

---

## Authentication

All requests must include the API key in the **`X-API-Key` header**.

| Ingestion Type | Key Type  | Header        |
|---------------|-----------|---------------|
| API ingestion | `NET_API` | `X-API-Key`   |
| IoT ingestion | `NET_IOT` | `X-API-Key`   |

> **Do not** send the key in the URL or as a Bearer token. The middleware checks `req.headers["x-api-key"]` only.

---

## Endpoints

### API Ingestion

```
POST /api/net-reduction/:clientId/:projectId/:calculationMethodology/api
```

### IoT Ingestion

```
POST /api/net-reduction/:clientId/:projectId/:calculationMethodology/iot
```

### URL Parameters

| Parameter               | Description                                                    | Example                        |
|------------------------|----------------------------------------------------------------|--------------------------------|
| `clientId`             | Client reference identifier                                     | `Greon001`                     |
| `projectId`            | Project identifier                                              | `Greon001-RED-Greon001-0001`   |
| `calculationMethodology` | Methodology key (see below)                                   | `methodology1`                 |

---

## Calculation Methodologies

| Key            | Name                        | Required Body Field |
|---------------|-----------------------------|---------------------|
| `methodology1` | Direct Value (ABD/APD rate) | `value`             |
| `methodology2` | Formula-based               | `variables`         |
| `methodology3` | Baseline / Project / Leakage items | `entry`      |

---

## Request Bodies

### Date & Time Format

| Field  | Format       | Example        |
|--------|-------------|----------------|
| `date` | `DD/MM/YYYY` | `12/06/2025`   |
| `time` | `HH:mm:ss`  | `10:30:00`     |

---

### Methodology 1 — Direct Value

Send a single numeric value representing the reduction amount for the given time window.

**API Ingestion Body:**

```json
{
  "date": "12/06/2025",
  "time": "10:30:00",
  "value": 150.5,
  "apiEndpoint": "https://my-sensor.io/readings"
}
```

**IoT Ingestion Body** — replace `apiEndpoint` with `deviceId`. Everything else is the same:

```json
{
  "date": "12/06/2025",
  "time": "10:30:00",
  "value": 150.5,
  "deviceId": "SOLAR-METER-01"
}
```

| Field         | Type     | Required | Notes                                    |
|--------------|----------|----------|------------------------------------------|
| `date`        | string   | Yes      | `DD/MM/YYYY` format                      |
| `time`        | string   | Yes      | `HH:mm:ss` format                        |
| `value`       | number   | Yes      | Reduction amount for the period          |
| `apiEndpoint` | string   | No       | Source URL — stored for audit trail (API only) |
| `deviceId`    | string   | Yes (IoT)| Physical device identifier (IoT only)   |

---

### Methodology 2 — Formula Variables

Send the variable values that the project's reduction formula will use to compute the final reduction amount.

**API Ingestion Body:**

```json
{
  "date": "12/06/2025",
  "variables": {
    "NCV": 44.0,
    "EF_CO2": 2.585,
    "OX": 0.99
  },
  "apiEndpoint": "https://my-sensor.io/readings"
}
```

**IoT Ingestion Body:**

```json
{
  "date": "12/06/2025",
  "variables": {
    "NCV": 44.0,
    "EF_CO2": 2.585,
    "OX": 0.99
  },
  "deviceId": "GAS-METER-07"
}
```

| Field       | Type   | Required | Notes                                              |
|------------|--------|----------|----------------------------------------------------|
| `date`      | string | Yes      | `DD/MM/YYYY` format                                |
| `variables` | object | Yes      | Keys must exactly match the formula variable names defined on the project |
| `apiEndpoint` / `deviceId` | string | API: optional / IoT: required | Source identifier |

---

### Methodology 3 — Baseline / Project / Leakage Items

Send measured values for each Baseline (B), Project (P), and Leakage (L) calculation item.

**API Ingestion Body:**

```json
{
  "date": "12/06/2025",
  "entry": {
    "B1": { "A": 500, "B": 300 },
    "B2": { "A": 200 },
    "P1": { "A": 100 },
    "P2": { "A": 50 },
    "L1": { "A": 20 },
    "L2": { "A": 10 }
  },
  "apiEndpoint": "https://my-sensor.io/readings"
}
```

**IoT Ingestion Body:**

```json
{
  "date": "12/06/2025",
  "entry": {
    "B1": { "A": 500 },
    "P1": { "A": 100 }
  },
  "deviceId": "FLOW-SENSOR-03"
}
```

| Field     | Type   | Required | Notes                                                          |
|----------|--------|----------|----------------------------------------------------------------|
| `date`    | string | Yes      | `DD/MM/YYYY` format                                            |
| `entry`   | object | Yes      | Outer keys are item IDs (`B1`, `P1`, `L1`, etc.). Inner keys are variable names (e.g. `A`, `B`) matching project config |
| `apiEndpoint` / `deviceId` | string | API: optional / IoT: required | Source identifier |

---

## Response Codes

| Status | Meaning                          | Action                                                        |
|--------|----------------------------------|---------------------------------------------------------------|
| `200`  | Data saved successfully          | Entry stored and included in calculations                     |
| `202`  | Anomaly detected — pending review | Entry intercepted (`"intercepted": true`). Held for `consultant_admin` approval before being applied |
| `400`  | Validation error                 | Check request body fields and date format                     |
| `401`  | Invalid or missing API key       | Verify the correct key type is used (`NET_API` vs `NET_IOT`). Wrong key type returns `No matching API key found for this endpoint` |
| `429`  | Rate limit exceeded              | Max 100 requests / minute per key. Back off and retry        |

### 202 Anomaly Response

A `202` is **not** an error. It means the system accepted the data but flagged it as statistically anomalous (e.g. value far outside the expected range). The entry is held in a pending state until a `consultant_admin` reviews and approves or rejects it.

Example 202 response body:

```json
{
  "intercepted": true,
  "message": "Anomaly detected. Entry held for consultant review."
}
```

---

## Rate Limits

- **100 requests per minute** per API key
- Applies independently to `NET_API` and `NET_IOT` keys
- Exceeding the limit returns `429 Too Many Requests`

---

## Simulator Quick Reference

| Field              | API Simulator               | IoT Simulator               |
|--------------------|-----------------------------|-----------------------------|
| Key type           | `NET_API`                   | `NET_IOT`                   |
| URL suffix         | `.../api`                   | `.../iot`                   |
| Source identifier  | `apiEndpoint` (optional)    | `deviceId` (required)       |
| Methodology 1      | `{ value, date, time }`     | `{ value, deviceId, date, time }` |
| Methodology 2      | `{ variables, date }`       | `{ variables, deviceId, date }` |
| Methodology 3      | `{ entry, date }`           | `{ entry, deviceId, date }` |
