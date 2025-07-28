#🎧 VoiceWave

**VoiceWave** is an educational podcast streaming app built with **React Native** and **Expo**. It enables students and lifelong learners in Ghana and beyond to access curated educational audio content on the go — optimized for minimal data usage and mobile-first learning.

---

## 🚀 Features

- 🎙️ Stream and download educational podcasts
- 📚 Explore categorized learning topics
- 🧾 Manage a playback queue
- 🔍 Search and discover new episodes
- 🌘 Light and Dark mode
- 📈 Personalized listening stats
- 🔐 User authentication with Supabase
- 📤 Upload and manage episodes (Admin-only)

---

## 🛠 Tech Stack

- **React Native** + **Expo**
- **Supabase** (Auth, Database, Storage)
- **React Navigation**
- **Expo AV** /
- **React Native Paper** or custom UI components

---

## 📦 Installation & Setup

### 🔧 Prerequisites

- Node.js & npm
- Expo CLI  
  ```bash
  npm install -g expo-cli
  ```


### ⚙️ Environment Setup

1. Create a `.env` file in the root of your project:

   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-public-anon-key
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

---

## 📱 Run on Expo Go

### Using a real device:

1. Download **Expo Go** from the [App Store](https://apps.apple.com/app/expo-go/id982107779) or [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent).
2. Start the development server:

   ```bash
   expo start
   ```

3. Scan the QR code shown in the terminal or browser using the Expo Go app.

### Using an emulator (optional):

- **Android Emulator**:
  ```bash
  npm run android
  ```
- **iOS Simulator (macOS only)**:
  ```bash
  npm run ios
  ```

---

## 📁 Project Structure

```
voicewave/
├── app/
│   ├── components/
│   ├── screens/
│   ├── navigation/
│   ├── libs/        # Supabase integration
│   ├── hooks/
│   └── utils/
├── assets/
│   ├── images/
│   └── audio/
├── .env
├── App.js
├── App.json
├── package.json
└── README.md
```

---

## 🧠 Future Additions

- [ ] AI voice recommendations
- [ ] User-generated audio uploads
- [ ] Local language support
- [ ] Curriculum-linked podcast series
- [ ] Admin dashboard (web-based/mobile app)

---

## 🤝 Contributing

Contributions are welcome!  
Submit a pull request or open an issue at [GitHub Issues](https://github.com/semekork/VoiceWave/issues).

---

## 📄 License

This project is licensed under the MIT License. See `LICENSE` for more information.

---

## 📬 Contact

Created with ❤️ by [Calev] 
