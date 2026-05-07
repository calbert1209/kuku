# 🎮 Picotore Kuku (くく タイムアタック)

A retro-styled web application that replicates the experience of the **Sonic Picotore (GS-1139-V)** handheld device, specifically designed for practicing **Kuku** (Japanese 9x9 multiplication tables).

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Technology](https://img.shields.io/badge/tech-Preact%20%2B%20Vite%20%2B%20TS-blueviolet)

## ✨ Features

-   **Authentic "Violet" Aesthetic:** High-contrast greenish LCD display with a light violet chassis.
-   **Retro Typography:** Powered by the **DotGothic16** pixel font for a genuine 90s handheld feel.
-   **Time Attack Mode:** A 60-second sprint to solve as many multiplication problems as possible.
-   **Nigate-Retry (Mastery Loop):** Problems missed during the game enter a review queue and must be answered correctly **twice in a row** to be cleared.
-   **Mode Selection:** Practice specific tables (1-9) or "Mix Everything" for a total challenge.
-   **Flexible Input:** Supports both the on-screen "chunky" virtual numpad and physical keyboard input.
-   **Audio Feedback:** Retro beep/boop sound effects via the Web Audio API.
-   **Mobile Optimized:** Fixed viewport and touch-friendly targets for a "dedicated hardware" experience on smartphones.

## 🚀 Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or higher recommended)
-   npm

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/kuku.git
    cd kuku
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

4.  Build for production:
    ```bash
    npm run build
    ```

## 🛠️ Tech Stack

-   **Framework:** [Preact](https://preactjs.com/) (Fast, lightweight alternative to React)
-   **Build Tool:** [Vite](https://vite.dev/)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Styling:** Vanilla CSS (CSS Variables + Keyframe Animations)
-   **Audio:** Web Audio API (Procedurally generated retro sounds)

## 📖 How to Play

1.  **スタート (Start):** Click the start button on the main screen.
2.  **えらんでね (Selection):** Choose a specific table (e.g., "7だん") or "ぜんぶまぜる" (Mix all). Toggle between "じゅんばん" (In Order) or "バラバラ" (Shuffle).
3.  **プレイ (Play):** Type the answer using the numpad or your keyboard. There is **no Enter key**—the app validates as soon as you type the required number of digits!
4.  **ふくしゅう (Review):** If you make mistakes, click "ふくしゅう" after the game to enter Mastery Mode.

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

---
*Inspired by the educational hardware of the 90s.*
