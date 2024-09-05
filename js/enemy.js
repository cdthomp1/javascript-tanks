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
            if (Math.abs(this.angle - this.targetAngle) > 0.01) {
                this.angle += this.rotationSpeed * Math.sign(this.targetAngle - this.angle);
            }

            const nextX = this.x + Math.cos(this.angle) * this.speed;
            const nextY = this.y + Math.sin(this.angle) * this.speed;

            if (!this.isCollidingWithEnemy(nextX, nextY, enemies)) {
                this.x = nextX;
                this.y = nextY;
            }

            this.checkBoundaryCollision();
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

    backUp() {
        this.x -= Math.cos(this.angle) * this.speed;
        this.y -= Math.sin(this.angle) * this.speed;
        this.backupTime--;
        if (this.backupTime <= 0) {
            this.targetAngle = this.angle + (Math.random() * Math.PI / 2 - Math.PI / 4);
            this.isBackingUp = false;
        }
    }

    checkBoundaryCollision() {
        const margin = 20;
        if (this.x < margin || this.x > canvas.width - margin || this.y < margin || this.y > canvas.height - margin) {
            this.isBackingUp = true;
            this.backupTime = 20;
        }
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
}
