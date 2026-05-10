# ExOwn - The Ultimate Campus Marketplace 🚀

**Exchange. Own. Repeat.**  
ExOwn is a premium, student-centric marketplace designed specifically for university campuses. It allows students to buy, sell, and rent items within their safe campus ecosystem.

![ExOwn Marketplace](https://images.unsplash.com/photo-1523240715639-963c6a216e76?w=1200&q=80)

## ✨ Key Features

- **🔐 Secure Authentication:** Student-only access via Google/University email (Firebase Auth).
- **🛍️ Multi-Category Marketplace:** Buy and sell everything from Mobiles, Laptops, and Books to Cycle rentals and Hostel essentials.
- **⚡ Premium Listing Wizard:** A sleek, 6-step wizard for creating high-quality product listings.
- **🌓 Adaptive Dark Mode:** A stunning, premium UI that adapts perfectly to your system preferences.
- **🔍 Advanced Search & Filters:** Real-time filtering by category, price, and condition.
- **👤 Dynamic Profiles:** Complete your student profile with course, batch, and hostel details for trusted trading.
- **🔔 Notification Center:** Stay updated with real-time alerts on your deals and account status.

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Auth:** Firebase Authentication
- **Styling:** Tailwind CSS + Lucide Icons
- **State Management:** React Context API

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18.x or later
- A Neon PostgreSQL instance
- A Firebase project for Auth

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/harinpandey/ExOwn.git

# Install dependencies
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory and add your credentials:
```env
DATABASE_URL="your-neon-url"
DIRECT_URL="your-neon-direct-url"

NEXT_PUBLIC_FIREBASE_API_KEY="your-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-domain"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-id"
```

### 4. Database Setup
```bash
npx prisma generate
npx prisma db push
```

### 5. Run Locally
```bash
npm run dev
```

---

Built with ❤️ for students, by students.  
**ExOwn - Redefining Campus Commerce.**
