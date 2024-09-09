class Barrier {
    constructor(x, y, width, height, health = 100, color = 'gray') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.health = health; // New health property for barriers
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

    // Handle bullet collision and reduce barrier health
    handleBulletCollision(bullet) {
        const barrierLeft = this.x;
        const barrierRight = this.x + this.width;
        const barrierTop = this.y;
        const barrierBottom = this.y + this.height;

        // Determine if the bullet hit from left/right or top/bottom
        const hitFromLeftOrRight = bullet.x < barrierLeft || bullet.x > barrierRight;
        const hitFromTopOrBottom = bullet.y < barrierTop || bullet.y > barrierBottom;

        // Horizontal ricochet (left or right sides of the barrier)
        if (hitFromLeftOrRight) {
            bullet.angle = Math.PI - bullet.angle; // Reflect horizontally
        }
        // Vertical ricochet (top or bottom sides of the barrier)
        else if (hitFromTopOrBottom) {
            bullet.angle = -bullet.angle; // Reflect vertically
        }

        bullet.ricochetCount++; // Increment ricochet count
        this.takeDamage(bullet.damage); // Barrier takes damage based on bullet

        // Return true to destroy the bullet if it exceeds ricochet count
        return bullet.ricochetCount >= bullet.maxRicochetCount;
    }

    // Apply damage to the barrier and destroy it if health reaches zero
    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.isDestroyed = true;
            console.log("Barrier destroyed!");
        }
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
