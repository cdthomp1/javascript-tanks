class AmmoPack {
    constructor(x, y, ammoAmount = 5) {
        this.x = x;
        this.y = y;
        this.width = 45;  // Width of the ammo crate
        this.height = 35; // Height of the ammo crate
        this.ammoAmount = ammoAmount; // How much ammo this pack provides
    }

    // Draw the ammo crate on the canvas
    draw(ctx) {
        // Draw the crate body (rectangle)
        ctx.fillStyle = 'brown'; // Brown color for the crate
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);

        // Draw crate stripes (to make it look more like a crate)
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;

        // Vertical stripes
        ctx.beginPath();
        ctx.moveTo(this.x - this.width / 4, this.y - this.height / 2);
        ctx.lineTo(this.x - this.width / 4, this.y + this.height / 2);
        ctx.moveTo(this.x + this.width / 4, this.y - this.height / 2);
        ctx.lineTo(this.x + this.width / 4, this.y + this.height / 2);
        ctx.stroke();

        // Horizontal stripes
        ctx.beginPath();
        ctx.moveTo(this.x - this.width / 2, this.y);
        ctx.lineTo(this.x + this.width / 2, this.y);
        ctx.stroke();

        // Draw "AMMO" text in the middle of the crate
        ctx.font = "12px Arial";
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText("AMMO", this.x, this.y + 4); // Center text on crate
    }
    // Check if the player has collided with the ammo crate
    isCollidingWithTank(tank) {
        const dx = this.x - tank.x;
        const dy = this.y - tank.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.width / 2 + tank.width / 2;
    }
}
