export default class Explosion {
    constructor(x, y, maxRadius = 30, duration = 30) {
        this.x = x; // The position of the explosion
        this.y = y;
        this.radius = 0; // Start with no radius
        this.maxRadius = maxRadius; // Maximum size of the explosion
        this.duration = duration; // Total frames the explosion lasts
        this.life = 0; // How long the explosion has been active
    }

    // Draw the explosion on the canvas
    draw(ctx) {
        // Calculate how large the explosion is based on its life
        let progress = this.life / this.duration;
        this.radius = this.maxRadius * progress; // The explosion expands over time

        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 165, 0, ${1 - progress})`; // Fades out over time
        ctx.fill();
        ctx.restore();
    }

    // Check if the explosion is over (i.e., fully expanded and faded out)
    isOver() {
        return this.life >= this.duration;
    }

    // Update the explosion
    update() {
        this.life++;
    }
}
