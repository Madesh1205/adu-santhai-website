# Ammal Farm Adu Santhai (ஆடு சந்தை)

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38bdf8.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database_%26_Auth-3ecf8e.svg)](https://supabase.com/)

**Ammal Farm Adu Santhai** is a modern, transparent livestock e-commerce platform that connects verified goat breeders with buyers and commercial farmers across Tamil Nadu. Built with zero middlemen, certified health protocols, and a **24-hour reservation hold system**.

---

## 🌟 Key Features

- **🌾 Live Goat Marketplace**:
  - Filter goats by breed (*Boer, Tellicherry, Sirohi, Kanni, Jamunapari, Salem Black, Kodi Aadu*), weight, age, gender, price range, and district.
  - Dominant price breakdown showing direct farm prices.
- **⏱️ 24-Hour Holding System**:
  - Reserve livestock for 24 hours to schedule farm visits or arrange transportation logistics without mandatory upfront fees.
  - Automatic expiration and state management.
- **🏡 Verified Breeder Directory**:
  - Dedicated farm profile pages displaying location, breeder contact numbers, and active livestock inventory.
  - One-tap Direct Call & WhatsApp messaging integration.
- **❤️ Wishlist & Bookmarks**:
  - Save livestock listings for comparison and quick access.
- **🔐 Secure Authentication**:
  - User sign-up, sign-in, and password recovery with verified account email checks.
- **📱 Mobile-First Responsive Design**:
  - Custom bottom action bar and touch-optimized navigation for field use on mobile devices.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS v4, Lucide React Icons
- **Backend & Database**: Supabase (PostgreSQL, Realtime, Row Level Security)
- **State & Router**: React Router v6, Context API
- **Deployment**: Compatible with Vite, Vercel, Netlify, Cloudflare Pages

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v18.x` or higher
- **npm** or **bun** / **yarn**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/adu-santhai-website.git
   cd adu-santhai-website
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory (refer to `.env.example`):
   ```env
   VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 📜 Available Scripts

- `npm run dev` – Starts Vite dev server on port 3000.
- `npm run build` – Builds production distribution bundle.
- `npm run preview` – Serves production build locally for testing.
- `npm run lint` – Runs TypeScript compiler check (`tsc --noEmit`).

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).

---

## ✉️ Contact & Support

**Ammal Farm Adu Santhai**  
Central Hub: Tamil Nadu, India  
Email: [ammalfarm@gmail.com](mailto:ammalfarm@gmail.com)
