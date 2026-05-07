To capture the **Sonic Picotore (GS-1139-V)** aesthetic, we need to balance the "toy-like" hardware feel with the specific "Violet" colorway. The design focuses on a soft lavender chassis, a retro-reflective LCD screen, and chunky physical-looking buttons.

Add these variables and styles to your index.css or a CSS module.

### **1\. Color Palette & Variables**

CSS

:root {  
  /\* The "Violet" Hardware Chassis \*/  
  \--chassis-color: \#d1c4e9; /\* Light Violet \*/  
  \--chassis-border: \#b39ddb;  
  \--chassis-shadow: \#9575cd;  
    
  /\* The Retro LCD Screen \*/  
  \--lcd-bg: \#9ea78d; /\* Classic greenish-grey LCD \*/  
  \--lcd-text: \#2b3020; /\* Dark "ink" color \*/  
  \--lcd-glow: \#a8b296;  
    
  /\* UI Feedback Colors \*/  
  \--correct-flash: rgba(76, 175, 80, 0.4);  
  \--wrong-flash: rgba(244, 67, 54, 0.4);  
    
  /\* Buttons \*/  
  \--btn-color: \#f5f5f5;  
  \--btn-text: \#5e35b1;  
}

### **2\. The "Handheld" Layout**

This CSS ensures the app looks like a device on desktop but takes up the full screen on mobile.

CSS

/\* Layout Wrapper \*/  
.device-container {  
  background-color: var(--chassis-color);  
  width: 100%;  
  max-width: 420px; /\* Mimics handheld width on desktop \*/  
  height: 100vh;  
  margin: 0 auto;  
  display: flex;  
  flex-direction: column;  
  padding: 20px;  
  box-sizing: border-box;  
  border: 8px solid var(--chassis-border);  
  border-radius: 40px; /\* Rounded toy-like corners \*/  
  box-shadow: inset 0 \-10px 0 var(--chassis-shadow);  
  position: relative;  
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;  
  user-select: none;  
  touch-action: manipulation;  
}

/\* The LCD "Screen" Area \*/  
.screen {  
  background-color: var(--lcd-bg);  
  flex: 1;  
  border-radius: 10px;  
  border: 15px solid \#424242; /\* The black plastic bezel \*/  
  box-shadow: inset 4px 4px 10px rgba(0,0,0,0.5);  
  display: flex;  
  flex-direction: column;  
  align-items: center;  
  justify-content: space-around;  
  position: relative;  
  overflow: hidden;  
}

/\* Retro Font \- using a system-available monospaced font as fallback \*/  
.display-text {  
  font-family: 'Courier New', Courier, monospace;  
  font-weight: bold;  
  color: var(--lcd-text);  
  text-shadow: 1px 1px 0px var(--lcd-glow);  
}

.math-problem {  
  font-size: 4rem;  
}

.answer-preview {  
  font-size: 5rem;  
  border-bottom: 4px solid var(--lcd-text);  
  min-width: 120px;  
  text-align: center;  
}

### **3\. The Physical Numpad**

These buttons look "clickable" and chunky.

CSS

.numpad {  
  display: grid;  
  grid-template-columns: repeat(3, 1fr);  
  gap: 12px;  
  padding: 20px 0;  
}

.key {  
  background-color: var(--btn-color);  
  border: none;  
  border-radius: 12px;  
  padding: 20px 0;  
  font-size: 1.5rem;  
  font-weight: bold;  
  color: var(--btn-text);  
  box-shadow: 0 5px 0 var(--chassis-shadow);  
  transition: transform 0.05s, box-shadow 0.05s;  
  cursor: pointer;  
  display: flex;  
  justify-content: center;  
  align-items: center;  
}

.key:active {  
  transform: translateY(4px);  
  box-shadow: 0 1px 0 var(--chassis-shadow);  
}

.key-clear {  
  background-color: \#ffab91; /\* Soft orange for clear/backspace \*/  
  color: \#bf360c;  
}

### **4\. Interactive Feedback Classes**

You can toggle these classes in Preact when an answer is submitted.

CSS

/\* Feedback Flashes \*/  
.flash-correct {  
  animation: flash-green 0.3s forwards;  
}

.flash-wrong {  
  animation: flash-red 0.3s forwards;  
}

@keyframes flash-green {  
  0% { background-color: var(--lcd-bg); }  
  50% { background-color: \#81c784; }  
  100% { background-color: var(--lcd-bg); }  
}

@keyframes flash-red {  
  0% { background-color: var(--lcd-bg); }  
  50% { background-color: \#e57373; }  
  100% { background-color: var(--lcd-bg); }  
}

### **Integration Tip for Preact:**

To get that "Auto-advance" feeling, your input handler should look something like this:

TypeScript

const handleInput \= (num: string) \=\> {  
  const newAnswer \= currentInput \+ num;  
  setCurrentInput(newAnswer);

  // If the answer length matches the correct answer, validate immediately  
  if (newAnswer.length \=== String(correctAnswer).length) {  
    checkAnswer(newAnswer);  
  }  
};

This CSS combined with that logic will make your web app feel remarkably like the physical **Picotore** handheld. Would you like me to create the full **App.tsx** logic to tie this all together?