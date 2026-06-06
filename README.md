# Kinetix 🏎️

Kinetix is a premium, high-fidelity driver safety telematics and analytics mobile application built with **React Native**, **Expo (v54)**, and **TypeScript**. 

It uses real-time mobile device sensor telemetry (accelerometer, gyroscope, and device state dynamics) to compute longitudinal, lateral, and vertical G-forces. By evaluating driving performance, Kinetix logs harsh events (braking, acceleration, sharp steering, phone distractions), calculates live passenger comfort/smoothness indexes, and awards gamified achievement badges to incentivize safer driving habits.

---

## Key Features 🌟

### 1. Active Driving HUD & Telematics
- **Live G-Force Balance Bubble**: A 2D crosshair visualizer mapping real-time lateral and longitudinal acceleration forces.
- **Smoothness Index**: Real-time comfort calculation indicating how comfortable the ride is for passengers.
- **Deduction Alert Feed**: Instant visual alerts and tactile feedback whenever a harsh incident is detected.
- **On-Device Sensor Calibration**: Auto-calibrates sensor reference frames based on initial device tilt.

### 2. Pilot AI Driving Coach (Groq-Powered)
- **Safe Driving Advisor**: Powered by the **Groq API** (supporting Llama 3.3/3.1 models).
- **Intelligent Caching**: Module-level caching to guarantee stability and prevent redundant API re-runs during screen navigation.
- **Offline Rule Engine**: A fallback local telematics analyzer that generates actionable advice even without network connectivity or API configuration.

### 3. Detailed Drive Summaries
- **Incident Breakdown Charts**: Animated horizontal bar charts mapping deductions per driving category.
- **Deduction Audit**: Itemized points details mapping specific deductions per event (e.g., Harsh Braking, Sharp Cornering, Phone Handling).
- **History Tab**: Browse all past trips, mileage, average scores, and final grades.

### 4. Gamified Achievements & Badges
- **Milestone Rewards**: Unlock badges for positive driving habits (e.g. *Focus Master*, *Smooth Operator*, *Cornering Specialist*, *Night Rider*).
- **Unlocked Celebration Overlay**: Premium full-screen modal overlays featuring animated transitions and celebratory haptic feedback triggers when a new badge is unlocked.

### 5. Highly Modular Settings & Custom Controls
- **Tactile Haptic Toggles**: Enable or disable fine-grained device vibrations using `expo-haptics`.
- **QA Simulation Controls**: Inline event simulation panel allowing developers to trigger mock driving telemetry events for test scenarios.
- **Groq AI Configuration**: Secure storage of API keys and picker toggles to choose the active AI model.
- **Secure Account Deletion**: Custom warning dialog to permanently purge all stored database metrics and local device states.

---

## Tech Stack 🛠️

- **Framework**: React Native, Expo (v54), TypeScript, Expo Router (file-based navigation)
- **Local Database**: Local storage wrapper and AsyncStorage
- **Tactile Integration**: Expo Haptics
- **AI Completion**: Groq REST APIs
- **Animations**: React Native Animated API (springs, pulses, loops)

---

## File Structure & Directory Design 📂

```
kinetix/
├── app/                        # Expo Router routing directory
├── screens/                    # Component modules grouped by feature
│   ├── drive/                  # Active drive tracking screen
│   │   ├── ActiveDriveScreen.tsx
│   │   └── components/         # Modular sub-components (Modals, QA Simulator)
│   ├── details/                # Detailed post-trip analytics screen
│   │   ├── DetailsScreen.tsx
│   │   └── components/         # Telemetry bar charts
│   ├── home/                   # Main navigation tabs (Console, History, Settings)
│   │   ├── components/         # Tab subcomponents (Dashboard, Profiles, Settings, AI Coach)
│   │   └── utils/              # Helper systems (Badges, Math formulas)
├── services/                   # Core business logic services
│   ├── driveManager.ts         # Handles active trip logging and statistics
│   ├── sensorManager.ts        # Handles hardware accelerometer/gyroscope filters
│   ├── settingsManager.ts      # Stores global app preferences (Haptics, Demo, AI keys)
│   ├── db.ts                   # SQLite/Storage interface
│   └── aiCoach.ts              # Groq compilation system
└── .prettierrc                 # Code formatting configuration
```

---

## Getting Started 🚀

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
If you want to use the Groq-powered Pilot AI, get an API key from the [Groq Console](https://console.groq.com/) and input it securely under the **AI Assistant Setup** section in the **Settings** tab.

### 3. Run the Development Server
```bash
npx expo start
```

Press `a` to open in an Android Emulator, `i` to open in iOS Simulator, or scan the QR code to run on a physical device via Expo Go.

---

## Code Style & Formatter 🎨
We use Prettier to enforce clean, readable formatting. Verify code consistency by running:
```bash
npx prettier --write .
```
And check TypeScript compile status:
```bash
npx tsc --noEmit
```
