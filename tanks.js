const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Tank class with turret and front indicator
class Tank {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.width = 40;
        this.height = 40;
        this.angle = 0;  // Tank body angle
        this.turretAngle = 0; // Turret angle
        this.speed = 2;
    }

    draw() {
        // Draw the tank body
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

        // Draw the front indicator
        this.drawFrontIndicator();

        ctx.restore();

        // Draw the turret
        this.drawTurret();
    }

    drawTurret() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.turretAngle);
        ctx.fillStyle = 'darkgray';
        ctx.fillRect(-5, -10, 30, 20); // Simple rectangle as turret
        ctx.restore();
    }

    drawFrontIndicator() {
        // Draw a small line to indicate the front of the tank
        ctx.strokeStyle = 'red';  // Set color of the indicator
        ctx.lineWidth = 2;        // Thickness of the indicator line
        ctx.beginPath();
        ctx.moveTo(0, 0);         // Start at the center of the tank
        ctx.lineTo(this.width / 2 + 10, 0); // Draw a line extending in front of the tank
        ctx.stroke();
    }

    moveForward() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
    }

    moveBackward() {
        this.x -= Math.cos(this.angle) * this.speed;
        this.y -= Math.sin(this.angle) * this.speed;
    }

    rotateLeft() {
        this.angle -= 0.05;
    }

    rotateRight() {
        this.angle += 0.05;
    }

    // Update turret angle based on mouse position
    updateTurretAngle(mouseX, mouseY) {
        let dx = mouseX - this.x;
        let dy = mouseY - this.y;
        this.turretAngle = Math.atan2(dy, dx);
    }
}

// Player tank
const player = new Tank(400, 300, 'blue');

// Controls
const keys = {};
window.addEventListener('keydown', (e) => { keys[e.key] = true; });
window.addEventListener('keyup', (e) => { keys[e.key] = false; });

// Mouse movement
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Update the turret angle to point towards the mouse
    player.updateTurretAngle(mouseX, mouseY);
});

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Handle controls
    if (keys['w']) player.moveForward();
    if (keys['s']) player.moveBackward();
    if (keys['a']) player.rotateLeft();
    if (keys['d']) player.rotateRight();

    // Draw the player tank and its turret
    player.draw();

    requestAnimationFrame(gameLoop);
}

gameLoop();
