const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Tank constructor
class Tank {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.width = 40;
        this.height = 40;
        this.angle = 0;
        this.speed = 2;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
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
}

// Player tank
const player = new Tank(400, 300, 'blue');

// Controls
const keys = {};
window.addEventListener('keydown', (e) => { keys[e.key] = true; });
window.addEventListener('keyup', (e) => { keys[e.key] = false; });

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Handle controls
    if (keys['ArrowUp']) player.moveForward();
    if (keys['ArrowDown']) player.moveBackward();
    if (keys['ArrowLeft']) player.rotateLeft();
    if (keys['ArrowRight']) player.rotateRight();

    // Draw the player tank
    player.draw();

    requestAnimationFrame(gameLoop);
}

gameLoop();
