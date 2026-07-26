# Direct Payment & NIN Verification Implementation

## Overview

This document covers two features:

1. **NIN Verification Gate** — Users must have a verified NIN document before they can buy or sell.
2. **Direct Bank Transfer Payment** — An alternative to Paystack where users pay via bank transfer and upload proof of payment. Admin verifies manually and credits the wallet / activates the plan / processes the product order.

---

## Table of Contents

- [Part 1: NIN Verification](#part-1-nin-verification)
  - [How It Works](#how-it-works)
  - [Files Changed](#files-changed)
  - [User Flow](#user-flow)
- [Part 2: Direct Bank Transfer Payment](#part-2-direct-bank-transfer-payment)
  - [How It Works](#how-it-works-1)
  - [Admin Setup: Bank Account in Site Settings](#admin-setup-bank-account-in-site-settings)
  - [Files to Create / Modify](#files-to-create--modify)
  - [User Flow](#user-flow-1)
  - [Admin Flow](#admin-flow)
- [Database Changes](#database-changes)
- [API Endpoints](#api-endpoints)

---

## Part 1: NIN Verification

### How It Works

- A reusable utility (`lib/utils/ninVerification.js`) queries the `UserDocument` model for a document with `documentType: 'nin'` and `verificationStatus: 'verified'`.
- Both the **buy** (`/api/payments/purchase/initialize`) and **sell** (`/api/payments/sell/initialize`) API routes call `requireNinVerification(userId)` before processing. If the user's NIN is not verified, the request is rejected with a `403` and a descriptive error message.
- The `ExchangeTradeModal` frontend fetches `/api/user/verification-status` on open and:
  - Displays a red warning banner with context-aware messages (not uploaded / pending / rejected / expired).
  - Shows a button linking to `/dashboard/profile` where the user can upload their NIN.
  - Disables the submit button if NIN is not verified.

### Files Changed

| File | Change |
|------|--------|
| `src/lib/utils/ninVerification.js` | **New.** `checkNinVerification(userId)` and `requireNinVerification(userId)` helpers. |
| `src/app/api/user/verification-status/route.js` | **New.** `GET` endpoint returning `{ verified, status, hasSubmitted }`. |
| `src/app/api/payments/purchase/initialize/route.js` | Added `requireNinVerification()` check after auth. Returns 403 if not verified. |
| `src/app/api/payments/sell/initialize/route.js` | Same check added. |
| `src/Components/ExchangeTradeModal.js` | Added `ninStatus` state, fetch on open, warning banner, submit button disabled. |

### User Flow

1. User clicks "Buy" or "Sell" on a product.
2. Modal opens and fetches `/api/user/verification-status`.
3. If NIN is **not verified**:
   - Red banner appears: "NIN Verification Required"
   - Sub-message depends on status:
     - **no_document**: "You need to upload and verify your NIN..."
     - **pending_review**: "Your NIN document is currently under review..."
     - **rejected**: "Your NIN verification was rejected..."
     - **expired**: "Your NIN verification has expired..."
   - Button: "Upload NIN Now" or "Re-upload NIN" → opens `/dashboard/profile` in new tab.
   - Submit button is **disabled** (grayed out).
4. If NIN is **verified**: form works normally.

---

## Part 2: Direct Bank Transfer Payment

### How It Works

This adds a **second payment option** (alongside Paystack) for three flows:

| Flow | What Happens on Verify |
|------|----------------------|
| **Wallet Funding** | User's `walletBalance` is credited with the transfer amount. |
| **Plan Payment** | `UserPlan` is activated + wallet is credited (same as Paystack flow). |
| **Product Purchase** | Transaction is created as pending; admin fulfills the order manually. |

The bank account details displayed to users come from **Site Settings** (managed by admin).

### Admin Setup: Bank Account in Site Settings

The admin adds a bank account in the existing Site Settings admin page. A new `bankAccount` field is added to the `SiteSettings` model.

**Admin page updates (`admin/site-settings/page.js`):**

Add a "Bank Account" section to the settings form with these fields:

```
Bank Name        (text input)
Account Number   (text input)
Account Name     (text input)
Bank Logo        (image upload, optional)
```

**SiteSettings model update (`lib/db/models/SiteSettings.js`):**

Add a new field:

```js
bankAccount: {
  type: DataTypes.JSON,
  allowNull: true,
  defaultValue: {
    bankName: '',
    accountNumber: '',
    accountName: '',
    bankLogo: ''
  },
  comment: 'Bank account details for direct transfers'
}
```

**Public API (`/api/site-settings`)** already returns all SiteSettings fields, so the `bankAccount` object will be available to the frontend automatically.

---

### Files to Create / Modify

#### New Files

| File | Purpose |
|------|---------|
| `src/app/api/payments/direct-transfer/initialize/route.js` | Creates a pending "direct_transfer" transaction when user submits proof of payment. |
| `src/app/api/admin/direct-transfers/route.js` | Admin GET: lists all pending direct transfers. |
| `src/app/api/admin/direct-transfers/[id]/route.js` | Admin PATCH: approve (credit wallet / activate plan / mark product order) or reject a transfer. |
| `src/app/api/upload/proof-of-payment/route.js` | Uploads proof of payment image to Cloudinary. |

#### Modified Files

| File | Change |
|------|--------|
| `src/lib/db/models/SiteSettings.js` | Add `bankAccount` JSON field. |
| `src/lib/db/models/Transaction.js` | Add `'direct_transfer'` to `type` ENUM (via migration). |
| `src/app/dashboard/wallet/page.js` | Add "Bank Transfer" option in the deposit form. |
| `src/app/dashboard/subscription/page.js` | Add "Bank Transfer" option when subscribing to a plan. |
| `src/Components/ExchangeTradeModal.js` | Add "Bank Transfer" option in the buy flow. |
| `src/app/admin/site-settings/page.js` | Add bank account fields to the settings form. |

---

### User Flow

#### Wallet Funding via Bank Transfer

1. User goes to **Dashboard → Wallet**.
2. In the deposit section, they see two options: **"Pay with Card"** (Paystack) and **"Bank Transfer"**.
3. User selects **"Bank Transfer"**:
   - The platform's bank account details are displayed (fetched from `/api/site-settings`):
     ```
     Bank Name:     GTBank
     Account Number: 0123456789
     Account Name:   APICTS Limited
     ```
   - User enters the **amount** they are transferring.
   - User uploads a **proof of payment image** (screenshot of the transfer confirmation).
   - User clicks **"Submit Proof of Payment"**.
4. Backend creates a `Transaction` record:
   - `type: 'deposit'`
   - `status: 'pending'`
   - `metadata: { paymentMethod: 'direct_transfer', proofOfPayment: '<image_url>' }`
5. User sees a success message: "Your proof of payment has been submitted. The admin will verify and credit your wallet shortly."

#### Plan Payment via Bank Transfer

1. User goes to **Dashboard → Subscription**.
2. They see plans with a "Subscribe Now" button. Next to it or below, a **"Pay via Bank Transfer"** link/button.
3. Clicking it shows:
   - The bank account details.
   - A form to upload proof of payment.
   - The plan details and amount to transfer.
4. User uploads proof and submits.
5. Backend creates a `Transaction`:
   - `type: 'deposit'`
   - `status: 'pending'`
   - `metadata: { paymentMethod: 'direct_transfer', subscriptionPayment: true, planId, planName, proofOfPayment: '<image_url>' }`
6. User sees: "Proof submitted. Your subscription will be activated once payment is verified."

#### Buying Products via Bank Transfer

1. User clicks **"Buy"** on a product in the `ExchangeTradeModal`.
2. Under **Payment Method**, they now see three options:
   - Wallet Balance
   - Debit/Card (Paystack)
   - **Bank Transfer**
3. User selects **"Bank Transfer"**:
   - Bank account details are displayed.
   - User enters the amount, destination wallet address, and uploads proof of payment.
   - User clicks **"Submit"**.
4. Backend creates a `Transaction`:
   - `type: 'exchange'`
   - `status: 'pending'`
   - `metadata: { paymentMethod: 'direct_transfer', transactionType: 'product_buy', walletId, proofOfPayment, quantity, productName, productId }`
5. User sees: "Proof submitted. Your order will be processed once payment is verified."

---

### Admin Flow

1. Admin goes to **Admin → Transactions** (or a new "Direct Transfers" section).
2. A filter tab or badge shows **"Pending Transfers"** with a count.
3. Each pending direct transfer shows:
   - User name and email
   - Amount and type (wallet funding / plan payment / product purchase)
   - **Proof of payment image** (clickable to view full size)
   - Bank account it was transferred to
   - Date submitted
4. Admin clicks **"Approve"** or **"Reject"**:

#### On Approve

The admin action depends on the transaction type:

| Transaction Type | Admin Action |
|-----------------|-------------|
| `deposit` (wallet funding) | Credit `user.walletBalance += transaction.amount`. Set `status: 'completed'`. |
| `deposit` (plan payment, `metadata.subscriptionPayment === true`) | Credit `user.walletBalance += amount`. Create/update `UserPlan` with `status: 'active'`. Handle referral commission. Set `status: 'completed'`. |
| `exchange` (product purchase) | Set `status: 'completed'`. Admin then fulfills the order manually (sends product to the `walletId` address). |

#### On Reject

- Set `status: 'cancelled'`.
- Store `metadata.rejectionReason` with admin's reason.
- (Optional) Send email notification to user.

---

### API Endpoints

#### `POST /api/payments/direct-transfer/initialize`

**Auth:** Required (JWT)

**Body:**
```json
{
  "amount": 50000,
  "purpose": "wallet_funding",
  "proofOfPayment": "https://cloudinary.com/proof.jpg",
  "planId": "optional-for-plan-payment",
  "productId": "optional-for-product-purchase",
  "walletId": "optional-for-product-purchase",
  "quantity": "optional-for-product-purchase"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Proof of payment submitted. Awaiting admin verification.",
  "transaction": { ... }
}
```

**Behavior:**
- Creates a `Transaction` with `status: 'pending'`.
- Stores `proofOfPayment` URL in `metadata`.
- Sets `metadata.paymentMethod: 'direct_transfer'`.
- If `purpose === 'plan_payment'`: stores `planId`, `planName` in metadata.
- If `purpose === 'product_purchase'`: stores `productId`, `productName`, `walletId`, `quantity` in metadata.

#### `GET /api/admin/direct-transfers`

**Auth:** Required (admin role)

**Query params:** `?status=pending&limit=50&offset=0`

**Response (200):**
```json
{
  "transactions": [ ... ],
  "total": 12
}
```

#### `PATCH /api/admin/direct-transfers/[id]`

**Auth:** Required (admin role)

**Body:**
```json
{
  "action": "approve",
  "rejectionReason": "optional-if-rejecting"
}
```

**On approve:**
- For wallet funding: credits `user.walletBalance`.
- For plan payment: credits wallet + creates `UserPlan`.
- For product purchase: marks as completed (admin fulfills manually).
- Sets `status: 'completed'`.

**On reject:**
- Sets `status: 'cancelled'`.
- Stores `metadata.rejectionReason`.

#### `POST /api/upload/proof-of-payment`

**Auth:** Required (JWT)

**Body:** `multipart/form-data` with `image` field.

**Response (200):**
```json
{
  "url": "https://res.cloudinary.com/.../proof.jpg"
}
```

---

## Database Changes

### Migration: Add `bankAccount` to SiteSettings

```js
// src/lib/db/migrations/add-bank-account-to-site-settings.js
const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addColumn('site_settings', 'bankAccount', {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        bankName: '',
        accountNumber: '',
        accountName: '',
        bankLogo: ''
      }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('site_settings', 'bankAccount');
  }
};
```

### Migration: Add `direct_transfer` to Transaction type ENUM

```js
// src/lib/db/migrations/add-direct-transfer-transaction-type.js
module.exports = {
  up: async (queryInterface) => {
    // Sequelize ENUM migrations vary by dialect.
    // For PostgreSQL:
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_transactions_type" ADD VALUE IF NOT EXISTS 'direct_transfer';`
    );
    // For MySQL/SQLite, you may need to recreate the column or table.
  },
  down: async () => {}
};
```

---

## Implementation Steps (Ordered)

### Phase 1: NIN Verification Gate (Done)

- [x] Create `src/lib/utils/ninVerification.js`
- [x] Create `src/app/api/user/verification-status/route.js`
- [x] Add NIN check to `purchase/initialize/route.js`
- [x] Add NIN check to `sell/initialize/route.js`
- [x] Add NIN status UI in `ExchangeTradeModal.js`

### Phase 2: Site Settings — Bank Account

- [ ] Add `bankAccount` JSON field to `SiteSettings` model
- [ ] Create DB migration for the new field
- [ ] Add bank account form fields to admin site settings page
- [ ] Verify `/api/site-settings` returns `bankAccount` in public response

### Phase 3: Proof of Payment Upload

- [ ] Create `src/app/api/upload/proof-of-payment/route.js`
- [ ] Reuse existing Cloudinary upload pattern from `upload/document-image`

### Phase 4: Direct Transfer API

- [ ] Create `src/app/api/payments/direct-transfer/initialize/route.js`
- [ ] Create migration to add `direct_transfer` to Transaction type ENUM
- [ ] Update `Transaction` model ENUM if doing it via code (not migration)

### Phase 5: Wallet Funding — Bank Transfer Option

- [ ] Update `dashboard/wallet/page.js` to add "Bank Transfer" option
- [ ] Fetch bank account details from `/api/site-settings`
- [ ] Add proof of payment upload form
- [ ] Submit to `/api/payments/direct-transfer/initialize` with `purpose: 'wallet_funding'`

### Phase 6: Plan Payment — Bank Transfer Option

- [ ] Update `dashboard/subscription/page.js` to add "Bank Transfer" option
- [ ] Show bank account details and proof of payment upload
- [ ] Submit to `/api/payments/direct-transfer/initialize` with `purpose: 'plan_payment'` and `planId`

### Phase 7: Product Purchase — Bank Transfer Option

- [ ] Update `ExchangeTradeModal.js` to add "Bank Transfer" as a third payment method
- [ ] Show bank account details and proof of payment upload in the modal
- [ ] Submit to `/api/payments/direct-transfer/initialize` with `purpose: 'product_purchase'`

### Phase 8: Admin Verification

- [ ] Create `src/app/api/admin/direct-transfers/route.js` (list pending)
- [ ] Create `src/app/api/admin/direct-transfers/[id]/route.js` (approve/reject)
- [ ] Add "Direct Transfers" section or filter to admin transactions page
- [ ] Display proof of payment image in admin review UI
- [ ] Implement approve logic (credit wallet / activate plan / mark completed)
- [ ] Implement reject logic (cancel + store reason)

### Phase 9: Notifications

- [ ] Send email to user when transfer is approved
- [ ] Send email to user when transfer is rejected (with reason)
- [ ] (Optional) Send Telegram notification if user has linked account

---

## Key Design Decisions

1. **Bank account details are in SiteSettings, not hardcoded** — Admin can change the receiving account at any time without code changes.

2. **Proof of payment is an image upload, not a reference number** — Screenshots are harder to fake and provide visual proof for admin review.

3. **Transactions start as `pending`** — Same status as Paystack payments, so existing admin UI and transaction history work without changes.

4. **Plan payment via bank transfer credits the wallet AND activates the plan** — Matches the Paystack flow where subscription payments are treated as deposits that also grant plan access.

5. **Product purchases via bank transfer stay `pending` until admin fulfills** — Admin must manually send the product to the user's wallet address, same as Paystack product orders.

6. **Rejection stores a reason** — Admin can explain why a proof of payment was rejected, which can be shown to the user.
