class PlayerTank {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.width = 40;
        this.height = 40;
        this.angle = 0;
        this.turretAngle = 0;
        this.speed = 2;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        this.drawFrontIndicator(ctx);
        ctx.restore();
        this.drawTurret(ctx);
    }

    drawTurret(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.turretAngle);
        ctx.fillStyle = 'darkgray';
        ctx.fillRect(-5, -10, 30, 20);
        ctx.restore();
    }

    drawFrontIndicator(ctx) {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.width / 2 + 10, 0);
        ctx.stroke();
    }

    moveForward(enemies) {
        const nextX = this.x + Math.cos(this.angle) * this.speed;
        const nextY = this.y + Math.sin(this.angle) * this.speed;
        if (this.isWithinBounds(nextX, nextY) && !this.isCollidingWithEnemy(nextX, nextY, enemies)) {
            this.x = nextX;
            this.y = nextY;
        }
    }

    moveBackward(enemies) {
        const nextX = this.x - Math.cos(this.angle) * this.speed;
        const nextY = this.y - Math.sin(this.angle) * this.speed;
        if (this.isWithinBounds(nextX, nextY) && !this.isCollidingWithEnemy(nextX, nextY, enemies)) {
            this.x = nextX;
            this.y = nextY;
        }
    }

    rotateLeft() {
        this.angle -= 0.05;
    }

    rotateRight() {
        this.angle += 0.05;
    }

    updateTurretAngle(mouseX, mouseY) {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        this.turretAngle = Math.atan2(dy, dx);
    }

    shoot(bullets) {
        const bulletSpeed = 5;
        const bulletX = this.x + Math.cos(this.turretAngle) * (this.width / 2);
        const bulletY = this.y + Math.sin(this.turretAngle) * (this.height / 2);
        const bullet = new Bullet(bulletX, bulletY, this.turretAngle, bulletSpeed);
        bullets.push(bullet);
    }

    isWithinBounds(nextX, nextY) {
        const margin = this.width / 2;
        return nextX > margin && nextX < canvas.width - margin && nextY > margin && nextY < canvas.height - margin;
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
}
