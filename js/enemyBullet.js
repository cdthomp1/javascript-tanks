class EnemyBullet {
    constructor(x, y, angle, speed, maxRicochetCount) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.radius = 5;
        this.ricochetCount = 0; // Count of ricochets
        this.maxRicochetCount = maxRicochetCount ?? 2;
    }

    move() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.closePath();
    }

    // Ricochet logic for canvas boundaries and barriers
    ricochetIfNeeded(canvas, barriers) {
        // Check if bullet hits the canvas boundaries (left or right)
        if (this.x - this.radius <= 0 || this.x + this.radius >= canvas.width) {
            if (this.ricochetCount < 2) {
                this.angle = Math.PI - this.angle; // Reflect horizontally
                this.ricochetCount++; // Increment ricochet count
            } else {
                return true; // Destroy the bullet after 2 ricochets
            }
        }

        // Check if bullet hits the canvas boundaries (top or bottom)
        if (this.y - this.radius <= 0 || this.y + this.radius >= canvas.height) {
            if (this.ricochetCount < 2) {
                this.angle = -this.angle; // Reflect vertically
                this.ricochetCount++; // Increment ricochet count
            } else {
                return true; // Destroy the bullet after 2 ricochets
            }
        }

        // Check if bullet hits a barrier
        for (const barrier of barriers) {
            if (barrier.isCollidingWithBullet(this)) {
                if (this.ricochetCount < this.maxRicochetCount) {
                    // Reflect bullet based on the side it hits
                    if (this.x > barrier.x && this.x < barrier.x + barrier.width) {
                        this.angle = -this.angle; // Vertical reflection
                    } else {
                        this.angle = Math.PI - this.angle; // Horizontal reflection
                    }
                    this.ricochetCount++; // Increment ricochet count
                } else {
                    return true; // Destroy the bullet after 2 ricochets
                }
            }
        }

        return false; // Bullet is not destroyed
    }

    // Check if the bullet is colliding with the player
    isCollidingWithPlayer(player) {
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const collisionDistance = this.radius + player.width / 2; // Bullet radius + player tank radius
        return distance < collisionDistance;
    }

    // Check if the bullet is out of bounds
    isOutOfBounds(canvas) {
        return this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height;
    }
}
