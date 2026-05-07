Starting with a **9x9 Multiplication (Kuku) Time Attack** is a smart MVP (Minimum Viable Product). In the Japanese curriculum, "Kuku" is the absolute foundation of 2nd-grade math, and the *Picotore* device handles this with a specific "rhythm."

To mimic the device effectively, your spec should focus on **zero-friction transitions** between the test and the review.

## ---

**1\. MVP Functional Flow**

The user experience should follow this linear loop:

1. **Selection:** User selects a "Dan" (a specific table like the 7s) or "Mixed" (all 1–9).  
2. **Time Attack:** A 30 or 60-second sprint.  
3. **Instant Feedback:** Visual/Audio cues for each answer.  
4. **Review Mode:** A focused session only on the missed or slow problems.

## ---

**2\. Technical Spec: Time Attack Logic**

To get that "handheld game" feel, the logic needs to be snappier than a standard web form.

* **Auto-Advance:** The app must detect the correct answer length. Since the max answer is 81 (2 digits), the app should validate the moment the second digit is typed—**no "Enter" key required.**  
* **The "Kuku" Order:** In Japan, these are often practiced in order ($7 \\times 1, 7 \\times 2...$) before being randomized. Your MVP should offer both **"Sequential"** and **"Shuffle"** modes.  
* **Timer Interrupt:** When the timer hits zero, the current problem is discarded, and the app immediately pushes the user to the Results/Review screen.

## ---

**3\. Technical Spec: Review Mode (Nigate-Retry)**

The *Picotore* is famous for its "Mistake Retry." Here is how to spec that logic:

* **The Error Stack:** Create an array called retryQueue.  
* **Trigger:** Every time userInput \!= correctAnswer, push that object into the retryQueue.  
* **The Loop:** After the Time Attack ends, display a "Review Start" button. The app then cycles through the retryQueue.  
* **Completion Criteria:** A problem is only removed from the retryQueue once it is answered correctly **twice in a row** (to ensure it wasn't a lucky guess).

## ---

**4\. UI/UX Design for MVP**

Since this is a web app mimicking a physical device, the layout should stay "compact."

| Element | Description |
| :---- | :---- |
| **The "Screen"** | A high-contrast box (light grey/green background) with large, blocky numbers. |
| **Digital Numpad** | Large touch targets (0–9) at the bottom. This is crucial for mobile use to prevent the native keyboard from obscuring the UI. |
| **Progress Indicator** | A simple "12 / 81" counter or a shrinking progress bar at the top. |
| **Feedback Flash** | A full-screen border flash: **Blue** for correct, **Red** for incorrect. |

## ---

**5\. Implementation Roadmap (Task List)**

1. **Data Layer:** Create a JS object containing all 81 multiplication pairs.  
2. **State Management:** Track currentTime, score, currentProblem, and retryQueue.  
3. **Input Handler:** A function that listens for numpad clicks and compares the string to the answer property.  
4. **Review Trigger:** A conditional render that swaps the "Game" component for the "Review" component once the timer or problem set is finished.

**Would you like me to write a sample JSON structure for the Kuku data, or perhaps a CSS snippet to get that specific "Retro Handheld" look for the UI?**