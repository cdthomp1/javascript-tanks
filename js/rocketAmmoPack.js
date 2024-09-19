import AmmoPack from "./ammoPack.js";

export default class RocketAmmoPack extends AmmoPack {
    constructor(x, y, ammoAmount = 5) {
        super(x, y, ammoAmount)
        this.x = x;
        this.y = y;
        this.width = 65;  // Width of the ammo crate
        this.height = 35; // Height of the ammo crate
        this.ammoAmount = ammoAmount; // How much ammo this pack provides
        this.type = "rocket"
    }

    // Draw the ammo crate on the canvas
    draw(ctx) {
        // Draw the crate body (rectangle)
        ctx.fillStyle = 'rgb(255, 0, 0)'; // Brown color for the crate
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
        ctx.fillText("ROCKET", this.x, this.y + 4); // Center text on crate
    }
    // Check if the player has collided with the ammo crate
    isCollidingWithTank(tank) {
        return super.isCollidingWithTank(tank)
    }
}
