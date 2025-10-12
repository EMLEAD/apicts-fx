# 📸 Image Guide for APICTS Exchange

## Required Images to Add

Place all images in the `public/images/` directory. Here's what you need:

---

## 🎯 Hero Section

### `hero-exchange.jpg`
- **Dimensions**: 800x600px (4:3 ratio)
- **Description**: Main hero image showing currency exchange, mobile app, or happy customers
- **Style**: Professional, modern, vibrant
- **Suggestions**:
  - Currency symbols (₦, $, €, £)
  - Person using mobile app for exchange
  - Multiple currency notes
  - Global network/connections

---

## 🛠️ Services Section (6 images)

### 1. `fiat-currency.jpg`
- **Dimensions**: 600x400px
- **Description**: Fiat currency notes (Naira, Dollar, Euro, Pound)
- **Theme**: Blue tones

### 2. `crypto-trading.jpg`
- **Dimensions**: 600x400px
- **Description**: Bitcoin, Ethereum coins or cryptocurrency trading chart
- **Theme**: Green/Gold tones

### 3. `e-currency.jpg`
- **Dimensions**: 600x400px
- **Description**: Digital payment, online wallet, credit cards
- **Theme**: Red/Rose tones

### 4. `international-transfer.jpg`
- **Dimensions**: 600x400px
- **Description**: Globe, world map, international money transfer
- **Theme**: Blue/Indigo tones

### 5. `secure-transactions.jpg`
- **Dimensions**: 600x400px
- **Description**: Lock, shield, security symbols, fingerprint
- **Theme**: Green/Teal tones

### 6. `instant-processing.jpg`
- **Dimensions**: 600x400px
- **Description**: Lightning bolt, speed, fast transaction
- **Theme**: Rose/Pink tones

---

## 📝 Blog Section (6 images)

### 1. `blog-1.jpg`
- **Title**: Understanding Currency Exchange
- **Dimensions**: 600x400px
- **Description**: Education/tutorial theme, charts, learning
- **Theme**: Professional, educational

### 2. `blog-2.jpg`
- **Title**: Cryptocurrency Trading in Nigeria
- **Dimensions**: 600x400px
- **Description**: Bitcoin, cryptocurrency, Nigerian theme
- **Theme**: Modern, tech-focused

### 3. `blog-3.jpg`
- **Title**: NIN Verification
- **Dimensions**: 600x400px
- **Description**: Security, verification, ID card
- **Theme**: Trust, security

### 4. `blog-4.jpg`
- **Title**: E-Currency Exchange
- **Dimensions**: 600x400px
- **Description**: Perfect Money, PayPal logos, e-wallets
- **Theme**: Digital, modern

### 5. `blog-5.jpg`
- **Title**: International Money Transfer
- **Dimensions**: 600x400px
- **Description**: World map, international flags, transfer
- **Theme**: Global, connected

### 6. `blog-6.jpg`
- **Title**: Market Analysis
- **Dimensions**: 600x400px
- **Description**: Charts, graphs, market trends
- **Theme**: Professional, analytical

---

## 📁 Directory Structure

```
public/
└── images/
    ├── hero-exchange.jpg
    ├── fiat-currency.jpg
    ├── crypto-trading.jpg
    ├── e-currency.jpg
    ├── international-transfer.jpg
    ├── secure-transactions.jpg
    ├── instant-processing.jpg
    ├── blog-1.jpg
    ├── blog-2.jpg
    ├── blog-3.jpg
    ├── blog-4.jpg
    ├── blog-5.jpg
    └── blog-6.jpg
```

---

## 🎨 Image Requirements

### General Guidelines:
- **Format**: JPG or PNG (JPG preferred for photos)
- **Quality**: High resolution, optimized for web
- **File Size**: Keep under 500KB per image
- **Aspect Ratios**:
  - Hero: 4:3 (800x600px)
  - Services: 3:2 (600x400px)
  - Blog: 3:2 (600x400px)

### Color Palette:
Match your site colors:
- 🔵 Blue: #2563EB
- 🟢 Green: #10B981
- 🔴 Red: #F43F5E

---

## 🖼️ Where to Find Free Images

### Recommended Sources:
1. **Unsplash** (unsplash.com) - High-quality free photos
2. **Pexels** (pexels.com) - Free stock photos
3. **Freepik** (freepik.com) - Vectors and photos (free with attribution)
4. **Pixabay** (pixabay.com) - Free images and videos

### Search Keywords:
- "currency exchange"
- "cryptocurrency trading"
- "mobile banking"
- "digital payment"
- "financial technology"
- "money transfer"
- "secure transaction"
- "bitcoin ethereum"
- "naira dollar exchange"

---

## 🚀 How to Add Images

1. **Create the images folder:**
   ```bash
   mkdir public/images
   ```

2. **Add your images:**
   - Download/save images to `public/images/`
   - Name them exactly as specified above

3. **Images will automatically work** - Next.js Image component will optimize them!

---

## ✨ Optimization Tips

Next.js automatically optimizes images, but you can help:

1. **Compress before uploading**:
   - Use TinyPNG (tinypng.com)
   - Or ImageOptim (imageoptim.com)

2. **Correct dimensions**:
   - Resize to recommended sizes
   - Don't upload 4K images if you only need 600px

3. **WebP format** (optional):
   - Convert to WebP for even better compression
   - Next.js will serve the best format automatically

---

## 🎯 Current Status

Components using images:
- ✅ **Hero** - hero-exchange.jpg
- ✅ **Services** - 6 service images
- ✅ **Blog** - 6 blog post images

All components are ready and will display placeholder gradients until you add actual images.

---

## 📝 Testing

After adding images:

1. Start dev server: `npm run dev`
2. Visit: http://localhost:3000
3. Check console for any image loading errors
4. Verify images display correctly on mobile and desktop

---

## 💡 Pro Tips

1. **Use consistent style** - All images should match your brand
2. **Optimize for mobile** - Images should look good on small screens
3. **Alt text** - Already included in components for SEO
4. **Loading** - Next.js Image component lazy-loads automatically
5. **Responsive** - Images scale automatically

---

**Once you add the images, your homepage will be complete and production-ready!** 🎉

