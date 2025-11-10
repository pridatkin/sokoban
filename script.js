import { LEVELS } from "./levels.js"
// Game constants
const TILE_SIZE = 32;
const FLOOR = ' ';
const WALL = '#';
const BOX = '$';
const GOAL = '.';
const PLAYER = '@';
const BOX_ON_GOAL = '*';
const PLAYER_ON_GOAL = '+';

// Game state
let currentLevel = 0;
let gameState = [];
let playerPos = { x: 0, y: 0 };
let moveCount = 0;
let levelWidth = 0;
let levelHeight = 0;
let goals = [];
let stateHistory = [];

// Canvas and sprites
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const sprites = {};
let spritesLoaded = 0;
const totalSprites = 5;

// initializing sprites
function loadSprite(name, imagePath) {
    const img = new Image();
    img.onload = () => {
        spritesLoaded++;
        if (spritesLoaded === totalSprites) {
            renderGame();
        }
    };
    img.onerror = () => {
        console.error(`Не удалось загрузить спрайт: ${imagePath}`);
    };
    sprites[name] = img;
    img.src = imagePath;
}

loadSprite('floor', './assets/floor.png');
loadSprite('wall', './assets/wall.png');
loadSprite('box', './assets/box.png');
loadSprite('player', './assets/player.png');
loadSprite('goal', './assets/goal.png');
loadSprite('box_on_goal', './assets/box_on_goal.png');

// Initialize menu
function initMenu() {
    const levelList = document.getElementById('levelList');
    levelList.innerHTML = '';
    
    LEVELS.forEach((level, index) => {
    const levelItem = document.createElement('div');
    levelItem.className = 'level-item';
    levelItem.textContent = `Уровень ${index + 1}`;
    levelItem.onclick = () => startLevel(index);
    levelList.appendChild(levelItem);
    });
}


function parseLevel(levelData) {
    gameState = [];
    goals = [];
    levelWidth = 0;
    levelHeight = levelData.length;
    
    // Find max width
    levelData.forEach(row => {
        levelWidth = Math.max(levelWidth, row.length);
    });
    
    // Parse each cell
    for (let y = 0; y < levelHeight; y++) {
        gameState[y] = [];
        const row = levelData[y] || '';
        
        for (let x = 0; x < levelWidth; x++) {
            const cell = x < row.length ? row[x] : ' ';
            
            if (cell === PLAYER || cell === PLAYER_ON_GOAL) {
                playerPos = { x, y };
                gameState[y][x] = cell === PLAYER_ON_GOAL ? GOAL : FLOOR;
                if (cell === PLAYER_ON_GOAL) goals.push({ x, y });
            } else if (cell === BOX_ON_GOAL) {
                gameState[y][x] = BOX_ON_GOAL;
                goals.push({ x, y });
            } else if (cell === GOAL) {
                gameState[y][x] = GOAL;
                goals.push({ x, y });
            } else if (cell === BOX) {
                gameState[y][x] = BOX;
            } else if (cell === WALL) {
                gameState[y][x] = WALL;
            } else {
                gameState[y][x] = FLOOR;
            }
        }
    }
}

// Start level
function startLevel(levelIndex) {
    currentLevel = levelIndex;
    moveCount = 0;
    
    parseLevel(LEVELS[levelIndex]);
    
    // Setup canvas
    canvas.width = levelWidth * TILE_SIZE;
    canvas.height = levelHeight * TILE_SIZE;
    
    // Update UI
    document.getElementById('currentLevelNumber').textContent = levelIndex + 1;
    document.getElementById('moveCount').textContent = moveCount;
    
    // Show game screen
    showScreen('gameScreen');
    renderGame();
}

function renderGame() {
    if (spritesLoaded < totalSprites) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw tiles
    for (let y = 0; y < levelHeight; y++) {
        for (let x = 0; x < levelWidth; x++) {
            const cell = gameState[y][x];
            
            // Draw floor
            ctx.drawImage(sprites.floor, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            
            // Draw goal marker
            if (isGoal(x, y)) {
                ctx.drawImage(sprites.goal, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
            
            // Draw wall or box
            if (cell === WALL) {
                ctx.drawImage(sprites.wall, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            } else if (cell === BOX) {
                ctx.drawImage(sprites.box, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            } else if (cell === BOX_ON_GOAL) {
                ctx.drawImage(sprites.box_on_goal, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }
    
    // Draw player
    ctx.drawImage(sprites.player, playerPos.x * TILE_SIZE, playerPos.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}

// Check if position is a goal
function isGoal(x, y) {
    return goals.some(goal => goal.x === x && goal.y === y);
}

function movePlayer(dx, dy) {
    // Saving a copy of the state before the move
    stateHistory.push({
        gameState: JSON.parse(JSON.stringify(gameState)),
        playerPos: { x: playerPos.x, y: playerPos.y },
        moveCount: moveCount
    });
    if (stateHistory.length > 100) stateHistory.shift();

    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;
    
    // Check bounds
    if (newX < 0 || newX >= levelWidth || newY < 0 || newY >= levelHeight) return;
    
    const targetCell = gameState[newY][newX];
    
    // Wall blocking
    if (targetCell === WALL) return;
    
    // Box in the way
    if (targetCell === BOX || targetCell === BOX_ON_GOAL) {
        const boxNewX = newX + dx;
        const boxNewY = newY + dy;
        
        // Check if box can be pushed
        if (boxNewX < 0 || boxNewX >= levelWidth || boxNewY < 0 || boxNewY >= levelHeight) return;
        
        const boxTargetCell = gameState[boxNewY][boxNewX];
        if (boxTargetCell === WALL || boxTargetCell === BOX || boxTargetCell === BOX_ON_GOAL) return;
        
        // Push box - defining the new mailbox status
        const isNewPosGoal = isGoal(boxNewX, boxNewY);
        gameState[newY][newX] = isGoal(newX, newY) ? GOAL : FLOOR;
        gameState[boxNewY][boxNewX] = isNewPosGoal ? BOX_ON_GOAL : BOX;
    }
    
    // Move player
    playerPos.x = newX;
    playerPos.y = newY;
    moveCount++;
    
    document.getElementById('moveCount').textContent = moveCount;
    renderGame();
    
    // Check win condition
    checkWin();
}

function undoMove() {
    if (stateHistory.length === 0) return;
    const prev = stateHistory.pop();
    gameState = JSON.parse(JSON.stringify(prev.gameState));
    playerPos = { x: prev.playerPos.x, y: prev.playerPos.y };
    moveCount = prev.moveCount;
    document.getElementById('moveCount').textContent = moveCount;
    renderGame();
}

// Check win
function checkWin() {
    const allBoxesOnGoals = goals.every(goal => gameState[goal.y][goal.x] === BOX_ON_GOAL);
    
    if (allBoxesOnGoals) {
    setTimeout(() => {
        document.getElementById('finalMoveCount').textContent = moveCount;
        showScreen('victoryScreen');
    }, 300);
    }
}

// Show screen
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (document.getElementById('gameScreen').classList.contains('active')) {
    switch (e.key) {
        case 'ArrowUp':
        e.preventDefault();
        movePlayer(0, -1);
        break;
        case 'ArrowDown':
        e.preventDefault();
        movePlayer(0, 1);
        break;
        case 'ArrowLeft':
        e.preventDefault();
        movePlayer(-1, 0);
        break;
        case 'ArrowRight':
        e.preventDefault();
        movePlayer(1, 0);
        break;
        case 'z':
        e.preventDefault();
        undoMove();
        break;
    }
    }
});

// Button handlers
//document.getElementById('undoBtn').onclick = undoMove;
document.querySelectorAll('.undoBtn').forEach(el => el.addEventListener('click', () => undoMove()));
document.querySelectorAll('.restartBtn').forEach(el => el.addEventListener('click', () => startLevel(currentLevel)));
document.querySelectorAll('.menuBtn').forEach(el => el.addEventListener('click', () => showScreen('menuScreen')));
document.querySelectorAll('.nextLevelBtn').forEach(el => el.addEventListener('click', () => {
    if (currentLevel < LEVELS.length - 1) {
        startLevel(currentLevel + 1);
    } else {
        showScreen('menuScreen');
    }
    }
));

// Initialize
initMenu();


// Handlers for virtual buttons
document.getElementById('touchUp').addEventListener('touchstart', (e) => {
    e.preventDefault();
    movePlayer(0, -1);
});

document.getElementById('touchDown').addEventListener('touchstart', (e) => {
    e.preventDefault();
    movePlayer(0, 1);
});

document.getElementById('touchLeft').addEventListener('touchstart', (e) => {
    e.preventDefault();
    movePlayer(-1, 0);
});

document.getElementById('touchRight').addEventListener('touchstart', (e) => {
    e.preventDefault();
    movePlayer(1, 0);
});

// Adding swipe support
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    const minSwipeDistance = 30; // minimum swipe distance
    
    // Determining the swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // Horizontal swipe
    if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0) {
        movePlayer(1, 0); // Right
        } else {
        movePlayer(-1, 0); // Left
        }
    }
    } else {
    // Vertical swipe
    if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0) {
        movePlayer(0, 1); // Down
        } else {
        movePlayer(0, -1); // Up
        }
    }
    }
});

// We prevent scaling with a double tap
document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) {
    e.preventDefault();
    }
}, { passive: false });

let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
    e.preventDefault();
    }
    lastTouchEnd = now;
}, false);