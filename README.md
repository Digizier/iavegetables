# 🥦 I.A Vegetables Supplier — Karachi

> **Serving Fresh Produce Across Karachi Since 1990**  
> Direct from Mandi wholesale & retail vegetables delivered straight to your kitchen with same-day delivery.

---

## 🌟 Features

- **Farm-Fresh Daily Harvest**: 55+ authentic Pakistani vegetables with authentic Urdu translations, botanical categorisation, and Karachi Mandi rates.
- **Dynamic Weight Selection**: Preset chips (0.25kg, 0.5kg, 1kg, 2kg, 5kg, etc.) and custom weight input with live pricing.
- **Performance Optimized**:
  - Homepage shows 12 latest produce items in clean 3-row grid.
  - Shop and category pages support 12-item numbered pagination with smooth auto-scroll.
- **Admin Management Panel**:
  - Live Supabase PostgreSQL database sync.
  - Product manager with Urdu name, pricing, stock, multiple WebP image gallery, and full **"About this vegetable"** description editing.
  - Category manager with custom emoji support and auto-slug generation.
  - Order management with customer details, order status tracking, and A4 print/PDF invoice generation.
  - Coupon discount engine with cart-to-checkout persistence.
  - Shop settings (address, WhatsApp, NTN # 4260196-7, delivery fees, coordinates).
- **Checkout & Ordering**:
  - Direct COD (Cash on Delivery), JazzCash, and EasyPaisa options.
  - 1-Click WhatsApp direct ordering.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router, Static Export output: 'export')
- **UI & Styling**: React 19, Tailwind CSS, Lucide React
- **Database**: Supabase (PostgreSQL)
- **Deployment Target**: Cloudflare Pages

---

## ☁️ Cloudflare Pages Deployment Guide

This project is pre-configured with output: 'export' and distDir: 'dist' in 
ext.config.mjs, making it 100% compatible with Cloudflare Pages static hosting.

### Cloudflare Pages Settings:

| Setting | Value |
| :--- | :--- |
| **Framework preset** | None / Next.js (Static HTML Export) |
| **Build command** | un run build (or 
pm run build) |
| **Build output directory** | dist |
| **Root directory** | / (leave default) |

### Environment Variables (Optional):
Under **Settings > Environment variables** in Cloudflare Pages:
- NODE_VERSION: 22 (or 20)

---

## 💻 Local Development

`ash
# Install dependencies
bun install

# Start development server
bun dev

# Production build test
bun run build
`

The static files will be compiled into the ./dist directory.

---

## 📄 License
Private commercial software for I.A Vegetables Supplier Karachi.
