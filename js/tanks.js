const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Tank class with boundary and enemy collision detection
export default class Tank {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.width = 40;
        this.height = 40;
        this.angle = 0;  // Tank body angle
        this.turretAngle = 0; // Turret angle
        this.speed = 2;
    }

    draw() {
        // Draw the tank body
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

        // Draw the front indicator
        this.drawFrontIndicator();

        ctx.restore();

        // Draw the turret
        this.drawTurret();
    }

    drawTurret() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.turretAngle);
        ctx.fillStyle = 'darkgray';
        ctx.fillRect(-5, -10, 30, 20); // Simple rectangle as turret
        ctx.restore();
    }

    drawFrontIndicator() {
        // Draw a small line to indicate the front of the tank
        ctx.strokeStyle = 'red';  // Set color of the indicator
        ctx.lineWidth = 2;        // Thickness of the indicator line
        ctx.beginPath();
        ctx.moveTo(0, 0);         // Start at the center of the tank
        ctx.lineTo(this.width / 2 + 10, 0); // Draw a line extending in front of the tank
        ctx.stroke();
    }

    // Move forward with boundary and enemy collision detection
    moveForward(enemies) {
        const nextX = this.x + Math.cos(this.angle) * this.speed;
        const nextY = this.y + Math.sin(this.angle) * this.speed;

        if (this.isWithinBounds(nextX, nextY) && !this.isCollidingWithEnemy(nextX, nextY, enemies)) {
            this.x = nextX;
            this.y = nextY;
        }
    }

    // Move backward with boundary and enemy collision detection
    moveBackward(enemies) {
        const nextX = this.x - Math.cos(this.angle) * this.speed;
        const nextY = this.y - Math.sin(this.angle) * this.speed;

        if (this.isWithinBounds(nextX, nextY) && !this.isCollidingWithEnemy(nextX, nextY, enemies)) {
            this.x = nextX;
            this.y = nextY;
        }
    }

    // Check if the tank is within the canvas boundaries
    isWithinBounds(nextX, nextY) {
        const margin = this.width / 2; // Half of the tank's width as a margin
        return (
            nextX > margin &&
            nextX < canvas.width - margin &&
            nextY > margin &&
            nextY < canvas.height - margin
        );
    }

    // Check if the player is colliding with any enemy
    isCollidingWithEnemy(nextX, nextY, enemies) {
        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];
            if (!enemy.isDestroyed && enemy !== this) {
                const dx = nextX - enemy.x;
                const dy = nextY - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const collisionDistance = this.width / 2 + enemy.width / 2; // Sum of the radii
                if (distance < collisionDistance) {
                    return true; // Collision detected
                }
            }
        }
        return false;
    }

    rotateLeft() {
        this.angle -= 0.05;
    }

    rotateRight() {
        this.angle += 0.05;
    }

    // Update turret angle based on mouse position
    updateTurretAngle(mouseX, mouseY) {
        let dx = mouseX - this.x;
        let dy = mouseY - this.y;
        this.turretAngle = Math.atan2(dy, dx);
    }

    // Shoot a bullet from the turret
    shoot() {
        const bulletSpeed = 5;
        const bulletX = this.x + Math.cos(this.turretAngle) * (this.width / 2);
        const bulletY = this.y + Math.sin(this.turretAngle) * (this.height / 2);
        const bullet = new Bullet(bulletX, bulletY, this.turretAngle, bulletSpeed);
        bullets.push(bullet); // Add bullet to the list of bullets
    }
}

// Bullet class
class Bullet {
    constructor(x, y, angle, speed) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.radius = 5; // Bullet size
    }

    // Move the bullet in the direction of the turret
    move() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
    }

    // Draw the bullet on the canvas
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'black';
        ctx.fill();
        ctx.closePath();
    }

    // Check if the bullet is out of bounds (off the canvas)
    isOutOfBounds() {
        return this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height;
    }
}

// Enemy class with player and enemy-influenced movement
class EnemyTank {
    constructor(x, y, color = 'green') {
        this.x = x;
        this.y = y;
        this.color = color;
        this.width = 40;
        this.height = 40;
        this.angle = Math.random() * Math.PI * 2; // Initial random angle
        this.speed = 1.5;
        this.rotationSpeed = 0.03; // Rotation speed for smoother turns
        this.targetAngle = this.angle; // Target angle to rotate towards
        this.isDestroyed = false;
        this.isBackingUp = false; // Whether the enemy is backing up after hitting a wall
        this.backupTime = 0; // How long to back up after hitting a wall
    }

    // Move the enemy tank forward or backward
    move(player, enemies) {
        if (this.isBackingUp) {
            // Back up for a short duration
            this.backUp();
        } else {
            // Rotate toward the target angle smoothly
            if (Math.abs(this.angle - this.targetAngle) > 0.01) {
                this.angle += this.rotationSpeed * Math.sign(this.targetAngle - this.angle);
            }

            // Calculate the next position
            const nextX = this.x + Math.cos(this.angle) * this.speed;
            const nextY = this.y + Math.sin(this.angle) * this.speed;

            // Check for enemy collisions
            if (!this.isCollidingWithEnemy(nextX, nextY, enemies)) {
                // Move forward in the direction of the angle
                this.x = nextX;
                this.y = nextY;
            }

            // Handle boundary collisions by backing up and changing direction
            this.checkBoundaryCollision();

            // Update the target angle to be influenced by the player's position
            this.updateTargetAngle(player);
        }
    }

    // Back up for a short duration, then change direction
    backUp() {
        this.x -= Math.cos(this.angle) * this.speed; // Move backward
        this.y -= Math.sin(this.angle) * this.speed;
        this.backupTime--;

        if (this.backupTime <= 0) {
            // Once done backing up, choose a new random direction and stop backing up
            this.targetAngle = this.angle + (Math.random() * Math.PI / 2 - Math.PI / 4); // Random small rotation
            this.isBackingUp = false;
        }
    }

    // Boundary check and start backing up if necessary
    checkBoundaryCollision() {
        const margin = 20; // Margin to avoid corners
        if (this.x < margin || this.x > canvas.width - margin || this.y < margin || this.y > canvas.height - margin) {
            // Start backing up and rotate when hitting a wall
            this.isBackingUp = true;
            this.backupTime = 20; // Back up for a few frames
        }
    }

    // Check for enemy collision
    isCollidingWithEnemy(nextX, nextY, enemies) {
        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];
            if (enemy !== this && !enemy.isDestroyed) {
                const dx = nextX - enemy.x;
                const dy = nextY - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const collisionDistance = this.width / 2 + enemy.width / 2; // Sum of the radii
                if (distance < collisionDistance) {
                    return true; // Collision detected
                }
            }
        }
        return false;
    }

    // Update target angle based on player position with a weighted influence
    updateTargetAngle(player) {
        const influenceFactor = 0.25; // Degree of influence toward the player (0 = no influence, 1 = full follow)

        // Calculate the angle toward the player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const angleToPlayer = Math.atan2(dy, dx);

        // Blend random movement with influence toward the player
        const randomAngle = this.angle + (Math.random() * Math.PI / 2 - Math.PI / 4);
        this.targetAngle = (1 - influenceFactor) * randomAngle + influenceFactor * angleToPlayer;
    }

    // Draw the enemy tank
    draw() {
        if (!this.isDestroyed) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            ctx.restore();
        }
    }

    // Check for collision with a bullet
    checkCollision(bullet) {
        const dx = this.x - bullet.x;
        const dy = this.y - bullet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.width / 2 + bullet.radius;
    }
}

// Player tank
const player = new Tank(400, 300, 'blue');
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
    player.shoot(); // Fire bullet from turret
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
    player.draw();
    // Move and draw bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.move();
        bullet.draw();
        // Remove bullet if it goes out of bounds
        if (bullet.isOutOfBounds(canvas)) {
            bullets.splice(i, 1); // Remove bullet from array
        }
    }

    // Move and draw enemies
    enemies.forEach(enemy => {
        enemy.move(player, enemies);
        enemy.draw();
    });

    // Check for collisions between bullets and enemies
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (!enemy.isDestroyed && enemy.checkCollision(bullet)) {
                // Destroy the bullet and the enemy
                bullets.splice(bulletIndex, 1); // Remove bullet
                enemy.isDestroyed = true; // Destroy enemy
            }
        });
    });

    requestAnimationFrame(gameLoop);
}

gameLoop();
