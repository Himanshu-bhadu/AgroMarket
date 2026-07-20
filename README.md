<div align="center">

# 🌾 AgriMarket

### *Fresh from the farm, straight to you.*

**A full-stack agricultural SaaS marketplace connecting Indian farmers directly with buyers — built with Next.js, Prisma, Groq AI, and Razorpay.**

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-agro--market.vercel.app-16a34a?style=for-the-badge)](https://agro-market-xmbe-zeta.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)

</div>

---

## 📸 Preview

> **[👉 Visit the live app](https://agro-market-xmbe-zeta.vercel.app/)**

| Home | AI Kishan | Farmer Dashboard |
|------|-----------|------------------|
| Browse produce, equipment for sale & rent | Chat with an AI crop advisor | Manage listings, track orders & earnings |

---

## ✨ Features

### 🛒 Marketplace
- **Buy fresh produce** — vegetables, fruits, grains listed by verified farmers
- **Sell your harvest** — farmers can create product listings with images, prices, and stock counts
- **Equipment for sale** — buy tractors, cultivators, harvestors outright with direct farmer contact
- **Equipment rental** — rent farm machinery by the day or season at fixed daily rates (e.g. ₹2000/day for a tractor) — farmers set availability, buyers book and pay via Razorpay
- **SELL / RENT badges** — every listing is clearly tagged so buyers instantly know if it's a purchase or rental
- **Cart & Checkout** — persistent cart with quantity controls, GST calculation, and Razorpay payment integration
- **Product reviews** — star ratings and comments from verified buyers

### 🤖 AI Kishan (SaaS Feature)
- Powered by **Groq's LLaMA-3** via the Vercel AI SDK
- Answers farming questions in **Hindi & English**
- **Freemium model** — 3 free questions/month, unlimited with Pro subscription (₹99/mo)
- Real-time **streaming responses** with typing indicator
- Suggested prompts for new users

### 👨‍🌾 Farmer Dashboard
- Create, edit, and delete product listings
- **Order management** — view all orders received with buyer contact details
- Update delivery status per order item (Pending → Shipped → Delivered)
- Real-time stock tracking with automatic decrement on purchase

### 🔐 Authentication
- **Email + Password** login with bcrypt hashing
- **Google OAuth** via NextAuth.js
- Forgot password flow with secure email reset tokens (Nodemailer + Gmail)
- Role-based access control: `BUYER` | `FARMER` | `ADMIN`

### 🌍 Multilingual Support
- Language switcher using Google Translate — supports **Hindi, Punjabi, Marathi, Telugu, Tamil**
- Custom dropdown UI with cookie-based language persistence
- Auto-hides Google's banner strip for clean UI

### 🎨 UI/UX
- **Dark / Light mode** with `next-themes` and Tailwind CSS
- Fully **responsive** — mobile-first design
- Cart slide-out drawer with optimistic UI updates
- Smooth transitions and accessible components

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, TypeScript) |
| **Styling** | Tailwind CSS |
| **Database** | PostgreSQL (Neon) |
| **ORM** | Prisma |
| **Auth** | NextAuth.js (Credentials + Google OAuth) |
| **AI** | Groq API (LLaMA-3) via Vercel AI SDK |
| **Payments** | Razorpay (Orders API + Subscription) |
| **Email** | Nodemailer + Gmail SMTP |
| **Image Hosting** | Cloudinary / Next.js Image |
| **Deployment** | Vercel |

---

## 🗂️ Project Structure

```
agrohub/
├── app/
│   ├── ai-kishan/          # AI Kishan chat page
│   ├── api/
│   │   ├── auth/           # NextAuth routes
│   │   ├── cart/           # Cart CRUD (GET, POST, PUT, DELETE)
│   │   ├── chat/           # AI streaming route with paywall logic
│   │   ├── checkout/       # Order creation & Razorpay verification
│   │   ├── products/       # Product CRUD with farmer auth
│   │   ├── subscription/   # Pro upgrade flow
│   │   └── reviews/        # Product review submission
│   ├── checkout/           # Checkout page + subscription page
│   ├── dashboard/          # Farmer dashboard + order management
│   ├── product/[id]/       # Product detail page
│   ├── pricing/            # Pricing page (Free vs Pro)
│   └── ...
├── components/
│   ├── Navbar.tsx
│   ├── CartDrawer.tsx
│   ├── GoogleTranslate.tsx
│   ├── UpgradeModal.tsx
│   └── ...
├── prisma/
│   └── schema.prisma       # Full DB schema
└── ...
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (or [Neon](https://neon.tech) free tier)
- Groq API key ([console.groq.com](https://console.groq.com))
- Razorpay test keys ([razorpay.com](https://razorpay.com))
- Google OAuth credentials ([console.cloud.google.com](https://console.cloud.google.com))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Himanshu-bhadu/AgroMarket.git
cd AgroMarket

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in your keys (see below)

# 4. Push the Prisma schema to your database
npx prisma db push

# 5. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

### Environment Variables

Create a `.env.local` file with the following:

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Groq AI
GROQ_API_KEY="gsk_..."

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="your-razorpay-secret"

# Email (Gmail SMTP)
EMAIL_USER="your-gmail@gmail.com"
EMAIL_PASS="your-app-password"
```

---

## 💡 Key Technical Decisions

### 🔄 Real-time Cart with Optimistic UI
Cart updates reflect instantly in the UI before the server responds, making the experience feel native-app fast. If the server fails, the UI reverts automatically.

### 🔒 Secure Payment Verification
Razorpay payments are verified server-side using HMAC SHA-256 signature verification before any database changes are made — preventing payment spoofing.

### 🎯 SaaS Paywall Architecture
The AI chat route checks `isPro` and `aiQuestionsUsed` on every request. Free users are blocked at exactly 3 questions with a `403` response, triggering an upgrade modal on the frontend. Pro status is activated only after cryptographic payment verification.

### 🌐 Google Translate Integration
Rather than using Google's default dropdown (which injects a white banner bar and resets on navigation), a custom button drives translation by writing the `googtrans` cookie directly and reloading — the same mechanism Google uses internally, giving a clean UX with full translation fidelity.

---

## 🗺️ Roadmap

- [ ] Razorpay live mode integration
- [ ] Push notifications for new orders
- [ ] AI crop disease image diagnosis (photo upload)
- [ ] Seasonal planting calendar feature
- [ ] Admin panel for platform moderation
- [ ] Mobile app (React Native)

---

## 🧑‍💻 Author

**Himanshu Bhadu**
B.Tech — Electrical Engineering, Delhi Technological University

[![GitHub](https://img.shields.io/badge/GitHub-Himanshu--bhadu-181717?style=flat-square&logo=github)](https://github.com/Himanshu-bhadu)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Made with ❤️ for Indian farmers**

⭐ If you found this project useful, please give it a star!

</div>
