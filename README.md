# 🎮 Sokoban Game

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A clean implementation of the classic Sokoban puzzle game built with pure JavaScript.

## 🗒️ Description

Sokoban is a logic-based puzzle game where the player moves boxes around a warehouse, positioning them on target locations. The player can push boxes but cannot pull them. A level is completed when all boxes are placed on target cells.

## ✅ Features

- 50 challenging levels of varying difficulty
- Responsive design for mobile devices
- Touch controls for mobile gameplay
- Swipe gesture support on touchscreens
- Move undo functionality
- Move counter
- Dark and light themes (automatically adapts to system preferences)

## 🕹️ Controls

### Desktop:
- **Arrow Keys** - movement
- **Z** - undo move
- Control buttons below the game field

### Mobile Devices:
- Virtual directional buttons
- Swipe gestures on the game field
- Undo, restart, and menu buttons

## 💡Installation & Running

### Option 1: Simple Setup (No Server Required)

1. Download all project files
    
2. Place them in the same directory
    
3. Open `index.html` in your browser
    

### Option 2: With Local Server (Recommended)

Since the game uses ES6 modules, some browsers may require a local server for proper functionality:

**Using Python:**

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Then open `http://localhost:8000` in your browser.

**Using Node.js:**

```bash
npx http-server
```

**Using Live Server (VS Code extension):**  
Install the "Live Server" extension and right-click on `index.html` to "Open with Live Server".

## 📊 Game Structure

- **Menu Screen** - level selection
- **Game Screen** - main gameplay area
- **Victory Screen** - completed level statistics

The game automatically detects the device type and displays appropriate control elements.

## ❓How to Play

1. Select a level from the menu
2. Use controls to move the player character
3. Push boxes onto target positions (marked with dots)
4. Complete the level when all boxes are on targets
5. Use the undo button if you make a mistake
6. Track your move count to improve your score

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.