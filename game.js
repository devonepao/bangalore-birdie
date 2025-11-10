// Game configuration
const CONFIG = {
    GRAVITY: 0.5,
    JUMP_FORCE: -8,
    BIRD_SIZE: 30,
    OBSTACLE_WIDTH: 60,
    OBSTACLE_GAP: 150,
    OBSTACLE_SPEED: 3,
    MIN_OBSTACLE_HEIGHT: 50,
    MAX_OBSTACLE_HEIGHT: 300,
};

// Bangalore-themed obstacles with increasing difficulty
const BANGALORE_OBSTACLES = [
    { name: "Traffic Signal", color: "#FF6B6B", minScore: 0 },
    { name: "Pothole", color: "#4ECDC4", minScore: 3 },
    { name: "Auto Rickshaw", color: "#FFE66D", minScore: 6 },
    { name: "Construction Zone", color: "#FF8C42", minScore: 9 },
    { name: "Flooded Street", color: "#4A90E2", minScore: 12 },
    { name: "Cow on Road", color: "#F4A460", minScore: 15 },
    { name: "Peak Hour Traffic", color: "#C44569", minScore: 18 },
    { name: "Broken Footpath", color: "#95A5A6", minScore: 21 },
    { name: "Metro Construction", color: "#E67E22", minScore: 24 },
    { name: "Silk Board Junction", color: "#E74C3C", minScore: 27 },
];

// Game state
let canvas, ctx;
let bird;
let obstacles = [];
let score = 0;
let gameState = 'start'; // 'start', 'playing', 'gameOver'
let animationId;
let currentObstacleType;

// DOM elements
let startScreen, gameOverScreen, hud, startBtn, restartBtn;
let scoreDisplay, finalScoreDisplay, obstacleNameDisplay, currentObstacleDisplay;

// Bird class
class Bird {
    constructor() {
        this.x = canvas.width * 0.2;
        this.y = canvas.height / 2;
        this.velocity = 0;
        this.size = CONFIG.BIRD_SIZE;
    }

    update() {
        this.velocity += CONFIG.GRAVITY;
        this.y += this.velocity;

        // Prevent bird from going above or below canvas
        if (this.y < 0) {
            this.y = 0;
            this.velocity = 0;
        }
        if (this.y + this.size > canvas.height) {
            this.y = canvas.height - this.size;
            this.velocity = 0;
            return true; // Hit ground
        }
        return false;
    }

    jump() {
        this.velocity = CONFIG.JUMP_FORCE;
    }

    draw() {
        // Draw bird as a circle with gradient
        const gradient = ctx.createRadialGradient(
            this.x + this.size / 2, this.y + this.size / 2, 0,
            this.x + this.size / 2, this.y + this.size / 2, this.size / 2
        );
        gradient.addColorStop(0, '#FFD700');
        gradient.addColorStop(1, '#FFA500');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x + this.size / 2, this.y + this.size / 2, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw eye
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x + this.size * 0.6, this.y + this.size * 0.4, this.size * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.x + this.size * 0.65, this.y + this.size * 0.4, this.size * 0.08, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw beak
        ctx.fillStyle = '#FF6347';
        ctx.beginPath();
        ctx.moveTo(this.x + this.size, this.y + this.size / 2);
        ctx.lineTo(this.x + this.size + 10, this.y + this.size / 2 - 5);
        ctx.lineTo(this.x + this.size + 10, this.y + this.size / 2 + 5);
        ctx.closePath();
        ctx.fill();
    }
}

// Obstacle class
class Obstacle {
    constructor() {
        this.x = canvas.width;
        this.width = CONFIG.OBSTACLE_WIDTH;
        this.gap = CONFIG.OBSTACLE_GAP;
        
        // Random gap position
        const minY = CONFIG.MIN_OBSTACLE_HEIGHT;
        const maxY = canvas.height - CONFIG.MIN_OBSTACLE_HEIGHT - this.gap;
        this.gapY = Math.random() * (maxY - minY) + minY;
        
        this.passed = false;
        this.obstacleType = getCurrentObstacleType();
    }

    update() {
        this.x -= CONFIG.OBSTACLE_SPEED;
    }

    draw() {
        const color = this.obstacleType.color;
        
        // Draw top obstacle
        const topGradient = ctx.createLinearGradient(this.x, 0, this.x + this.width, 0);
        topGradient.addColorStop(0, color);
        topGradient.addColorStop(1, this.shadeColor(color, -20));
        
        ctx.fillStyle = topGradient;
        ctx.fillRect(this.x, 0, this.width, this.gapY);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, 0, this.width, this.gapY);
        
        // Draw bottom obstacle
        const bottomGradient = ctx.createLinearGradient(this.x, this.gapY + this.gap, this.x + this.width, this.gapY + this.gap);
        bottomGradient.addColorStop(0, color);
        bottomGradient.addColorStop(1, this.shadeColor(color, -20));
        
        ctx.fillStyle = bottomGradient;
        ctx.fillRect(this.x, this.gapY + this.gap, this.width, canvas.height - this.gapY - this.gap);
        ctx.strokeStyle = '#333';
        ctx.strokeRect(this.x, this.gapY + this.gap, this.width, canvas.height - this.gapY - this.gap);
        
        // Draw obstacle name on the pipes
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.gapY / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(this.obstacleType.name, 0, 0);
        ctx.restore();
    }

    shadeColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255))
            .toString(16).slice(1);
    }

    collidesWith(bird) {
        // Check if bird is within obstacle's x range
        if (bird.x + bird.size > this.x && bird.x < this.x + this.width) {
            // Check if bird hits top or bottom obstacle
            if (bird.y < this.gapY || bird.y + bird.size > this.gapY + this.gap) {
                return true;
            }
        }
        return false;
    }

    isOffScreen() {
        return this.x + this.width < 0;
    }

    isPassed(bird) {
        return !this.passed && this.x + this.width < bird.x;
    }
}

// Get current obstacle type based on score
function getCurrentObstacleType() {
    for (let i = BANGALORE_OBSTACLES.length - 1; i >= 0; i--) {
        if (score >= BANGALORE_OBSTACLES[i].minScore) {
            return BANGALORE_OBSTACLES[i];
        }
    }
    return BANGALORE_OBSTACLES[0];
}

// Update difficulty based on score
function updateDifficulty() {
    const baseSpeed = 3;
    const speedIncrease = Math.floor(score / 5) * 0.5;
    CONFIG.OBSTACLE_SPEED = baseSpeed + speedIncrease;
    
    const baseGap = 150;
    const gapDecrease = Math.floor(score / 10) * 10;
    CONFIG.OBSTACLE_GAP = Math.max(100, baseGap - gapDecrease);
}

// Initialize game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // DOM elements
    startScreen = document.getElementById('start-screen');
    gameOverScreen = document.getElementById('game-over-screen');
    hud = document.getElementById('hud');
    startBtn = document.getElementById('start-btn');
    restartBtn = document.getElementById('restart-btn');
    scoreDisplay = document.getElementById('score');
    finalScoreDisplay = document.getElementById('final-score');
    obstacleNameDisplay = document.getElementById('obstacle-name');
    currentObstacleDisplay = document.getElementById('current-obstacle');
    
    // Set canvas size based on viewport
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Event listeners
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', restartGame);
    
    // Control listeners
    document.addEventListener('keydown', handleKeyPress);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchstart', handleTouch);
    
    // Prevent default touch behavior
    document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
}

function resizeCanvas() {
    const container = document.getElementById('game-container');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Maintain aspect ratio
    const aspectRatio = 4 / 3;
    let width = containerWidth;
    let height = width / aspectRatio;
    
    if (height > containerHeight) {
        height = containerHeight;
        width = height * aspectRatio;
    }
    
    canvas.width = Math.floor(width);
    canvas.height = Math.floor(height);
}

function handleKeyPress(e) {
    if (e.code === 'Space' && gameState === 'playing') {
        e.preventDefault();
        bird.jump();
    }
}

function handleClick(e) {
    if (gameState === 'playing') {
        e.preventDefault();
        bird.jump();
    }
}

function handleTouch(e) {
    if (gameState === 'playing') {
        e.preventDefault();
        bird.jump();
    }
}

function startGame() {
    gameState = 'playing';
    score = 0;
    obstacles = [];
    bird = new Bird();
    
    // Reset difficulty
    CONFIG.OBSTACLE_SPEED = 3;
    CONFIG.OBSTACLE_GAP = 150;
    
    // Hide start screen, show HUD
    startScreen.classList.add('hidden');
    hud.classList.remove('hidden');
    
    updateScore();
    gameLoop();
}

function restartGame() {
    gameOverScreen.classList.add('hidden');
    startGame();
}

function updateScore() {
    scoreDisplay.textContent = `Score: ${score}`;
    currentObstacleType = getCurrentObstacleType();
    currentObstacleDisplay.textContent = `Obstacle: ${currentObstacleType.name}`;
}

function gameOver() {
    gameState = 'gameOver';
    cancelAnimationFrame(animationId);
    
    // Show game over screen
    hud.classList.add('hidden');
    finalScoreDisplay.textContent = `Score: ${score}`;
    obstacleNameDisplay.textContent = `Crashed into: ${currentObstacleType.name}`;
    gameOverScreen.classList.remove('hidden');
}

function gameLoop() {
    if (gameState !== 'playing') return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw bird
    const hitGround = bird.update();
    if (hitGround) {
        gameOver();
        return;
    }
    bird.draw();
    
    // Update and draw obstacles
    obstacles.forEach((obstacle, index) => {
        obstacle.update();
        obstacle.draw();
        
        // Check collision
        if (obstacle.collidesWith(bird)) {
            gameOver();
            return;
        }
        
        // Check if bird passed obstacle
        if (obstacle.isPassed(bird)) {
            obstacle.passed = true;
            score++;
            updateScore();
            updateDifficulty();
        }
        
        // Remove off-screen obstacles
        if (obstacle.isOffScreen()) {
            obstacles.splice(index, 1);
        }
    });
    
    // Add new obstacles
    if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < canvas.width - 250) {
        obstacles.push(new Obstacle());
    }
    
    animationId = requestAnimationFrame(gameLoop);
}

// Start the game when page loads
window.addEventListener('load', init);
