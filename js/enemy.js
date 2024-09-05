class EnemyTank {
    constructor(x, y, color = 'green') {
        this.x = x;
        this.y = y;
        this.color = color;
        this.width = 40;
        this.height = 40;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = 1.5;
        this.rotationSpeed = 0.03;
        this.targetAngle = this.angle;
        this.isDestroyed = false;
        this.isBackingUp = false;
        this.backupTime = 0;
    }

    move(player, enemies) {
        if (this.isBackingUp) {
            this.backUp();
        } else {
            // Smoothly rotate towards target angle
            if (Math.abs(this.angle - this.targetAngle) > 0.01) {
                this.angle += this.rotationSpeed * Math.sign(this.targetAngle - this.angle);
            }

            const nextX = this.x + Math.cos(this.angle) * this.speed;
            const nextY = this.y + Math.sin(this.angle) * this.speed;

            // Check for enemy collisions and boundaries
            if (!this.isCollidingWithEnemy(nextX, nextY, enemies) && this.isWithinBounds(nextX, nextY)) {
                this.x = nextX;
                this.y = nextY;
            } else {
                this.snapToBoundary();  // Prevent going beyond boundaries
            }

            // Update the target angle to move towards the player
            this.updateTargetAngle(player);
        }
    }

    draw(ctx) {
        if (!this.isDestroyed) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            ctx.restore();
        }
    }

    isWithinBounds(nextX, nextY) {
        const margin = this.width / 2;
        return nextX > margin && nextX < canvas.width - margin && nextY > margin && nextY < canvas.height - margin;
    }

    snapToBoundary() {
        // Ensure the enemy is snapped back to the nearest boundary if it moves out of bounds
        const margin = this.width / 2;
        if (this.x < margin) this.x = margin;
        if (this.x > canvas.width - margin) this.x = canvas.width - margin;
        if (this.y < margin) this.y = margin;
        if (this.y > canvas.height - margin) this.y = canvas.height - margin;
    }

    isCollidingWithEnemy(nextX, nextY, enemies) {
        for (const enemy of enemies) {
            if (enemy !== this && !enemy.isDestroyed) {
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

    updateTargetAngle(player) {
        const influenceFactor = 0.25;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const angleToPlayer = Math.atan2(dy, dx);
        const randomAngle = this.angle + (Math.random() * Math.PI / 2 - Math.PI / 4);
        this.targetAngle = (1 - influenceFactor) * randomAngle + influenceFactor * angleToPlayer;
    }

    backUp() {
        this.x -= Math.cos(this.angle) * this.speed;
        this.y -= Math.sin(this.angle) * this.speed;
        this.backupTime--;

        if (this.backupTime <= 0) {
            this.targetAngle = this.angle + (Math.random() * Math.PI / 2 - Math.PI / 4);
            this.isBackingUp = false;
        }
    }
}
