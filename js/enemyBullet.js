class EnemyBullet extends Bullet {
    constructor(x, y, angle, speed, maxRicochetCount) {
        super(x, y, angle, speed, maxRicochetCount)
        this.radius = 5;
        this.ricochetCount = 0; // Count of ricochets

    }

    move() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
    }

    // Draw the bullet as a perfect circle without distortion
    draw(ctx) {
        ctx.save(); // Save current canvas state to prevent unwanted transformations
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); // Use a single circle
        ctx.fillStyle = 'red'; // Color of the bullet
        ctx.fill();
        ctx.closePath();
        ctx.restore(); // Restore canvas state to avoid any transformation issues
    }

    // Ricochet logic for canvas boundaries and barriers
    ricochetIfNeeded(canvas, barriers) {
        super.ricochetIfNeeded(canvas, barriers);
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
