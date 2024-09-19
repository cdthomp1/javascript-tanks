import Bullet from "./bullet.js";

export default class RocketBullet extends Bullet {
    constructor(x, y, angle, speed, damage) {
        super(x, y, angle, speed, damage, 0); // Rockets don't ricochet
        this.bodyWidth = 10;   // Width of the rocket's body
        this.bodyLength = 30;  // Length of the rocket's body
        this.noseLength = 15;  // Length of the nose cone
        this.finWidth = 5;     // Width of the fins
        this.finHeight = 10;   // Height of the fins
        this.speed = 10
        this.type = "rocket"
    }

    draw(ctx) {
        ctx.save();

        // Translate to the rocket's current position
        ctx.translate(this.x, this.y);

        // Rotate the canvas to the rocket's angle
        ctx.rotate(this.angle + Math.PI / 2); // Correct the rotation

        // Draw flames at the back of the rocket
        this.drawFlames(ctx);

        // Draw the rocket body (red rectangle)
        ctx.fillStyle = 'red';
        ctx.fillRect(-this.bodyWidth / 2, -this.bodyLength, this.bodyWidth, this.bodyLength);

        // Draw the rocket tip (gray triangle)
        ctx.fillStyle = 'gray';
        ctx.beginPath();
        ctx.moveTo(-this.bodyWidth / 2, -this.bodyLength); // Left side of the tip
        ctx.lineTo(this.bodyWidth / 2, -this.bodyLength);  // Right side of the tip
        ctx.lineTo(0, -this.bodyLength - this.noseLength); // Tip of the rocket (top)
        ctx.closePath();
        ctx.fill();

        // Draw rocket fins (dark gray triangles)
        ctx.fillStyle = 'darkgray';

        // Left fin
        ctx.beginPath();
        ctx.moveTo(-this.bodyWidth / 2, 0); // Attach to the base of the rocket
        ctx.lineTo(-this.bodyWidth / 2 - this.finWidth, this.finHeight); // Left side
        ctx.lineTo(-this.bodyWidth / 2, this.finHeight); // Connect back to the body
        ctx.closePath();
        ctx.fill();

        // Right fin
        ctx.beginPath();
        ctx.moveTo(this.bodyWidth / 2, 0); // Attach to the base of the rocket
        ctx.lineTo(this.bodyWidth / 2 + this.finWidth, this.finHeight); // Right side
        ctx.lineTo(this.bodyWidth / 2, this.finHeight); // Connect back to the body
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    // Function to draw flames at the back of the rocket
    drawFlames(ctx) {
        ctx.save();

        // Move to the back of the rocket (0, 0 is the base)
        ctx.translate(0, this.bodyLength / 2);

        // Randomize the flame length to create an animation effect
        const flameLength = 10 + Math.random() * 10;

        // Draw the flame (yellow outer flame)
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.moveTo(-5, 0);  // Left side of the flame
        ctx.lineTo(0, flameLength);  // Tip of the flame
        ctx.lineTo(5, 0);  // Right side of the flame
        ctx.closePath();
        ctx.fill();

        // Draw the inner flame (orange inside the yellow)
        const innerFlameLength = flameLength * 0.6;  // Slightly smaller inner flame
        ctx.fillStyle = 'orange';
        ctx.beginPath();
        ctx.moveTo(-3, 0);  // Left side of the inner flame
        ctx.lineTo(0, innerFlameLength);  // Tip of the inner flame
        ctx.lineTo(3, 0);  // Right side of the inner flame
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }




    // You can override the `move` method if you want rockets to have different movement behavior
    move() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
    }
}