This plan outlines a serverless, client-side-only architecture to replicate the **Picotore** experience. By using Preact and Vite, we keep the bundle size extremely small, ensuring the app feels "instant," much like the original hardware.

## ---

**1\. Project Initialization & Configuration**

Since this is for GitHub Pages, we need to handle the base path correctly (e.g., username.github.io/repo-name/).

* **Scaffold:** npm create vite@latest picotore-clone \-- \--template preact-ts  
* **Vite Config:** Update vite.config.ts to include base: './' or your specific repo name so assets load correctly on GH Pages.  
* **PWA Setup (Optional):** Use vite-plugin-pwa so you can "install" the app on your phone and use it offline, just like the real device.

## ---

**2\. Application Architecture (State Machine)**

The app will operate like a simple state machine to manage the transitions between the "Hardware" menus.

**State Definitions:**

* IDLE: The "Start" screen.  
* PLAYING: The Time Attack countdown.  
* RESULT: Summary of speed and accuracy.  
* REVIEW: The "Nigate-Retry" loop for missed problems.

## ---

**3\. Core Logic & Data Structures**

In src/logic/kuku.ts, define the math engine:

TypeScript

export interface Problem {  
  id: string;  
  q: string; // e.g., "7 × 8"  
  a: number; // 56  
}

// Generate all 81 problems  
export const generateKuku \= (): Problem\[\] \=\> {  
  const problems: Problem\[\] \= \[\];  
  for (let i \= 1; i \<= 9; i++) {  
    for (let j \= 1; j \<= 9; j++) {  
      problems.push({ id: \`${i}\-${j}\`, q: \`${i} × ${j}\`, a: i \* j });  
    }  
  }  
  return problems;  
};

## ---

**4\. Component Roadmap**

To ensure it fits portrait mobile screens, we will use a **Flexbox-column** layout that locks the aspect ratio on desktop.

### **A. The "Device" Container (Layout)**

A wrapper component that limits max-width: 450px on desktop but spans 100% on mobile. Use a dark "plastic" border or a violet theme to mimic the GS-1139-V.

### **B. The Display Component**

* **Progress Bar:** A thin line at the top.  
* **Large Digits:** Using a pixelated font (e.g., DotGothic16).  
* **Flash Layer:** A div that overlays the screen momentarily (Blue for correct, Red for wrong).

### **C. The Virtual Numpad**

**Crucial for UX:** Do *not* use \<input type="number"\>. On mobile, this triggers the system keyboard which ruins the "game" layout.

* Build a 0-9 grid \+ Clear button.  
* Listen for clicks and physical keyboard events (0-9) simultaneously.

## ---

**5\. Feature Implementation: The "Retry" Loop**

To mimic the Picotore’s "Mistake Retry" (Nigate-Retry):

1. During PLAYING, if an answer is wrong, push the Problem object into a mistakeBuffer array.  
2. When the timer hits 0, transition to RESULT.  
3. The "Review" button only appears if mistakeBuffer.length \> 0\.  
4. In REVIEW mode, cycle through the buffer. If the user gets one wrong again, it stays in the buffer for another round.

## ---

**6\. Implementation Schedule**

| Phase | Tasks |
| :---- | :---- |
| **Phase 1: Foundation** | Setup Vite \+ TS; Define Problem types; Create randomizer logic. |
| **Phase 2: UI Shell** | Create the "Handheld" CSS wrapper; Add the Virtual Numpad. |
| **Phase 3: Game Loop** | Implement 60s timer; Auto-validation (no Enter key); Result summary. |
| **Phase 4: Review Mode** | Implement the mistakeBuffer logic and the "Retry" screen. |
| **Phase 5: Polish** | Add sound effects (Beep/Boop); "Violet" color scheme; Deploy to GH Pages. |

## ---

**7\. Deployment to GitHub Pages**

1. **Build Script:** Add "deploy": "npm run build && npx gh-pages \-d dist" to package.json.  
2. **GitHub Action (Alternative):** Use the standard "Static HTML" action provided by GitHub to build and deploy on every push to main.

### **Mobile UI Tip:**

To prevent the "bounce" and zoom effects common on mobile browsers, add this to your index.html:

HTML

\<meta name\="viewport" content\="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"\>

This ensures the app feels like a dedicated piece of hardware.

**Would you like me to provide the CSS for the "Violet Picotore" aesthetic or the TypeScript code for the Auto-Validation logic?**