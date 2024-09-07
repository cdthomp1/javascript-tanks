const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameOverModal = document.getElementById('gameOverModal');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const resetButton = document.getElementById('resetButton');

// Function to create fresh Level objects
function createLevels() {
    return [
        {
            level: new Level(1,
                [{ x: 1100, y: 150, color: 'green' }], // Enemies for Level 3
                [
                    new Barrier(750, 0, 50, 400, 'grey'),
                    new Rubble(750, 400, 50, 50, 'brown'),
                    new Rubble(750, 450, 50, 50, 'brown'),
                    new Barrier(750, 500, 50, (canvas.height - 500), 'grey'),
                ]),
            playerPosition: { x: 100, y: 100 }
        }
    ];
}

let currentLevelIndex = 0; // Track the current level
let levels = createLevels(); // Create fresh levels at the start
let activeLevel = levels[currentLevelIndex].level; // Load the first level
let isGameOver = false; // Track whether the game is over
let playerHasMoved = false; // Track whether the player has moved

// Function to set the canvas size to match the window size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Initialize player, enemy tanks, bullets, and barriers
let player;
let bullets = [];
let enemyBullets = [];

// Function to initialize or reset the game
function initializeGame() {
    resizeCanvas(); // Ensure the canvas matches the window size
    player = new PlayerTank(canvas.width / 2, canvas.height / 2, 'blue');
    bullets = []; // Array to store active bullets
    enemyBullets = []; // Array to store enemy bullets

    // Recreate levels array to ensure fresh state on reset
    levels = createLevels(); // Rebuild levels array from scratch
    activeLevel = levels[currentLevelIndex].level; // Load the first level
    player.updatePosition(levels[currentLevelIndex].playerPosition.x, levels[currentLevelIndex].playerPosition.y)
    playerHasMoved = false; // Reset the player movement flag

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
    if (!playerHasMoved && ['w', 'a', 's', 'd'].includes(e.key.toLowerCase())) {
        playerHasMoved = true; // Mark that the player has started moving
    }
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
    currentLevelIndex = 0; // Reset to the first level
    player.resetMovement(); // Reset the player's movement to prevent momentum
    isGameOver = true; // Set the game state to "over" to pause the game loop

    // Clear all active keys to stop movement
    Object.keys(keys).forEach(key => {
        keys[key] = false;
    });
}

// Event listener for resetting the game via button
resetButton.addEventListener('click', () => {
    currentLevelIndex = 0; // Reset to level 1 on game restart
    initializeGame(); // Reinitialize the game
    requestAnimationFrame(gameLoop); // Resume the game loop
});

function gameLoop() {
    if (isGameOver) return; // Stop the game loop if the game is over

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the barriers for the current level
    activeLevel.drawBarriers(ctx);

    // Draw the player tank and its turret (Always draw the player)
    player.draw(ctx);

    // Always draw enemy tanks (even before the player moves)
    activeLevel.enemies.forEach(enemy => {
        if (!enemy.isDestroyed) {
            enemy.draw(ctx); // Ensure enemies are always drawn
        }
    });

    // Handle player controls
    if (keys['w']) player.moveForward(activeLevel.enemies, activeLevel.barriers);
    if (keys['s']) player.moveBackward(activeLevel.enemies, activeLevel.barriers);
    if (keys['a']) player.rotateLeft();
    if (keys['d']) player.rotateRight();

    // Move and draw player bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.move();
        bullet.draw(ctx);

        let bulletRemoved = false; // Track if the bullet has been removed in this frame

        if (bullet.ricochetIfNeeded(canvas, activeLevel.barriers)) {
            bullets.splice(i, 1); // Remove the bullet if it should be destroyed
            continue;
        }

        // Check for bullet-enemy collisions
        for (let j = activeLevel.enemies.length - 1; j >= 0; j--) {
            const enemy = activeLevel.enemies[j];
            if (!enemy.isDestroyed && bullet.isCollidingWithTank(enemy)) {
                console.log(`Enemy at (${enemy.x}, ${enemy.y}) destroyed!`);
                enemy.isDestroyed = true; // Mark enemy as destroyed
                bullets.splice(i, 1); // Remove the bullet
                bulletRemoved = true;
                break;
            }
        }

        if (bulletRemoved) continue; // Skip further processing if the bullet was removed

        // Check for bullet-barrier collisions (including rubble)
        for (let j = activeLevel.barriers.length - 1; j >= 0; j--) {
            const barrier = activeLevel.barriers[j];
            if (barrier.isCollidingWithBullet(bullet)) {
                bullets.splice(i, 1); // Remove the bullet on collision
                if (barrier.isDestroyed) {
                    activeLevel.barriers.splice(j, 1); // Remove the barrier if destroyed
                }
                break;
            }
        }
    }

    // Check player bullets against barriers (including rubble)
    for (let i = activeLevel.barriers.length - 1; i >= 0; i--) {
        const barrier = activeLevel.barriers[i];

        // Check collision with each bullet
        for (let j = bullets.length - 1; j >= 0; j--) {
            const bullet = bullets[j];
            if (barrier.isCollidingWithBullet(bullet)) {
                bullets.splice(j, 1); // Remove bullet on collision
            }
        }

        // Remove destroyed barriers (e.g., Rubble)
        if (barrier.isDestroyed) {
            activeLevel.barriers.splice(i, 1); // Remove barrier from the array
        }
    }

    // Move and draw enemy bullets and enemies only if the player has moved
    if (playerHasMoved) {
        for (let i = enemyBullets.length - 1; i >= 0; i--) {
            const bullet = enemyBullets[i];
            bullet.move();
            bullet.draw(ctx);

            if (bullet.ricochetIfNeeded(canvas, activeLevel.barriers)) {
                enemyBullets.splice(i, 1);
                continue;
            }

            if (bullet.isCollidingWithPlayer(player)) {
                resetGame(); // Show the Game Over modal and pause the game
                return;
            }
        }

        // Move and draw enemies only if the player has moved
        let allEnemiesDestroyed = activeLevel.updateEnemies(player, enemyBullets, ctx);

        // Check if all enemies are destroyed and advance to the next level
        if (allEnemiesDestroyed) {
            console.log("ALL DONE!");
            if (currentLevelIndex < levels.length - 1) {
                currentLevelIndex++; // Move to the next level
                activeLevel = levels[currentLevelIndex].level; // Load the next level
                player.updatePosition(levels[currentLevelIndex].playerPosition.x, levels[currentLevelIndex].playerPosition.y); // Update player position for the new level
                playerHasMoved = false; // Reset player movement flag for the new level
                enemyBullets = []; // Clear any remaining enemy bullets from the previous level
                bullets = []; // Clear any remaining player bullets from the previous level
                console.log(`ADVANCING TO LEVEL ${currentLevelIndex + 1}`);
                Object.keys(keys).forEach(key => {
                    keys[key] = false;
                });
            } else {
                alert("Congratulations, you've completed all levels!");
                resetGame(); // Reset to level 1 after all levels are completed
            }
        }
    }

    requestAnimationFrame(gameLoop);
}

// Start the game
initializeGame();
requestAnimationFrame(gameLoop);

// Add an event listener to resize the canvas when the window is resized
window.addEventListener('resize', resizeCanvas);
