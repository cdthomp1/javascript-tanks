class Bullet {
    constructor(x, y, angle, speed) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.radius = 5;
        this.ricocheted = false; // Tracks if the bullet has already ricocheted
    }

    move() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'black';
        ctx.fill();
        ctx.closePath();
    }

    // Ricochet logic for canvas boundaries and walls
    ricochetIfNeeded(canvas, barriers) {
        // Check if bullet hits the canvas boundaries (left or right)
        if (this.x - this.radius <= 0 || this.x + this.radius >= canvas.width) {
            if (!this.ricocheted) {
                this.angle = Math.PI - this.angle; // Reflect horizontally
                this.ricocheted = true; // Mark bullet as ricocheted
            } else {
                return true; // Destroy the bullet after the second collision
            }
        }

        // Check if bullet hits the canvas boundaries (top or bottom)
        if (this.y - this.radius <= 0 || this.y + this.radius >= canvas.height) {
            if (!this.ricocheted) {
                this.angle = -this.angle; // Reflect vertically
                this.ricocheted = true; // Mark bullet as ricocheted
            } else {
                return true; // Destroy the bullet after the second collision
            }
        }

        // Check if bullet hits a barrier
        for (const barrier of barriers) {
            if (barrier.isCollidingWithBullet(this)) {
                if (!this.ricocheted) {
                    // Handle ricochet based on which side of the barrier the bullet hits
                    if (this.x > barrier.x && this.x < barrier.x + barrier.width) {
                        this.angle = -this.angle; // Vertical reflection
                    } else {
                        this.angle = Math.PI - this.angle; // Horizontal reflection
                    }
                    this.ricocheted = true; // Mark bullet as ricocheted
                } else {
                    return true; // Destroy the bullet after the second collision
                }
            }
        }

        return false; // Bullet is not destroyed
    }

    // Check if the bullet is out of bounds (off the canvas)
    isOutOfBounds(canvas) {
        return this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height;
    }

    // Check if the bullet is colliding with a tank (player or enemy)
    isCollidingWithTank(tank) {
        const dx = this.x - tank.x;
        const dy = this.y - tank.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const collisionDistance = this.radius + tank.width / 2; // Radius of bullet + radius of tank
        return distance < collisionDistance;
    }
}
