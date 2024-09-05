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

    // Check if the bullet is out of bounds (off the canvas)
    isOutOfBounds(canvas) {
        return this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height;
    }

    // Ricochet logic
    ricochetIfNeeded(canvas) {
        // Check for wall collisions
        if (this.x - this.radius <= 0 || this.x + this.radius >= canvas.width) {
            // Horizontal wall collision (left or right)
            if (!this.ricocheted) {
                this.angle = Math.PI - this.angle; // Reverse horizontal direction
                this.ricocheted = true; // Mark bullet as ricocheted
            } else {
                return true; // Bullet should be destroyed after second collision
            }
        }
        if (this.y - this.radius <= 0 || this.y + this.radius >= canvas.height) {
            // Vertical wall collision (top or bottom)
            if (!this.ricocheted) {
                this.angle = -this.angle; // Reverse vertical direction
                this.ricocheted = true; // Mark bullet as ricocheted
            } else {
                return true; // Bullet should be destroyed after second collision
            }
        }
        return false; // Bullet should not be destroyed
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
