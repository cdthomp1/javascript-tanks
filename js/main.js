const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameOverModal = document.getElementById('gameOverModal');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const resetButton = document.getElementById('resetButton');

const barrierCount = 5; // Number of barriers

// Function to set the canvas size to match the window size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Initialize player, enemy tanks, bullets, and barriers
let player;
let bullets;
let enemies;
let barriers;
let enemyBullets; // Array to store enemy bullets
let isGameOver = false; // Track whether the game is over

// Function to create a randomized barrier position
function createRandomBarrier(i) {
    const barrierWidth = 100; // Fixed width of the barriers
    const barrierHeight = 50; // Fixed height of the barriers

    // Ensure the barrier doesn't go out of bounds
    const x = Math.random() * (canvas.width - barrierWidth);
    const y = Math.random() * (canvas.height - barrierHeight);

    return new Barrier(x, y, barrierWidth, barrierHeight, 'gray');
}

// Function to initialize or reset the game
function initializeGame() {
    resizeCanvas(); // Ensure the canvas matches the window size
    player = new PlayerTank(canvas.width / 2, canvas.height / 2, 'blue');
    bullets = []; // Array to store active bullets
    enemies = []; // Array to store enemy tanksw
    barriers = []; // Array to store barriers
    enemyBullets = []; // Array to store enemy bullets

    // Create a few enemy tanks
    for (let i = 0; i < 3; i++) {
        const enemy = new EnemyTank(Math.random() * canvas.width, Math.random() * canvas.height);
        enemies.push(enemy);
    }

    // Randomly create barriers
    for (let i = 0; i < barrierCount; i++) {
        barriers.push(createRandomBarrier());
        console.table(barriers)
    }

    hideGameOver(); // Hide game over modal when initializing the game
    isGameOver = false; // Reset the game state
}

// Function to show the Game Over modal
function showGameOver() {
    gameOverModal.style.display = 'block';
    gameOverOverlay.style.display = 'block';
}

// Function to hide the Game Over modal
function hideGameOver() {
    gameOverModal.style.display = 'none';
    gameOverOverlay.style.display = 'none';
}

// Controls
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
});
window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Mouse movement
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Update the turret angle to point towards the mouse
    player.updateTurretAngle(mouseX, mouseY);
});

// Mouse click to fire a bullet
canvas.addEventListener('click', () => {
    player.shoot(bullets); // Fire bullet from turret
});

// Function to handle the reset game logic
function resetGame() {
    // Show the Game Over modal
    showGameOver();
    isGameOver = true; // Set the game state to "over" to pause the game loop
}

// Event listener for resetting the game via button
resetButton.addEventListener('click', () => {
    initializeGame(); // Reinitialize the game when the reset button is clicked
    requestAnimationFrame(gameLoop); // Resume the game loop
});

// Game loop
function gameLoop() {
    if (isGameOver) return; // Stop the game loop if the game is over

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the barriers
    barriers.forEach(barrier => {
        barrier.draw(ctx);
    });

    // Handle player controls
    if (keys['w']) player.moveForward(enemies, barriers);
    if (keys['s']) player.moveBackward(enemies, barriers);
    if (keys['a']) player.rotateLeft();
    if (keys['d']) player.rotateRight();

    // Draw the player tank and its turret
    player.draw(ctx);

    // Move and draw player bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.move();
        bullet.draw(ctx);

        // Check for ricochet and remove bullet if needed
        if (bullet.ricochetIfNeeded(canvas, barriers)) {
            bullets.splice(i, 1); // Remove the bullet if it should be destroyed
            continue; // Skip further checks for this bullet
        }

        // Check for bullet-enemy collisions
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (!enemy.isDestroyed && bullet.isCollidingWithTank(enemy)) {
                enemy.isDestroyed = true; // Destroy the enemy
                bullets.splice(i, 1); // Remove the bullet
                break; // Break out of the inner loop once the bullet is removed
            }
        }
    }

    // Move and draw enemy bullets
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const bullet = enemyBullets[i];
        bullet.move();
        bullet.draw(ctx);

        // Check for ricochet and remove bullet if needed
        if (bullet.ricochetIfNeeded(canvas, barriers)) {
            enemyBullets.splice(i, 1); // Remove the bullet if it should be destroyed
            continue; // Skip further checks for this bullet
        }

        // Check if the bullet hits the player
        if (bullet.isCollidingWithPlayer(player)) {
            resetGame(); // Show the Game Over modal and pause the game
            return; // Exit the game loop for this frame
        }
    }

    // Move and draw enemies
    let allEnemiesDestroyed = true;
    enemies.forEach(enemy => {
        if (!enemy.isDestroyed) {
            enemy.move(player, enemies, barriers, enemyBullets);
            enemy.draw(ctx);
            allEnemiesDestroyed = false; // At least one enemy is still active
        }
    });

    // Check if all enemies are destroyed, and show the Game Over screen if true
    if (allEnemiesDestroyed) {
        resetGame(); // Show Game Over modal when all enemies are destroyed
        return;
    }

    requestAnimationFrame(gameLoop);
}

// Start the game
initializeGame();
requestAnimationFrame(gameLoop);

// Add an event listener to resize the canvas when the window is resized
window.addEventListener('resize', resizeCanvas);
