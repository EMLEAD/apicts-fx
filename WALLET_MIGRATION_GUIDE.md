# Wallet Balance Migration

## ✅ Migration Completed

The wallet balance and currency columns have been successfully added to the `users` table.

### Columns Added

1. **walletBalance** - DECIMAL(15, 2) DEFAULT 0
   - Stores user's wallet balance
   - Default value: 0.00
   - Cannot be null

2. **currency** - VARCHAR(10) DEFAULT 'NGN'
   - Stores the user's currency preference
   - Default value: 'NGN' (Nigerian Naira)
   - Cannot be null

## Migration Status

✅ **Migration completed successfully!**

The columns have been added to your database. You can now:
- View wallet balances in the admin users table
- Update wallet balances via the admin dashboard
- Manage user funds (add, subtract, set balance)

## Features Available

### Admin User Management (`/admin/users`)
1. **View Wallet Balance** - See each user's balance in the table
2. **User Details Modal** - Click the eye icon to see full user details including wallet balance
3. **Update Wallet** - Click "Update Balance" to:
   - Add funds to user account
   - Deduct funds from user account
   - Set a specific balance

### API Endpoints

**GET `/api/admin/users/[id]/wallet`**
- Fetch user's wallet balance

**PATCH `/api/admin/users/[id]/wallet`**
- Update wallet balance
- Body: `{ amount: number, action: 'add' | 'subtract' | 'set' }`

## Future Enhancements

- Transaction history for wallet changes
- Multi-currency support
- Wallet to wallet transfers
- Payment gateway integration
- Automated wallet updates based on transactions

## Running the Migration

If you need to run the migration again:

```bash
npm run db:migrate
```

Or directly:

```bash
node add-wallet-migration.js
```

## Database Schema

The updated `users` table now includes:

```sql
walletBalance DECIMAL(15, 2) DEFAULT 0 NOT NULL
currency VARCHAR(10) DEFAULT 'NGN' NOT NULL
```

All existing users have been automatically set with:
- walletBalance: 0.00
- currency: 'NGN'

## Notes

- The migration is idempotent (safe to run multiple times)
- It checks if columns exist before adding them
- Existing data is preserved
- New users will automatically have wallet fields with default values

