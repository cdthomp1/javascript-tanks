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

// Set fixed canvas size (1200x900)
canvas.width = 1200;
canvas.height = 900;

const gameOverModal = document.getElementById('gameOverModal');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const resetButton = document.getElementById('resetButton');

// Function to create fresh Level objects
async function createLevels() {
    const response = await fetch('./levels/levels.json');
    const levelsData = await response.json();

    const levels = levelsData.map(levelData => {
        // Create enemies
        const enemies = levelData.enemies.map(enemy => {
            return { x: enemy.x, y: enemy.y, color: enemy.color, canvas: canvas };
        });

        // Create barriers
        const barriers = levelData.barriers.map(barrier => {
            if (barrier.type === 'Barrier') {
                return new Barrier(barrier.x, barrier.y, barrier.width, barrier.height, barrier.color);
            } else if (barrier.type === 'Rubble') {
                return new Rubble(barrier.x, barrier.y, barrier.width, barrier.height, barrier.durability, barrier.color);
            }
        });

        // Create ammo packs
        const ammoPacks = levelData.ammoPacks.map(ammo => {
            if (ammo.type === 'AmmoPack') {
                return new AmmoPack(ammo.x, ammo.y);
            } else if (ammo.type === 'RocketAmmoPack') {
                return new RocketAmmoPack(ammo.x, ammo.y);
            }
        });

        return {
            level: new Level(levelData.level, enemies, barriers, ammoPacks),
            playerPosition: levelData.playerPosition
        };
    });

    return levels;
}

let currentLevelIndex = 0;
let levels = [];
let activeLevel;
let isGameOver = false;
let playerHasMoved = false;

let player;
let bullets = [];
let enemyBullets = [];
let explosions = [];
let ammoPackLimit = 5;

let gameLoaded = false;
let levelsLoaded = false;

// Function to initialize or reset the game
async function initializeGame() {
    bullets = [];
    enemyBullets = [];
    explosions = [];
    levels = await createLevels();  // Wait for levels to be loaded asynchronously
    activeLevel = levels[currentLevelIndex].level;  // Set the active level after loading
    player = new PlayerTank(canvas.width / 2, canvas.height / 2, 100, 'blue', canvas);
    player.updatePosition(levels[currentLevelIndex].playerPosition.x, levels[currentLevelIndex].playerPosition.y);
    playerHasMoved = false;
    hideGameOver();
    isGameOver = false;
    gameLoaded = true;
    levelsLoaded = true;
    requestAnimationFrame(gameLoop); // Start the game loop after initialization
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
    if (!player) return;  // Ensure player is defined before trying to update turret angle

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
    player.checkIfStopped();
    isGameOver = true;
    Object.keys(keys).forEach(key => {
        keys[key] = false;
    });
}

resetButton.addEventListener('click', async () => {
    currentLevelIndex = 0;
    await initializeGame();
});

// Spawn ammo packs at intervals
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
    const slotSize = 50;
    const slotSpacing = 10;
    const barX = (canvas.width - (2 * slotSize + slotSpacing)) / 2;
    const barY = canvas.height - slotSize - 30;

    // Draw slots for normal and rocket bullets
    for (let i = 0; i < 2; i++) {
        const slotX = barX + i * (slotSize + slotSpacing);
        ctx.fillStyle = 'rgba(100, 100, 100, 0.8)';
        ctx.fillRect(slotX, barY, slotSize, slotSize);

        if ((i === 0 && player.currentBulletType === Bullet) || (i === 1 && player.currentBulletType === RocketBullet)) {
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 4;
            ctx.strokeRect(slotX, barY, slotSize, slotSize);
        }

        ctx.fillStyle = 'black';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(i + 1, slotX + slotSize / 2, barY + slotSize + 5);
    }

    drawBulletIcon(ctx, barX + slotSize / 2, barY + slotSize / 2);
    drawRocketIcon(ctx, barX + slotSize + slotSize / 2 + slotSpacing, barY + slotSize / 2);

    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`${player.normalBulletLimit}`, barX + slotSize - 5, barY + slotSize - 12);
    ctx.fillText(`${player.rocketBulletLimit}`, barX + slotSize * 2 + slotSpacing - 5, barY + slotSize - 12);

    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Health: ${player.health} / ${player.maxHealth}`, barX - 150, barY + slotSize / 2);
}

function drawBulletIcon(ctx, x, y) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.closePath();
    ctx.restore();
}

function drawRocketIcon(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.PI / 4);

    const bodyWidth = 6;
    const bodyHeight = 20;
    const noseHeight = 10;
    const finHeight = 5;
    const finWidth = 3;

    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.fillRect(-bodyWidth / 2, -bodyHeight / 2, bodyWidth, bodyHeight);
    ctx.strokeRect(-bodyWidth / 2, -bodyHeight / 2, bodyWidth, bodyHeight);

    ctx.fillStyle = 'gray';
    ctx.beginPath();
    ctx.moveTo(-bodyWidth / 2, -bodyHeight / 2);
    ctx.lineTo(bodyWidth / 2, -bodyHeight / 2);
    ctx.lineTo(0, -bodyHeight / 2 - noseHeight);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'darkgray';

    ctx.beginPath();
    ctx.moveTo(-bodyWidth / 2, bodyHeight / 2);
    ctx.lineTo(-bodyWidth / 2 - finWidth, bodyHeight / 2 + finHeight);
    ctx.lineTo(-bodyWidth / 2, bodyHeight / 2 + finHeight);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(bodyWidth / 2, bodyHeight / 2);
    ctx.lineTo(bodyWidth / 2 + finWidth, bodyHeight / 2 + finHeight);
    ctx.lineTo(bodyWidth / 2, bodyHeight / 2 + finHeight);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
}

// Game loop
function gameLoop() {
    if (isGameOver) return;

    if (!gameLoaded && !levelsLoaded) {
        requestAnimationFrame(gameLoop);
        return;
    }

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

        enemy.checkIfStopped();
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
        activeLevel.enemies.forEach((enemy) => {
            if (!enemy.isDestroyed && bullet.isCollidingWithTank(enemy)) {
                enemy.takeDamage(bullet.damage);

                if (bullet instanceof RocketBullet) {
                    explosions.push(new Explosion(bullet.x, bullet.y));
                    bullets.splice(i, 1);
                    return;
                }

                if (enemy.health <= 0) {
                    enemy.isDestroyed = true;
                }

                bullets.splice(i, 1);
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

    const allEnemiesDestroyed = activeLevel.updateEnemies(player, enemyBullets, ctx);
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
    player.checkIfStopped();

    drawHUD(ctx, player, bullets);

    requestAnimationFrame(gameLoop);
}

initializeGame();
