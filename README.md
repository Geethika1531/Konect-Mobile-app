# Konect Mobile App 🥂

**Inclusive. Warm. Premium.**

Konect is a next-generation community platform designed to foster real-world connections. Built with a voice-first philosophy and a dual-theme identity (Neutral / LGBTQ+), Konect prioritizes safety, trust, and inclusivity for users aged 18–30.

---

## 🚀 Vision
Konect transforms the digital connection experience into a thriving, safe community. From one-on-one "First 5" meetups to persistent friend groups (Circles) and neighborhood gatherings (Micro-Events), Konect is where meaningful connections happen.

## ✨ Core Features

### 🛡️ Trust & Safety (Phase 3)
- **Emergency SOS**: Immediate location sharing with emergency contacts.
- **Silent Exit**: Fake-call simulation to provide a safe "out" from uncomfortable situations.
- **Report System**: Anonymous reporting of users and content.
- **Phone Verification**: Secured onboarding to ensure a trusted community.

### 🌸 Gamification & Reputation
- **Trust Flowers**: Qualitative, anonymous tags (e.g., "Great Listener", "Kind") to build social proof.
- **First 5 Journey**: A gamified path for the first 5 free meetups.
- **Badges**: Earned recognition for community participation and positive behavior.

### 👥 Community Interaction (Phase 2)
- **Circles**: Persistent group chats and friend circles with admin controls.
- **Micro-Events**: Discover and create small-scale neighborhood gatherings.
- **Voice-First Chat**: Encrypted messaging with a "Voice First" connection requirement.

### 🎨 Premium Experience (Phase 1)
- **Dual Themes**: Seamlessly toggle between "Neutral" and "LGBTQ+" branding.
- **Voice-First Onboarding**: A curated onboarding flow focused on identity and safety.
- **Discover Feed**: A vibrant, mood-based feed of nearby users.

---

## 🛠️ Technology Stack
- **Framework**: [Expo](https://expo.dev/) (React Native) with [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing).
- **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native).
- **State Management**: [Zustand](https://github.com/pmndrs/zustand).
- **Backend / DB**: [Firebase](https://firebase.google.com/) (Auth, Firestore, Storage, Cloud Functions).
- **Icons**: Lucide React Native & Custom SVGs.
- **Animations**: React Native Reanimated & Haptics.

---

## 📂 Project Structure
```text
Konect-Mobile/
├── app/                  # Expo Router App Directory
│   ├── (auth)/           # Authentication Screens (Login, Signup)
│   ├── (onboarding)/     # Curated Onboarding Flow
│   ├── (app)/            # Main Application Screens
│   │   ├── (tabs)/       # Root Tab Navigation
│   │   ├── chat/         # Real-time Messaging
│   │   ├── circles/      # Community Groups
│   │   └── events/       # Neighborhood Gatherings
│   └── _layout.tsx       # Root Guard & Auth Logic
├── components/           # Reusable UI Components (Pills, Modals, SOS)
├── functions/            # Firebase Cloud Functions (Typescript)
├── lib/                  # Library configurations (Firebase.ts)
├── stores/               # Zustand State Stores
├── scripts/              # Data Seeding & Maintenance Scripts
└── global.css            # Tailwind / NativeWind Styles
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Expo Go app on your mobile device (for testing)

### Installation
1. **Clone the repository**:
   ```bash
   git clone https://github.com/Geethika1531/Konect-Mobile-app.git
   cd Konect-Mobile-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `lib/firebase.ts` with your Firebase configuration.

4. **Run the app**:
   ```bash
   npm run start
   ```
   *Scan the QR code with the Expo Go app to view on your device.*

---

## 🗺️ Roadmap
- [x] Phase 1: Core Voice-First Chat & Dual Themes
- [x] Phase 2: Micro-Events & Circles
- [x] Phase 3: Trust, Safety & Monetization
- [ ] Phase 4: AI-driven match insights & Event Recommendations

---

## 📄 License
Private Repository - © 2026 Konect. All rights reserved.
