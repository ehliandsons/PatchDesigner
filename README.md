# PatchDesigner – Vercel Edition  
### Designed & Developed by **Andrew Ehli**

PatchDesigner is a custom patch‑building platform for Shopify.  
It includes:

- A storefront Patch Previewer (Shopify Theme App Block)
- A full Admin Dashboard hosted on Vercel
- OAuth authentication with Shopify
- Order loading with Patch Config JSON
- A built‑in patch designer for production adjustments

---

## 📁 Project Structure

patchdesigner/
│
├── admin/                     # Admin Dashboard (HTML/JS/CSS)
│   ├── index.html
│   ├── styles.css
│   ├── admin.js
│   ├── designer/
│   │   ├── designer.html
│   │   ├── designer.js
│   │   ├── designer.css
│   │   └── assets/
│   │       ├── fonts/
│   │       ├── icons/
│   │       └── images/
│   └── components/
│       ├── orders.js
│       ├── ui.js
│       └── utils.js
│
├── api/                       # Vercel Serverless Functions
│   ├── auth-shopify.js
│   ├── auth-callback.js
│   ├── session.js
│   └── orders-with-config.js
│
├── extensions/                # Shopify Theme App Extension
│   └── patch-hat-previewer-block/
│       ├── blocks/
│       │   ├── patch-previewer.liquid
│       │   └── patchdesigner-embed.liquid
│       ├── assets/
│       │   ├── previewer.js
│       │   ├── previewer.css
│       │   └── fonts/
│       ├── locales/
│       │   ├── en.default.json
│       │   └── en.schema.json
│       └── extension.config.yml
│
├── public/                    # Static assets
│   ├── favicon.ico
│   ├── logo.png
│   ├── preview.png
│   └── robots.txt
│
├── .env.local                 # Environment variables (not committed)
├── .gitignore
├── package.json
├── vercel.json
└── README.md

---

## 🚀 Deployment

1. Import repo into Vercel  
2. Add environment variables  
3. Deploy  
4. Update Shopify OAuth URLs  
5. Enable App Embed in Shopify  

---

## 🧑‍💻 Author

**Andrew Ehli**  
Forge Street Creations  
“Father & Son. Laser Forged.”

