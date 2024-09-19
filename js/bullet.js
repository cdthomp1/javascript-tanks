export default class Bullet {
    constructor(x, y, angle, speed, damage, maxRicochetCount) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.damage = damage ?? 10; // New damage property
        this.radius = 5;
        this.maxRicochetCount = maxRicochetCount ?? 2;
        this.ricochetCount = 0; // Count of ricochets
        this.type = 'bullet'
    }

    // Move the bullet forward based on its angle and speed
    move() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
    }

    // Draw the bullet on the canvas
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'black'; // Default color for a regular bullet
        ctx.fill();
        ctx.closePath();
    }

    // Check if the bullet should ricochet off canvas boundaries
    ricochetIfNeeded(canvas) {
        let ricocheted = false;

        // Check horizontal boundary (left or right)
        if (this.x - this.radius <= 0 || this.x + this.radius >= canvas.width) {
            this.angle = Math.PI - this.angle; // Reflect horizontally
            ricocheted = true;
        }

        // Check vertical boundary (top or bottom)
        if (this.y - this.radius <= 0 || this.y + this.radius >= canvas.height) {
            this.angle = -this.angle; // Reflect vertically
            ricocheted = true;
        }

        if (ricocheted) {
            this.ricochetCount++;
        }

        // Return true if the bullet has ricocheted more than allowed
        return this.ricochetCount === this.maxRicochetCount + 1;
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

    // Deal damage to a tank
    dealDamage(tank) {
        if (this.isCollidingWithTank(tank)) {
            tank.takeDamage(this.damage); // Apply bullet damage to the tank
        }
    }
}
