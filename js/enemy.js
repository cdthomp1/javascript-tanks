class EnemyTank {
    constructor(x, y, color = 'green') {
        this.x = x;
        this.y = y;
        this.color = color;
        this.width = 65; // Width of the tank body
        this.height = 40; // Height of the tank body
        this.angle = Math.random() * Math.PI * 2; // Body angle
        this.turretAngle = Math.random() * Math.PI * 2; // Turret angle
        this.speed = 1.5;
        this.rotationSpeed = 0.03;
        this.targetAngle = this.angle;
        this.isDestroyed = false;
        this.isBackingUp = false;
        this.backupTime = 0;
        this.shootCooldown = 100; // Cooldown to control shooting frequency
    }

    // Move the enemy tank with collision detection
    move(player, enemies, barriers, enemyBullets) {
        if (this.isBackingUp) {
            this.backUp();
        } else {
            // Smoothly rotate towards target angle
            if (Math.abs(this.angle - this.targetAngle) > 0.01) {
                this.angle += this.rotationSpeed * Math.sign(this.targetAngle - this.angle);
            }

            const nextX = this.x + Math.cos(this.angle) * this.speed;
            const nextY = this.y + Math.sin(this.angle) * this.speed;

            // Check for collisions with enemies, boundaries, and barriers
            if (!this.isCollidingWithEnemy(nextX, nextY, enemies) &&
                this.isWithinBounds(nextX, nextY) &&
                !this.isCollidingWithBarrier(nextX, nextY, barriers)) {
                this.x = nextX;
                this.y = nextY;
            } else {
                // If collision detected, back up
                this.isBackingUp = true;
                this.backupTime = 20; // Back up for 20 frames
            }

            // Update turret angle to aim at the player
            this.updateTurretAngle(player);

            // Shoot bullets at the player
            this.shoot(enemyBullets);

            // Update target angle for future movement
            this.updateTargetAngle(player);
        }
    }

    // Draw the enemy tank and its turret
    draw(ctx) {
        if (!this.isDestroyed) {
            // Draw the tank body
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);

            // Draw tracks on the top and bottom
            ctx.fillStyle = 'black';
            ctx.fillRect(-(this.width + 8) / 2, -this.height / 2 - 10, this.width + 8, 10); // Top track
            ctx.fillRect(-(this.width + 8) / 2, this.height / 2, this.width + 8, 10); // Bottom track

            // Draw the main body of the tank
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

            ctx.restore();

            // Draw the turret on top of the tank body
            this.drawTurret(ctx);
        }
    }

    // Draw the turret on top of the enemy tank
    drawTurret(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.turretAngle); // Rotate turret independently from the body
        ctx.fillStyle = 'darkgray';
        ctx.fillRect(-5, -10, 30, 20); // Simple rectangle as the turret
        ctx.restore();
    }

    // Update the turret angle to aim at the player
    updateTurretAngle(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        this.turretAngle = Math.atan2(dy, dx); // Aim turret at player
    }

    // Enemy tank shoots a bullet at the player
    shoot(enemyBullets) {
        // if (this.shootCooldown <= 0) {
        //     const bulletSpeed = 4;
        //     const bulletX = this.x + Math.cos(this.turretAngle) * (this.width / 2);
        //     const bulletY = this.y + Math.sin(this.turretAngle) * (this.height / 2);
        //     const bullet = new EnemyBullet(bulletX, bulletY, this.turretAngle, bulletSpeed);
        //     enemyBullets.push(bullet); // Add bullet to the array
        //     this.shootCooldown = 100; // Reset cooldown after shooting
        // } else {
        //     this.shootCooldown--; // Decrease cooldown
        // }
    }

    // Method to handle backing up if the enemy hits an obstacle
    backUp() {
        this.x -= Math.cos(this.angle) * this.speed; // Move backward
        this.y -= Math.sin(this.angle) * this.speed;
        this.backupTime--;

        if (this.backupTime <= 0) {
            this.targetAngle = this.angle + (Math.random() * Math.PI / 2 - Math.PI / 4); // Rotate randomly
            this.isBackingUp = false; // Stop backing up
        }
    }

    // Check if the tank will collide with another enemy
    isCollidingWithEnemy(nextX, nextY, enemies) {
        for (const enemy of enemies) {
            if (enemy !== this && !enemy.isDestroyed) {
                const dx = nextX - enemy.x;
                const dy = nextY - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const collisionDistance = this.width / 2 + enemy.width / 2;
                if (distance < collisionDistance) {
                    return true; // Collision detected
                }
            }
        }
        return false; // No collision
    }

    // Check if the tank is colliding with a barrier
    isCollidingWithBarrier(nextX, nextY, barriers) {
        for (const barrier of barriers) {
            if (barrier.isCollidingWithTank({
                x: nextX,
                y: nextY,
                width: this.width,
                height: this.height
            })) {
                return true; // Collision detected
            }
        }
        return false; // No collision
    }

    // Check if the tank is within the canvas boundaries
    isWithinBounds(nextX, nextY) {
        const margin = this.width / 2;
        return nextX > margin && nextX < canvas.width - margin && nextY > margin && nextY < canvas.height - margin;
    }

    // Update target angle based on player's position (with some randomness)
    updateTargetAngle(player) {
        const influenceFactor = 0.25; // How much the tank should follow the player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const angleToPlayer = Math.atan2(dy, dx);
        const randomAngle = this.angle + (Math.random() * Math.PI / 2 - Math.PI / 4);
        this.targetAngle = (1 - influenceFactor) * randomAngle + influenceFactor * angleToPlayer;
    }
}
