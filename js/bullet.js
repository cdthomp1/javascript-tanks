class Bullet {
    constructor(x, y, angle, speed) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.radius = 5;
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
