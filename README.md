<div align="center">

# ⚡ HACKEDITOR ⚡

<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
<img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
<img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
<img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />

<br />

```
██╗  ██╗ █████╗  ██████╗██╗  ██╗███████╗██████╗ ██╗████████╗ ██████╗ ██████╗
██║  ██║██╔══██╗██╔════╝██║ ██╔╝██╔════╝██╔══██╗██║╚══██╔══╝██╔═══██╗██╔══██╗
███████║███████║██║     █████╔╝ █████╗  ██║  ██║██║   ██║   ██║   ██║██████╔╝
██╔══██║██╔══██║██║     ██╔═██╗ ██╔══╝  ██║  ██║██║   ██║   ██║   ██║██╔══██╗
██║  ██║██║  ██║╚██████╗██║  ██╗███████╗██████╔╝██║   ██║   ╚██████╔╝██║  ██║
╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═════╝ ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝
```

### 🔮 A cyberpunk-themed rich text editor that makes formatting feel like hacking the matrix 🔮

<br />

[![GitHub repo](https://img.shields.io/badge/GitHub-hackeditor-00e5c8?style=flat-square&logo=github)](https://github.com/lrishiraj007/hackeditor)
![Status](https://img.shields.io/badge/Status-Ready_to_Hack-00e5c8?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-00e5c8?style=flat-square)
![Vibe](https://img.shields.io/badge/Vibe-Cyberpunk_🌃-00e5c8?style=flat-square)

</div>

---

## 🤔 What is HACKEDITOR?

> *Ever wished formatting text felt as cool as hacking into a mainframe?*  
> **HACKEDITOR** is a rich text editor wrapped in a **cyberpunk aesthetic** — glowing neon buttons, pulsing grids, and a dark-mode-only attitude. No deprecated APIs. No boring UIs. Just pure, modern web tech with maximum style. 😎

Built with **zero deprecated APIs** — uses the modern `Selection` & `Range` API instead of the old `document.execCommand`. Because we don't do legacy here. 🚀

---

## ✨ Features

| Feature | Icon | Description |
|---------|------|-------------|
| **Bold** | 🅱️ | Make your text SCREAM with `<strong>` tags |
| **Italic** | 🔤 | Give your words that *slanted sophistication* with `<em>` |
| **Underline** | ⎁ | Draw a line under the important stuff with `<u>` |
| **Align Left** | ◀️ | Classic left alignment for the traditionalists |
| **Align Center** | ⏺️ | Center stage, where all the action happens |
| **Align Right** | ▶️ | Right-aligned for the rebels |
| **Glow Effects** | ✨ | Neon cyan glow that pulses like a heartbeat |
| **Scanline Overlay** | 📺 | CRT monitor vibes on every button |
| **Grid Background** | 🌐 | Animated grid that breathes in the background |
| **Zero Lag** | ⚡ | Memoized components — type at the speed of thought |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have these installed:

- 📦 **Node.js** `v18+` → [Download](https://nodejs.org/)
- 📦 **npm** `v9+` (comes with Node)

### Installation

```bash
# 1️⃣  Clone the repo
git clone https://github.com/lrishiraj007/hackeditor.git

# 2️⃣  Jump into the directory
cd hackeditor

# 3️⃣  Install dependencies
npm install

# 4️⃣  Fire it up! 🔥
npm run dev
```

Then open **http://localhost:5173/** in your browser and start hacking! 💻

### Build for Production

```bash
# 🏗️ Build optimized bundle
npm run build

# 👀 Preview the production build
npm run preview
```

---

## 🗂️ Project Structure

```
hackeditor/
├── 📁 public/              # Static assets
├── 📁 src/
│   ├── 📁 components/
│   │   ├── 🎨 Editor.css    # Cyberpunk styling magic
│   │   └── ⚛️  Editor.tsx    # The brain of the editor
│   ├── 🎨 index.css         # Global theme & CSS variables
│   ├── ⚛️  App.tsx           # App root
│   └── ⚛️  main.tsx          # Entry point
├── 📄 index.html            # HTML shell
├── 📄 package.json          # Dependencies & scripts
├── 📄 tsconfig.json         # TypeScript config
└── 📄 vite.config.ts        # Vite bundler config
```

---

## 🛠️ Tech Stack

| Technology | Purpose | Why? |
|------------|---------|------|
| ⚛️ **React 19** | UI Library | Component-based, declarative, fast |
| 🟦 **TypeScript** | Type Safety | Catch bugs before they catch you |
| ⚡ **Vite** | Build Tool | Lightning-fast HMR & builds |
| 🎨 **Vanilla CSS** | Styling | Full control, zero bloat |
| 🔗 **Selection API** | Text Formatting | Modern, standards-compliant, no deprecation warnings |

---

## 🎮 How It Works (Under the Hood)

```
┌─────────────────────────────────────────────────┐
│                  HACKEDITOR                      │
├─────────────────────────────────────────────────┤
│                                                  │
│   User selects text                              │
│        │                                         │
│        ▼                                         │
│   Clicks toolbar button                          │
│        │                                         │
│        ▼                                         │
│   toggleInlineFormat()                           │
│        │                                         │
│        ├── Already formatted? → unwrapElement()  │
│        │                                         │
│        ├── No selection? → Insert zero-width     │
│        │   space in <tag> wrapper                │
│        │                                         │
│        └── Has selection? → Range.surroundContents()
│                                                  │
│   syncFormatState()                              │
│        │                                         │
│        ▼                                         │
│   Only re-render if state actually changed ⚡    │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 🎯 Fun Facts

- 🧮 **0** deprecated API calls — we're fully modern here
- 🎨 **3** CSS animations running simultaneously (title glow, grid pulse, status dot)
- 📺 **Scanline overlays** on buttons give authentic CRT monitor vibes
- 🧊 The editor area uses `React.memo` with `() => true` — it literally **never** re-renders from React state changes
- 🔤 The title uses **Orbitron** font — the same font family used in sci-fi movie UIs
- 💡 **Zero-width spaces** (`\u200B`) are used to enable formatting at cursor position with no selection
- 🌐 The background grid **breathes** — it pulses opacity over 8 seconds
- ⚡ Format state is diffed with a `useRef` before hitting `setState` — no wasted renders

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. 🍴 Fork the repo
2. 🌿 Create a feature branch (`git checkout -b feature/cool-thing`)
3. 💾 Commit your changes (`git commit -m 'Add cool thing'`)
4. 📤 Push to the branch (`git push origin feature/cool-thing`)
5. 🔃 Open a Pull Request

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Made with 💚 and too much caffeine ☕**

*"In a world of plain text editors, be a HACKEDITOR"*

⚡ **Happy Hacking!** ⚡

</div>
