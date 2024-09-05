class Barrier {
    constructor(x, y, width, height, color = 'gray') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    // Draw the barrier on the canvas
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    // Check if the tank is colliding with the barrier
    isCollidingWithTank(tank) {
        const tankLeft = tank.x - tank.width / 2;
        const tankRight = tank.x + tank.width / 2;
        const tankTop = tank.y - tank.height / 2;
        const tankBottom = tank.y + tank.height / 2;

        const barrierLeft = this.x;
        const barrierRight = this.x + this.width;
        const barrierTop = this.y;
        const barrierBottom = this.y + this.height;

        return (
            tankRight > barrierLeft &&
            tankLeft < barrierRight &&
            tankBottom > barrierTop &&
            tankTop < barrierBottom
        );
    }
}
