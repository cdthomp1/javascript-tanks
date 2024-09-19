// Import necessary modules
import PlayerTank from './player.js';
import EnemyTank from './enemy.js';
import Bullet from './bullet.js';
import RocketBullet from './rocketBullet.js';
import EnemyBullet from './enemyBullet.js';
import Barrier from './barrier.js';
import Rubble from './rubble.js';
import AmmoPack from './ammoPack.js';
import RocketAmmoPack from './rocketAmmoPack.js';
import Level from './level.js';
import Explosion from './explosion.js';

// Get canvas and context
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
                [{ x: 800, y: 300, color: 'green', canvas: canvas }],
                [
                    new Barrier(500, 150, 50, 50, 'grey'),
                    new Barrier(500, 200, 50, 50, 'grey'),
                    new Barrier(500, 250, 50, 50, 'grey'),
                    new Barrier(500, 300, 50, 50, 'grey'),
                    new Barrier(500, 350, 50, 50, 'grey'),
                    new Barrier(500, 400, 50, 50, 'grey'),
                    new Barrier(500, 450, 50, 50, 'grey'),
                    new Barrier(500, 500, 50, 50, 'grey')
                ],
                []),
            playerPosition: { x: 250, y: 350 }
        },
        {
            level: new Level(2,
                [{ x: 1100, y: 400, color: 'green', canvas: canvas }],
                [
                    new Barrier((canvas.width / 2), (canvas.height / 4), 50, 400, 'grey'),
                    new Barrier((canvas.width / 4) + 50, (canvas.height / 4), 750, 50, 'grey'),
                ],
                [
                    new AmmoPack(600, 300),
                    new RocketAmmoPack(700, 350)
                ]),
            playerPosition: { x: 550, y: 400 }
        },
        {
            level: new Level(3,
                [{ x: 1100, y: 400, color: 'green', canvas: canvas }, { x: 1100, y: 600, color: 'green', canvas: canvas }],
                [
                    new Barrier((canvas.width / 2), (canvas.height / 4), 50, 400, 'grey'),
                    new Barrier((canvas.width / 4) + 50, (canvas.height / 4), 750, 50, 'grey'),
                ],
                [
                    new AmmoPack(550, 400),
                    new RocketAmmoPack(800, 450)
                ]),
            playerPosition: { x: 550, y: 400 }
        },
        {
            level: new Level(4,
                [{ x: ((canvas.width / 5) * 3 + (canvas.width / 4)), y: 150, color: 'green', canvas: canvas }],
                [
                    new Barrier((canvas.width / 4), 100, 50, 110, 'grey'),
                    new Barrier((canvas.width / 4), 500, 50, 110, 'grey'),
                    new Barrier((canvas.width / 2), 0, 50, 400, 'grey'),
                    new Rubble((canvas.width / 2), 400, 50, 50, 2, 'brown'),
                    new Rubble((canvas.width / 2), 450, 50, 50, 2, 'brown'),
                    new Barrier((canvas.width / 2), 500, 50, (canvas.height - 500), 'grey'),
                    new Barrier((canvas.width / 4) * 3, 100, 50, 110, 'grey'),
                    new Barrier((canvas.width / 4) * 3, 500, 50, 110, 'grey'),
                ],
                [
                    new AmmoPack(500, 250),
                    new RocketAmmoPack(600, 200)
                ]),
            playerPosition: { x: 100, y: 100 }
        }
    ];
}

let currentLevelIndex = 0;
let levels = createLevels();
let activeLevel = levels[currentLevelIndex].level;
let isGameOver = false;
let playerHasMoved = false;

let player;
let bullets = [];
let enemyBullets = [];
let explosions = [];
let ammoPackLimit = 5;

// Function to set the canvas size to match the window size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Function to initialize or reset the game
function initializeGame() {
    resizeCanvas();
    player = new PlayerTank(canvas.width / 2, canvas.height / 2, 100, 'blue', canvas);
    bullets = [];
    enemyBullets = [];
    levels = createLevels();
    activeLevel = levels[currentLevelIndex].level;
    player.updatePosition(levels[currentLevelIndex].playerPosition.x, levels[currentLevelIndex].playerPosition.y);
    playerHasMoved = false;
    hideGameOver();
    isGameOver = false;
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
        playerHasMoved = true;
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
    player.updateTurretAngle(mouseX, mouseY);
});

// Mouse click to fire a bullet
canvas.addEventListener('click', () => {
    player.shoot(bullets);
});

// Handle bullet type switching
window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case '1':
            player.switchBulletType(Bullet);
            break;
        case '2':
            player.switchBulletType(RocketBullet);
            break;
        default:
            break;
    }
});

// Reset game logic
function resetGame() {
    playerHasMoved = false;
    showGameOver();
    currentLevelIndex = 0;
    player.resetMovement();
    isGameOver = true;
    Object.keys(keys).forEach(key => {
        keys[key] = false;
    });
}

resetButton.addEventListener('click', () => {
    currentLevelIndex = 0;
    initializeGame();
    requestAnimationFrame(gameLoop);
});

// Spawn ammo packs at intervals
// The AmmoPack has a 54.55% chance of spawning (6 out of 11 possible outcomes).
// The RocketAmmoPack has an 18.18% chance of spawning (2 out of 11 possible outcomes).
function spawnAmmoPack() {
    if (activeLevel.ammoPacks.length >= ammoPackLimit) return;
    const spawnPack = Math.round(Math.random() * 10);
    if (spawnPack % 2 === 0) {
        const randomX = Math.random() * canvas.width;
        const randomY = Math.random() * canvas.height;
        activeLevel.ammoPacks.push(new AmmoPack(randomX, randomY));
        return;
    }
    const spawnRocketPack = Math.round(Math.random() * 10);
    if (spawnRocketPack % 5 === 0) {
        const randomX = Math.random() * canvas.width;
        const randomY = Math.random() * canvas.height;
        activeLevel.ammoPacks.push(new RocketAmmoPack(randomX, randomY));
    }
}
setInterval(spawnAmmoPack, 10000);


// Function to draw the HUD displaying player health and bullet count
function drawHUD(ctx, player, bullets) {
    const slotSize = 50;  // Size of each slot
    const slotSpacing = 10; // Space between slots
    const barX = (canvas.width - (2 * slotSize + slotSpacing)) / 2; // Center the bar horizontally
    const barY = canvas.height - slotSize - 30; // Position it a bit higher from the bottom

    // Draw slots (2 slots: normal bullets and rocket bullets)
    for (let i = 0; i < 2; i++) {
        let slotX = barX + i * (slotSize + slotSpacing); // Calculate the x position of each slot

        // Draw slot background (darker gray for better contrast)
        ctx.fillStyle = 'rgba(100, 100, 100, 0.8)'; // Dark gray with slight transparency
        ctx.fillRect(slotX, barY, slotSize, slotSize);

        // Highlight the selected item with a border
        if ((i === 0 && player.currentBulletType === Bullet) || (i === 1 && player.currentBulletType === RocketBullet)) {
            ctx.strokeStyle = 'yellow'; // Highlight selected item with a yellow border
            ctx.lineWidth = 4;
            ctx.strokeRect(slotX, barY, slotSize, slotSize);
        }

        // Draw key label under each slot (1 for normal, 2 for rocket)
        ctx.fillStyle = 'black';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top'; // Align the text below the slot
        ctx.fillText(i + 1, slotX + slotSize / 2, barY + slotSize + 5); // Display 1 or 2 below the slot
    }

    // Draw the bullet icon for the normal bullet in the first slot
    drawBulletIcon(ctx, barX + slotSize / 2, barY + slotSize / 2);

    // Draw the rocket icon for the rocket in the second slot
    drawRocketIcon(ctx, barX + slotSize + slotSize / 2 + slotSpacing, barY + slotSize / 2);

    // Adjust position for the bullet count text inside the first slot
    ctx.fillStyle = 'white';  // Use white for better contrast
    ctx.font = '12px Arial';  // Smaller font for bullet count
    ctx.textAlign = 'right';
    ctx.fillText(`${player.normalBulletLimit}`, barX + slotSize - 5, barY + slotSize - 12); // Adjust position of the count

    // Adjust position for the rocket count text inside the second slot
    ctx.fillStyle = 'white';  // Use white for better contrast
    ctx.font = '12px Arial';  // Smaller font for rocket count
    ctx.textAlign = 'right';
    ctx.fillText(`${player.rocketBulletLimit}`, barX + slotSize * 2 + slotSpacing - 5, barY + slotSize - 12); // Adjust position of the count

    // Display player health further away from the slots
    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left'; // Align health text to the left
    ctx.fillText(`Health: ${player.health} / ${player.maxHealth}`, barX - 150, barY + slotSize / 2); // More spacing between health and slots
}



function drawBulletIcon(ctx, x, y) {
    ctx.save();  // Save the current state before any transformations
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'black'; // Default color for a regular bullet
    ctx.fill();
    ctx.closePath();
    ctx.restore();  // Restore the saved state after drawing
}



function drawRocketIcon(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);  // Translate to the center of the slot (x, y is the center)

    // Rotate the rocket by 45 degrees (Math.PI / 4)
    ctx.rotate(Math.PI / 4);

    // Smaller dimensions for the rocket
    const bodyWidth = 6;    // Reduced width of the rocket's body
    const bodyHeight = 20;  // Reduced height of the rocket's body
    const noseHeight = 10;  // Reduced height of the nose cone
    const finHeight = 5;    // Reduced height of the fins
    const finWidth = 3;     // Reduced width of the fins

    // Center the rocket body (drawn around the origin)
    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'black';  // Black border
    ctx.lineWidth = 2; // Width of the border
    ctx.fillRect(-bodyWidth / 2, -bodyHeight / 2, bodyWidth, bodyHeight);
    ctx.strokeRect(-bodyWidth / 2, -bodyHeight / 2, bodyWidth, bodyHeight);  // Draw the border around the rocket

    // Center the rocket tip (gray triangle with black border)
    ctx.fillStyle = 'gray';
    ctx.beginPath();
    ctx.moveTo(-bodyWidth / 2, -bodyHeight / 2);  // Left side of the tip
    ctx.lineTo(bodyWidth / 2, -bodyHeight / 2);   // Right side of the tip
    ctx.lineTo(0, -bodyHeight / 2 - noseHeight);  // Tip of the rocket (top)
    ctx.closePath();
    ctx.fill();
    ctx.stroke();  // Draw the border around the tip

    // Center the rocket fins (dark gray triangles with black border)
    ctx.fillStyle = 'darkgray';

    // Left fin
    ctx.beginPath();
    ctx.moveTo(-bodyWidth / 2, bodyHeight / 2);  // Attach to the base of the rocket
    ctx.lineTo(-bodyWidth / 2 - finWidth, bodyHeight / 2 + finHeight);  // Left side of the fin
    ctx.lineTo(-bodyWidth / 2, bodyHeight / 2 + finHeight);  // Connect back to the rocket
    ctx.closePath();
    ctx.fill();
    ctx.stroke();  // Draw the border around the left fin

    // Right fin
    ctx.beginPath();
    ctx.moveTo(bodyWidth / 2, bodyHeight / 2);  // Attach to the base of the rocket
    ctx.lineTo(bodyWidth / 2 + finWidth, bodyHeight / 2 + finHeight);  // Right side of the fin
    ctx.lineTo(bodyWidth / 2, bodyHeight / 2 + finHeight);  // Connect back to the rocket
    ctx.closePath();
    ctx.fill();
    ctx.stroke();  // Draw the border around the right fin

    ctx.restore();
}


// Game loop
function gameLoop() {
    if (isGameOver) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    activeLevel.drawBarriers(ctx);
    activeLevel.ammoPacks.forEach((ammoPack, i) => {
        ammoPack.draw(ctx);
        if (ammoPack.isCollidingWithTank(player)) {
            if (ammoPack instanceof RocketAmmoPack) {
                player.rocketBulletLimit += ammoPack.ammoAmount;
            } else if (ammoPack instanceof AmmoPack) {
                player.normalBulletLimit += ammoPack.ammoAmount;
            }
            activeLevel.ammoPacks.splice(i, 1);
        }
    });
    if (!player.isDestroyed) player.draw(ctx);
    activeLevel.enemies.forEach(enemy => {
        if (!enemy.isDestroyed) {
            if (playerHasMoved) {
                enemy.move(player, activeLevel.enemies, activeLevel.barriers, enemyBullets);
                enemy.shoot(enemyBullets);
            }
            enemy.draw(ctx);
        }
    });
    if (keys['w']) player.moveForward(activeLevel.enemies, activeLevel.barriers);
    if (keys['s']) player.moveBackward(activeLevel.enemies, activeLevel.barriers);
    if (keys['a']) player.rotateLeft();
    if (keys['d']) player.rotateRight();

    bullets.forEach((bullet, i) => {
        bullet.move();
        bullet.draw(ctx);
        if (bullet.ricochetIfNeeded(canvas)) {
            bullets.splice(i, 1);
            return;
        }
        activeLevel.barriers.forEach((barrier, j) => {
            if (barrier.isCollidingWithBullet(bullet)) {
                if (barrier.handleBulletCollision(bullet)) bullets.splice(i, 1);
                if (barrier.isDestroyed) activeLevel.barriers.splice(j, 1);
            }
        });
        // Handle bullet-enemy collisions
        activeLevel.enemies.forEach((enemy) => {
            if (!enemy.isDestroyed && bullet.isCollidingWithTank(enemy)) {
                enemy.takeDamage(bullet.damage);

                if (bullet instanceof RocketBullet) {
                    // Add explosion when a rocket hits an enemy
                    explosions.push(new Explosion(bullet.x, bullet.y));

                    // Remove rocket bullet
                    bullets.splice(i, 1);

                    // Additional explosion effects or damage handling
                    return; // Exit to prevent further checks for this bullet
                }

                if (enemy.health <= 0) {
                    enemy.isDestroyed = true;
                }

                bullets.splice(i, 1); // Remove the bullet after collision
            }
        });
        if (bullet.isOutOfBounds(canvas)) bullets.splice(i, 1);
    });

    enemyBullets.forEach((bullet, i) => {
        bullet.move();
        bullet.draw(ctx);
        if (bullet.ricochetIfNeeded(canvas)) {
            enemyBullets.splice(i, 1);
            return;
        }
        activeLevel.barriers.forEach((barrier, j) => {
            if (barrier.isCollidingWithBullet(bullet)) {
                if (barrier.handleBulletCollision(bullet)) enemyBullets.splice(i, 1);
                if (barrier.isDestroyed) activeLevel.barriers.splice(j, 1);
            }
        });
        if (!player.isDestroyed && bullet.isCollidingWithTank(player)) {
            player.takeDamage(bullet.damage);
            if (player.health <= 0) {
                player.isDestroyed = true;
                resetGame();
            }
            enemyBullets.splice(i, 1);
        }
        if (bullet.isOutOfBounds(canvas)) enemyBullets.splice(i, 1);
    });

    explosions.forEach((explosion, i) => {
        explosion.update();
        explosion.draw(ctx);
        if (explosion.isOver()) explosions.splice(i, 1);
    });

    let allEnemiesDestroyed = activeLevel.updateEnemies(player, enemyBullets, ctx);
    if (allEnemiesDestroyed) {
        if (currentLevelIndex < levels.length - 1) {
            currentLevelIndex++;
            activeLevel = levels[currentLevelIndex].level;
            player.updatePosition(levels[currentLevelIndex].playerPosition.x, levels[currentLevelIndex].playerPosition.y);
            playerHasMoved = false;
            enemyBullets = [];
            bullets = [];
            player.health = player.maxHealth;
            Object.keys(keys).forEach(key => keys[key] = false);
        } else {
            alert("Congratulations, you've completed all levels!");
            resetGame();
        }
    }
    drawHUD(ctx, player, bullets);
    requestAnimationFrame(gameLoop);
}

initializeGame();
requestAnimationFrame(gameLoop);
window.addEventListener('resize', resizeCanvas);
