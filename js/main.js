const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameOverModal = document.getElementById('gameOverModal');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const resetButton = document.getElementById('resetButton');

let currentLevel = 1; // Start at level 1
let maxLevel = 5; // Define how many levels you want
let isGameOver = false; // Track whether the game is over

// Function to set the canvas size to match the window size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Initialize player, enemy tanks, bullets, and barriers
let player;
let bullets = [];
let enemies = [];
let barriers = [];
let enemyBullets = [];

// Function to initialize or reset the game
function initializeGame() {
    resizeCanvas(); // Ensure the canvas matches the window size
    player = new PlayerTank(canvas.width / 2, canvas.height / 2, 'blue');
    bullets = []; // Array to store active bullets
    enemies = []; // Array to store enemy tanks
    barriers = []; // Array to store barriers
    enemyBullets = []; // Array to store enemy bullets

    initializeLevel(currentLevel); // Initialize the current level

    hideGameOver(); // Hide game over modal when initializing the game
    isGameOver = false; // Reset the game state
}

// Initialize levels with different enemy and barrier layouts
function initializeLevel(level) {
    console.log("Initializing Level: " + level);

    // Clear previous enemies, barriers, and bullets
    enemies = [];
    barriers = [];
    bullets = [];
    enemyBullets = [];

    // Level 1 - 1 enemy and predefined barriers
    if (level === 1) {
        enemies.push(new EnemyTank(600, 150, 'green'));
        barriers.push(new Barrier(300, 200, 100, 50, 'gray'));
        barriers.push(new Barrier(500, 400, 150, 50, 'gray'));
    }

    // Level 2 - 2 enemies and more barriers
    if (level === 2) {
        enemies.push(new EnemyTank(600, 150, 'green'));
        enemies.push(new EnemyTank(700, 350, 'green'));
        barriers.push(new Barrier(300, 200, 100, 50, 'gray'));
        barriers.push(new Barrier(500, 400, 150, 50, 'gray'));
        barriers.push(new Barrier(200, 300, 50, 150, 'gray'));
    }

    // Level 3 - 3 enemies and more complex layout
    if (level === 3) {
        enemies.push(new EnemyTank(600, 150, 'green'));
        enemies.push(new EnemyTank(700, 350, 'green'));
        enemies.push(new EnemyTank(200, 400, 'green'));
        barriers.push(new Barrier(100, 200, 100, 50, 'gray'));
        barriers.push(new Barrier(500, 400, 150, 50, 'gray'));
        barriers.push(new Barrier(400, 150, 50, 150, 'gray'));
    }

    console.log("Enemies added: ", enemies.length);
    console.log("Barriers added: ", barriers.length);

    // Ensure enemies and barriers are properly logged and displayed
    enemies.forEach(enemy => console.log(`Enemy at (${enemy.x}, ${enemy.y})`));
    barriers.forEach(barrier => console.log(`Barrier at (${barrier.x}, ${barrier.y})`));
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
    currentLevel = 1; // Reset to level 1 on game restart
    initializeGame(); // Reinitialize the game
    requestAnimationFrame(gameLoop); // Resume the game loop
});

// Game loop
function gameLoop() {
    if (isGameOver) return; // Stop the game loop if the game is over

    // Clear the previous frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the barriers for the current level
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

    // Move and draw player bullets (loop from the end to avoid index issues)
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
                console.log(`Enemy at (${enemy.x}, ${enemy.y}) destroyed!`);
                enemy.isDestroyed = true; // Mark enemy as destroyed
                bullets.splice(i, 1); // Remove the bullet
                break; // Exit bullet-enemy check once bullet is removed
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
            allEnemiesDestroyed = false; // If any enemy is still alive, this stays false
        }
    });

    // Check if all enemies are destroyed and go to next level if true
    if (allEnemiesDestroyed) {
        console.log("ALL DONE! ");
        if (currentLevel < maxLevel) {
            currentLevel++; // Move to next level
            console.log("ADVANCING");

            // Reinitialize and force the game to refresh objects in the next level
            initializeLevel(currentLevel); // Load next level
        } else {
            alert("Congratulations, you've completed all levels!");
            resetGame(); // Reset to level 1 after all levels are completed
        }
        // return;
    }

    // Continue game loop
    requestAnimationFrame(gameLoop);
}



// Start the game
initializeGame();
requestAnimationFrame(gameLoop);

// Add an event listener to resize the canvas when the window is resized
window.addEventListener('resize', resizeCanvas);
