import Bullet from "./bullet.js";
import RocketBullet from "./rocketBullet.js";

export default class PlayerTank {
    constructor(x, y, health = 100, color = 'blue', canvas) {
        this.x = x;
        this.y = y;
        this.width = 65;
        this.height = 40;
        this.angle = 0;
        this.speed = 2;
        this.rotationSpeed = 0.05;
        this.turretAngle = 0;
        this.color = color;
        this.velocityX = 0;
        this.velocityY = 0;
        this.health = health;
        this.maxHealth = health;
        this.isDestroyed = false;
        this.canvas = canvas;

        // Separate limits for normal bullets and rockets
        this.normalBulletLimit = 5;
        this.rocketBulletLimit = 5;

        this.currentBulletType = Bullet; // Default bullet type

        // Sound effects
        this.shootSound = new Audio('./sounds/retro-game-shot-152052.mp3'); // Ensure path is correct
        this.rocketShootSound = new Audio('./sounds/boom_c_06-102838.mp3'); // Ensure path is correct
        this.movementSound = new Audio('./sounds/tank-track-ratteling-197409.mp3');
        this.movementSound.loop = true;
        this.movementSound.volume = 0.2; // Set to 30% volume for movement sound
        this.movementSoundPlaying = false; // Track if movement sound is playing
        this.isMoving = false; // Track if tank is currently moving
    }

    // Start movement sound
    startMovementSound() {
        if (!this.movementSoundPlaying) {
            this.movementSound.currentTime = 0;
            this.movementSound.play();
            this.movementSoundPlaying = true;
        }
    }

    // Stop movement sound
    stopMovementSound() {
        if (this.movementSoundPlaying) {
            this.movementSound.pause();
            this.movementSoundPlaying = false;
        }
    }

    switchBulletType(type) {
        if (type === Bullet || type === RocketBullet) {
            this.currentBulletType = type;
        }
    }

    // Take damage and reduce health
    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.isDestroyed = true;
        }
    }

    resetMovement() {
        this.velocityX = 0;
        this.velocityY = 0;
    }

    updatePosition(x, y) {
        this.x = x;
        this.y = y;
        this.resetMovement();
    }

    // Method to draw health bar
    drawHealthBar(ctx) {
        const barWidth = 50; // Width of the health bar
        const barHeight = 5; // Height of the health bar
        const borderWidth = 1; // Thickness of the border
        const barX = this.x - barWidth / 2; // Position the health bar centered above the tank
        const barY = (this.y - this.height / 2 - 10) - 30; // Position it slightly above the tank

        // Calculate health percentage
        const healthPercentage = this.health / this.maxHealth;
        const currentBarWidth = barWidth * healthPercentage;

        // Set color based on health percentage
        let barColor = 'green';
        if (healthPercentage <= 0.5 && healthPercentage > 0.2) {
            barColor = 'yellow';
        } else if (healthPercentage <= 0.2) {
            barColor = 'red';
        }

        // Draw the border of the health bar
        ctx.fillStyle = 'black';
        ctx.fillRect(barX - borderWidth, barY - borderWidth, barWidth + 2 * borderWidth, barHeight + 2 * borderWidth);

        // Draw the background of the health bar
        ctx.fillStyle = 'gray';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Draw the current health (foreground) of the health bar
        ctx.fillStyle = barColor;
        ctx.fillRect(barX, barY, currentBarWidth, barHeight);
    }

    draw(ctx) {
        if (this.isDestroyed) return; // Don't draw if tank is destroyed
        // Draw health bar above the tank
        this.drawHealthBar(ctx);

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Draw tracks
        ctx.fillStyle = 'black';
        ctx.fillRect(-(this.width + 8) / 2, -this.height / 2 - 10, this.width + 8, 10);
        ctx.fillRect(-(this.width + 8) / 2, this.height / 2, this.width + 8, 10);

        // Draw tank body
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

        this.drawShadedFront(ctx);
        ctx.restore();

        // Draw turret and front indicator
        this.drawTurret(ctx);
        this.drawFrontIndicator(ctx);
    }

    drawTurret(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.turretAngle);

        // Draw turret base
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fillStyle = 'darkgray';
        ctx.fill();

        // Draw turret barrel
        ctx.fillStyle = 'darkgray';
        ctx.fillRect(0, -5, 40, 10); // Barrel pointing forward
        ctx.restore();
    }

    drawFrontIndicator(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Draw the front indicator
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.width / 2 + 10, 0);
        ctx.stroke();

        ctx.restore();
    }

    drawShadedFront(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, -this.height / 2, this.width / 2, this.height);
    }

    updateTurretAngle(mouseX, mouseY) {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        this.turretAngle = Math.atan2(dy, dx);
    }

    moveForward(enemies, barriers) {
        const nextX = this.x + Math.cos(this.angle) * this.speed;
        const nextY = this.y + Math.sin(this.angle) * this.speed;

        if (
            this.isWithinBounds(nextX, nextY) &&
            !this.isCollidingWithEnemy(nextX, nextY, enemies) &&
            !this.isCollidingWithBarrier(nextX, nextY, barriers)
        ) {
            this.x = nextX;
            this.y = nextY;
            this.isMoving = true; // Set moving state to true
            this.startMovementSound(); // Start sound when moving
        } else {
            this.isMoving = false; // Set moving state to false when blocked
        }
    }

    moveBackward(enemies, barriers) {
        const nextX = this.x - Math.cos(this.angle) * this.speed;
        const nextY = this.y - Math.sin(this.angle) * this.speed;

        if (
            this.isWithinBounds(nextX, nextY) &&
            !this.isCollidingWithEnemy(nextX, nextY, enemies) &&
            !this.isCollidingWithBarrier(nextX, nextY, barriers)
        ) {
            this.x = nextX;
            this.y = nextY;
            this.isMoving = true; // Set moving state to true
            this.startMovementSound(); // Start sound when moving
        } else {
            this.isMoving = false; // Set moving state to false when blocked
        }
    }

    rotateLeft() {
        this.angle -= this.rotationSpeed;
        this.isMoving = true; // Set moving state to true
        this.startMovementSound(); // Start sound when rotating
    }

    rotateRight() {
        this.angle += this.rotationSpeed;
        this.isMoving = true; // Set moving state to true
        this.startMovementSound(); // Start sound when rotating
    }

    // Call this method at the end of every update to stop sound when no movement occurs
    checkIfStopped() {
        if (!this.isMoving) {
            this.stopMovementSound();  // Stop sound if no movement
        }
        this.isMoving = false;  // Reset movement state after each frame
    }

    // Ensure you stop the movement sound when necessary
    stopAllSounds() {
        this.stopMovementSound();
    }

    shoot(bullets) {
        // Check bullet limit based on the selected bullet type
        if (this.currentBulletType === Bullet && this.normalBulletLimit > 0) {
            const bulletSpeed = 5;
            const bulletX = this.x + Math.cos(this.turretAngle) * (this.width / 2);
            const bulletY = this.y + Math.sin(this.turretAngle) * (this.height / 2);
            const bullet = new Bullet(bulletX, bulletY, this.turretAngle, bulletSpeed, 10, 2);
            bullets.push(bullet);
            this.normalBulletLimit--; // Decrease normal bullet count

            // Play the shooting sound
            this.shootSound.currentTime = 0;  // Reset sound to play again if needed
            this.shootSound.play();
        } else if (this.currentBulletType === RocketBullet && this.rocketBulletLimit > 0) {
            const bulletSpeed = 5;
            const bulletX = this.x + Math.cos(this.turretAngle) * (this.width / 2);
            const bulletY = this.y + Math.sin(this.turretAngle) * (this.height / 2);
            const bullet = new RocketBullet(bulletX, bulletY, this.turretAngle, bulletSpeed, 25);
            bullets.push(bullet);
            this.rocketBulletLimit--; // Decrease rocket bullet count

            this.rocketShootSound.currentTime = 0;  // Reset sound to play again if needed
            this.rocketShootSound.play();
        }
    }

    isWithinBounds(nextX, nextY) {
        const margin = this.width / 2;
        return nextX > margin && nextX < this.canvas.width - margin && nextY > margin && nextY < this.canvas.height - margin;
    }

    snapToBoundary() {
        const margin = this.width / 2;
        if (this.x < margin) this.x = margin;
        if (this.x > this.canvas.width - margin) this.x = this.canvas.width - margin;
        if (this.y < margin) this.y = margin;
        if (this.y > this.canvas.height - margin) this.y = this.canvas.height - margin;
    }

    isCollidingWithEnemy(nextX, nextY, enemies) {
        for (const enemy of enemies) {
            if (!enemy.isDestroyed) {
                const dx = nextX - enemy.x;
                const dy = nextY - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const collisionDistance = this.width / 2 + enemy.width / 2;
                if (distance < collisionDistance) {
                    return true;
                }
            }
        }
        return false;
    }

    isCollidingWithBarrier(nextX, nextY, barriers) {
        for (const barrier of barriers) {
            if (barrier.isCollidingWithTank({ x: nextX, y: nextY, width: this.width, height: this.height })) {
                return true;
            }
        }
        return false;
    }
}
