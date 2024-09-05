const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Tank class with turret and front indicator
class Tank {
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

    moveForward() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
    }

    moveBackward() {
        this.x -= Math.cos(this.angle) * this.speed;
        this.y -= Math.sin(this.angle) * this.speed;
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

// Enemy class
class EnemyTank {
    constructor(x, y, color = 'green') {
        this.x = x;
        this.y = y;
        this.color = color;
        this.width = 40;
        this.height = 40;
        this.isDestroyed = false;
    }

    // Draw the enemy tank
    draw() {
        if (!this.isDestroyed) {
            ctx.save();
            ctx.translate(this.x, this.y);
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
    if (keys['w']) player.moveForward();
    if (keys['s']) player.moveBackward();
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
        if (bullet.isOutOfBounds()) {
            bullets.splice(i, 1); // Remove bullet from array
        }
    }

    // Draw enemies
    enemies.forEach(enemy => {
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
