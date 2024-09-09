class Rubble extends Barrier {
    constructor(x, y, width, height, hitLimit = 2, color = 'brown') {
        super(x, y, width, height, hitLimit * 50, color); // Correctly pass color to the parent constructor
        this.timesHit = 0; // Tracks how many times rubble was hit
        this.hitLimit = hitLimit; // Number of hits before rubble is destroyed
    }

    // Handle bullet collision – rubble absorbs hits without ricochet
    handleBulletCollision(bullet) {
        this.timesHit += 1; // Increment hit count
        console.log(`Rubble hit: ${this.timesHit} times`);

        // Change color to indicate damage
        this.color = 'rgb(71,40,36)'; // Change color when hit

        // Destroy the rubble if hit limit is reached
        if (this.timesHit >= this.hitLimit) {
            console.log('Rubble destroyed!');
            this.isDestroyed = true;
        }

        return true; // Always destroy the bullet when it hits rubble
    }
}
