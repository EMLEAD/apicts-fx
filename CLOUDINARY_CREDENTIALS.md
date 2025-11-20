# ☁️ Cloudinary Credentials Setup

## Required Credentials

To use Cloudinary for image uploads, you need to add these three environment variables to your `.env.local` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## How to Get Your Cloudinary Credentials

### Step 1: Sign Up for Cloudinary

1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Click **"Sign Up for Free"**
3. Create an account (Free tier is available with generous limits)

### Step 2: Access Your Dashboard

1. After signing up, you'll be redirected to your **Dashboard**
2. If not, go to [https://console.cloudinary.com](https://console.cloudinary.com)

### Step 3: Get Your Credentials

1. In your Dashboard, you'll see your **Account Details** section
2. Look for these three values:
   - **Cloud Name** - This is your unique cloud identifier
   - **API Key** - Your API key for authentication
   - **API Secret** - Your secret key (keep this secure!)

### Step 4: Add to `.env.local`

1. Open your `.env.local` file in the project root
2. Add the credentials:

```env
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

**Example:**
```env
CLOUDINARY_CLOUD_NAME=mycompany
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

### Step 5: Restart Your Server

After adding the credentials, restart your development server:

```bash
npm run dev
```

## Security Notes

⚠️ **Important:**
- Never commit your `.env.local` file to Git
- Never share your API Secret publicly
- The `.env.local` file is already in `.gitignore`
- If your API Secret is compromised, regenerate it in Cloudinary Dashboard

## Free Tier Limits

Cloudinary's free tier includes:
- ✅ 25 GB storage
- ✅ 25 GB monthly bandwidth
- ✅ 25,000 monthly transformations
- ✅ Unlimited uploads
- ✅ Image optimization
- ✅ Video support

## Testing Your Setup

After adding credentials, test the upload:

1. Go to `/admin/hero` in your admin dashboard
2. Click "Click to upload image"
3. Select an image file
4. The image should upload and appear in the carousel

If you see an error, check:
- Credentials are correct in `.env.local`
- Server has been restarted
- Cloudinary account is active

## Need Help?

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Cloudinary Dashboard](https://console.cloudinary.com)
- [Support](https://support.cloudinary.com)

---

**Your Cloudinary setup is ready once you add the credentials!** 🎉

