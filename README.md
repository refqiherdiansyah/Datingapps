# 💕 Dating Planner

Full-stack romantic date planning app built with **Next.js 14 · Supabase · TailwindCSS · Vercel**.

![Dating Planner](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs) ![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase) ![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss)

---

## ✨ Features (18 Total)

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Daily Date Suggestion** | Mood-based activity recommendations |
| 2 | **Restaurant Finder** | Browse & filter restaurants with Maps link |
| 3 | **Movie & Event Finder** | TMDb integration + local events |
| 4 | **Mini Games** | Truth or Dare, Quiz, Spin Wheel |
| 5 | **Custom Planner** | Full CRUD date itinerary |
| 6 | **Mood-based Suggestions** | Romantic, Santai, Adventurous, Fun, Cozy |
| 7 | **Memory Scrapbook** | Upload photos with captions (Supabase Storage) |
| 8 | **Surprise Generator** | Random romantic ideas |
| 9 | **Budget Tracker** | CRUD expenses with category breakdown |
| 10 | **Compatibility Game** | Fun quiz to test how well you know each other |
| 11 | **Love Calendar** | Anniversary, birthday & date reminders |
| 12 | **Gift Ideas Generator** | Filter by occasion & budget |
| 13 | **Couple Challenges** | Daily/weekly challenge CRUD |
| 14 | **Secret Notes** | Notes with time-locked unlock |
| 15 | **Playlist Builder** | Spotify & YouTube mood playlists |
| 16 | **Weather & Outfit** | OpenWeather + outfit suggestions |
| 17 | **Couple Progress Tracker** | Stat counters (dates, movies, etc.) |
| 18 | **WhatsApp Integration** | Deep-link share to partner's WA |

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/dating-planner.git
cd dating-planner
npm install
```

### 2. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste and run `supabase/schema.sql`
3. Go to **Storage** → the schema creates the `photos` bucket automatically
4. Go to **Settings → API** → copy your URL and anon key

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional but recommended
NEXT_PUBLIC_TMDB_API_KEY=          # https://www.themoviedb.org/settings/api
NEXT_PUBLIC_OPENWEATHER_API_KEY=   # https://openweathermap.org/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=   # https://console.cloud.google.com

# WhatsApp numbers (international format, no +)
NEXT_PUBLIC_MY_WHATSAPP=6281385576828
NEXT_PUBLIC_PARTNER_WHATSAPP=6285282568462
```

> **Note:** The app works without API keys — it uses mock/fallback data for TMDb, OpenWeather, and restaurant listings.

### 4. Run Locally

```bash
npm run dev
# Open http://localhost:3000
```

---

## 📦 Deploy to Vercel

### Option A — Vercel CLI

```bash
npm install -g vercel
vercel
# Follow prompts, add env vars when asked
```

### Option B — GitHub → Vercel (Recommended)

1. Push to GitHub:
```bash
git init
git add .
git commit -m "feat: initial dating planner app"
git remote add origin https://github.com/YOUR_USERNAME/dating-planner.git
git push -u origin main
```

2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Add all environment variables from `.env.local`
5. Click **Deploy** → done! 🎉

---

## 🗄️ Database Schema

```
profiles          — User display names & avatars
dates             — Date plans (CRUD)
photos            — Scrapbook photos (Supabase Storage)
budget            — Expense tracker
challenges        — Couple challenges
notes             — Secret notes with unlock_time
calendar_events   — Love calendar (anniversary, birthday, etc.)
progress          — Stat counters (meals together, movies, etc.)
```

All tables use **Row Level Security** — users can only see their own data.

---

## 📁 Project Structure

```
dating-planner/
├── app/
│   ├── dashboard/      # 🏠 Home with stats & surprise
│   ├── planner/        # 💕 Date planner + mood suggestions
│   ├── restaurant/     # 🍽️ Restaurant finder
│   ├── movies/         # 🎬 TMDb movies + local events
│   ├── games/          # 🎮 Truth/Dare, Quiz, Spin, Compat
│   ├── scrapbook/      # 📸 Photo memories
│   ├── budget/         # 💰 Expense tracker
│   ├── calendar/       # 💍 Love calendar
│   ├── notes/          # 🔒 Secret notes
│   ├── progress/       # ⭐ Progress + challenges + weather + gifts + playlist
│   ├── auth/           # 🔐 Login & register
│   └── api/            # 🔗 REST API routes
├── components/
│   ├── Navigation.tsx  # Bottom nav (mobile-first)
│   └── ui/Modal.tsx    # Reusable sheet modal
├── lib/
│   ├── supabase.ts          # Browser Supabase client
│   ├── supabase-server.ts   # Server Supabase client
│   └── types.ts             # TypeScript types
├── supabase/
│   └── schema.sql      # Complete DB schema + RLS + Storage
└── middleware.ts        # Auth route protection
```

---

## 📱 Mobile-First Design

- **Bottom navigation** with 5 primary tabs + More drawer
- **Safe-area insets** for iPhone notch/home bar
- **Touch-optimized** — large tap targets, active scale feedback
- **Responsive** — works on iPhone, Samsung, all Android devices
- **PWA-ready** — installable from browser on iOS & Android

---

## 🔑 API Keys Guide

| Service | Usage | Link |
|---------|-------|------|
| TMDb | Movie posters & search | [themoviedb.org](https://www.themoviedb.org/settings/api) |
| OpenWeather | Current weather | [openweathermap.org](https://home.openweathermap.org/api_keys) |
| Google Maps | Restaurant maps | [console.cloud.google.com](https://console.cloud.google.com) |

All APIs have **free tiers** sufficient for personal use.

---

## 💬 WhatsApp Integration

The app uses WhatsApp deep links (`wa.me`) — no API key needed:

```
https://wa.me/6285282568462?text=Your+message+here
```

Numbers are configured in `.env.local` as `NEXT_PUBLIC_PARTNER_WHATSAPP`.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + TailwindCSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Icons**: Lucide React
- **Date handling**: date-fns
- **Fonts**: Playfair Display + Inter (Google Fonts)
- **Deployment**: Vercel

---

## 📝 License

MIT — made with ❤️ for couples everywhere.
