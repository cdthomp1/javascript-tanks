const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Initialize player, enemy tanks, and barriers
let player;
let bullets;
let enemies;
let barriers; // Array to store barriers

// Function to initialize or reset the game
function initializeGame() {
    player = new PlayerTank(400, 300, 'blue');
    bullets = []; // Array to store active bullets
    enemies = []; // Array to store enemy tanks
    barriers = []; // Array to store barriers

    // Create a few enemy tanks
    for (let i = 0; i < 3; i++) {
        const enemy = new EnemyTank(Math.random() * canvas.width, Math.random() * canvas.height);
        enemies.push(enemy);
    }

    // Create some barriers (x, y, width, height)
    barriers.push(new Barrier(200, 150, 100, 50, 'gray'));
    barriers.push(new Barrier(500, 350, 150, 50, 'gray'));
    barriers.push(new Barrier(300, 100, 50, 200, 'gray'));
}

// Initialize the game for the first time
initializeGame();

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

// Function to reset the game after all enemies are destroyed
function resetGame() {
    setTimeout(() => {
        initializeGame(); // Reset the game after a short delay
    }, 1000); // 1 second delay before resetting the game
}

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the barriers
    barriers.forEach(barrier => {
        barrier.draw(ctx);
    });

    // Handle controls
    if (keys['w']) player.moveForward(enemies, barriers);
    if (keys['s']) player.moveBackward(enemies, barriers);
    if (keys['a']) player.rotateLeft();
    if (keys['d']) player.rotateRight();

    // Draw the player tank and its turret
    player.draw(ctx);

    // Move and draw bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.move();
        bullet.draw(ctx);

        // Check for ricochet and remove bullet if needed
        if (bullet.ricochetIfNeeded(canvas)) {
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

    // Move and draw enemies
    let allEnemiesDestroyed = true;
    enemies.forEach(enemy => {
        if (!enemy.isDestroyed) {
            enemy.move(player, enemies, barriers);
            enemy.draw(ctx);
            allEnemiesDestroyed = false; // At least one enemy is still active
        }
    });

    // Check if all enemies are destroyed, and reset the game if true
    if (allEnemiesDestroyed) {
        resetGame();
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();
