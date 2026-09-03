# Prembly KYC Verification Integration Guide

Integrate [Prembly](https://prembly.com) (formerly IdentityPass) for automatic verification of NIN, Driver's License, and Voter's Card.

## Overview

When a user submits a document, the system calls Prembly's API:

- **Valid document** → auto-set to `verified` with `verificationMethod: 'api'`
- **Data mismatch** → auto-set to `rejected` with reason
- **API error** (network/timeout) → stays `pending` for manual admin review

## Files Implemented

### New Files

| File | Purpose |
|------|---------|
| `src/lib/prembly/client.js` | Prembly API client — `lookupNIN()`, `lookupDriverLicense()`, `lookupVotersID()` |
| `src/lib/prembly/verification.js` | Verification logic — calls the right API, normalises response, returns `{ verified, reason, apiResponse, extractedData }` |

### Modified Files

| File | Change |
|------|--------|
| `env.example` | Added `PREMBLY_API_KEY`, `PREMBLY_BASE_URL` |
| `src/app/dashboard/profile/page.js` | Added `documentNumber` input field to document submission form |
| `src/app/api/user/documents/route.js` | Auto-verifies with Prembly on POST; `documentNumber` is now required |
| `src/app/api/admin/user-documents/[id]/route.js` | Added `verifyWithApi: true` flag support for admin-initiated API verification |

## Prembly API Endpoints

| Document | Endpoint | Body | Sandbox Test Value |
|---|---|---|---|
| NIN | `POST /verification/vnin-basic` | `{ "number": "nin" }` | `56182742701` |
| Driver's License | `POST /verification/drivers_license/advance/v2` | `{ "number", "first_name", "last_name" }` | `ABC12345YZ00` |
| Voter's Card | `POST /verification/voters_card` | `{ "number": "vin" }` | `90F5B1103A295500632` |

**Auth**: `x-api-key` header with your secret key

**Base URL**: `https://api.prembly.com`

### NIN Response (relevant fields)
```
data.firstname, data.surname, data.middlename
data.birthdate, data.gender
data.telephoneno, data.photo, data.nin
verification.status = "VERIFIED"
```

### Driver's License Response
```
frsc_data.firstname, frsc_data.lastname
frsc_data.birthdate, frsc_data.photo
frsc_data.driversLicense
verification.status = "VERIFIED"
```

### Voter's Card Response
```
data.fullName, data.gender
data.state, data.lga, data.vin
data.date_of_birth
verification.status = "VERIFIED"
```

## Setup

1. Create an account at https://app.prembly.com
2. Go to **API Library → API Keys** to get your keys
3. Prembly provides **two** keys:
   - **Secret (private) key** — used server-side, sent as the `x-api-key` header. This is the only key the server needs.
   - **Public key** — used only by client-side Prembly SDK widgets (e.g. `prembly-react-kyc`), never for server API calls.
4. Add to `.env.local`:

```env
PREMBLY_API_KEY=your_prembly_secret_key
PREMBLY_PUBLIC_KEY=your_prembly_public_key   # optional, only if using the client-side SDK
PREMBLY_BASE_URL=https://api.prembly.com
```

### Test vs. Live

- **Sandbox (test)**: toggle the Sandbox/Live switch in API Keys and copy the **sandbox secret key** (`test_sk_...`). Sandbox calls are free and only work with Prembly's test data (e.g. NIN `56182742701`).
- **Live**: copy the **live secret key** (`sk_...`). Live calls require a funded wallet (each NIN basic check costs ₦50).
- Wallet funding is only required for live calls, not sandbox.

## Auto-Verification Flow

1. User fills in document type, document number, and uploads images
2. `POST /api/user/documents` creates the document (status: `pending`)
3. If document type is `nin`, `drivers_license`, or `voters_card`, the API is called
4. On success → document updated to `verified` with data from Prembly
5. On API failure → document stays `pending` (manual review)

## Admin API Verification

Send `PATCH /api/admin/user-documents/[id]` with:

```json
{
  "verifyWithApi": true
}
```

Only works if the document has a `documentNumber`. Returns the API result or an error.

## Testing

Add the env vars to `.env.local` with your sandbox credentials, then submit a document with:
- **NIN**: `56182742701`
- **Driver's License**: `ABC12345YZ00`
- **Voter's ID**: `90F5B1103A295500632`

## Production Checklist

- [ ] Fund Prembly wallet (pay-per-request)
- [ ] Test with real credentials first
- [ ] Monitor API usage in Prembly dashboard
