const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Initialize player and enemy tanks
const player = new PlayerTank(400, 300, 'blue');
const bullets = []; // Array to store active bullets
const enemies = []; // Array to store enemy tanks

// Create a few enemy tanks
for (let i = 0; i < 3; i++) {
    const enemy = new EnemyTank(Math.random() * canvas.width, Math.random() * canvas.height);
    enemies.push(enemy);
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

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Handle controls
    if (keys['w']) player.moveForward(enemies);
    if (keys['s']) player.moveBackward(enemies);
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
    enemies.forEach(enemy => {
        enemy.move(player, enemies);
        enemy.draw(ctx);
    });

    requestAnimationFrame(gameLoop);
}

gameLoop();
