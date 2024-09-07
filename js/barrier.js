class Barrier {
    constructor(x, y, width, height, color = 'gray') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.isDestroyed = false;
    }

    // Draw the barrier on the canvas
    draw(ctx) {
        if (!this.isDestroyed) {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    // Check if the bullet is colliding with the barrier
    isCollidingWithBullet(bullet) {
        const bulletLeft = bullet.x - bullet.radius;
        const bulletRight = bullet.x + bullet.radius;
        const bulletTop = bullet.y - bullet.radius;
        const bulletBottom = bullet.y + bullet.radius;

        const barrierLeft = this.x;
        const barrierRight = this.x + this.width;
        const barrierTop = this.y;
        const barrierBottom = this.y + this.height;

        return (
            bulletRight > barrierLeft &&
            bulletLeft < barrierRight &&
            bulletBottom > barrierTop &&
            bulletTop < barrierBottom
        );
    }

    // Handle bullet collision: regular barriers will cause ricochet
    handleBulletCollision(bullet) {
        // Regular barriers ricochet bullets
        const withinVerticalRange = bullet.x > this.x && bullet.x < this.x + this.width;
        const withinHorizontalRange = bullet.y > this.y && bullet.y < this.y + this.height;

        if (withinVerticalRange) {
            bullet.angle = -bullet.angle; // Vertical reflection
        } else if (withinHorizontalRange) {
            bullet.angle = Math.PI - bullet.angle; // Horizontal reflection
        }

        bullet.ricocheted = true; // Mark the bullet as ricocheted
    }

    // Check if the tank is colliding with the barrier
    isCollidingWithTank(tank) {
        const tankLeft = tank.x - tank.width / 2;
        const tankRight = tank.x + tank.width / 2;
        const tankTop = tank.y - tank.height / 2;
        const tankBottom = tank.y + tank.height / 2;

        const barrierLeft = this.x;
        const barrierRight = this.x + this.width;
        const barrierTop = this.y;
        const barrierBottom = this.y + this.height;

        return (
            tankRight > barrierLeft &&
            tankLeft < barrierRight &&
            tankBottom > barrierTop &&
            tankTop < barrierBottom
        );
    }
}