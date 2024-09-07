class Rubble extends Barrier {
    constructor(x, y, width, height, color = 'brown') {
        super(x, y, width, height, color);
        this.timesHit = 0;
        this.hitLimit = 2;
        this.isDestroyed = false;
        this.hit = false;
    }

    isCollidingWithBullet(bullet) {
        // Check if the bullet hit the rubble
        const collision = super.isCollidingWithBullet(bullet);
        if (collision) {
            if (!this.hit) {
                // Only count the hit if it's not been processed in this frame yet
                this.timesHit += 1;
                console.log(`Hit Count: ${this.timesHit} / ${this.hitLimit}`);
                this.hit = true; // Mark that this rubble has been hit in this frame
                this.color = 'rgb(71,40,36)'
                if (this.timesHit >= this.hitLimit) {
                    console.log('Rubble destroyed!');
                    this.isDestroyed = true;
                }
            }
            return true; // Bullet collided with the rubble
        }

        // Reset the hit flag if no collision in this frame
        this.hit = false;
        return false;
    }
}
