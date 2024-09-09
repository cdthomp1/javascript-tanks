class Level {
    constructor(levelNumber, enemiesConfig, barriersConfig) {
        this.levelNumber = levelNumber;
        this.enemies = [];
        this.barriers = [];
        this.initializeLevel(enemiesConfig, barriersConfig);
    }

    // Initialize the level with enemies and barriers
    initializeLevel(enemiesConfig, barriersConfig) {
        // Initialize enemies
        enemiesConfig.forEach(enemyData => {
            const enemy = new EnemyTank(enemyData.x, enemyData.y, 20, enemyData.color);
            this.enemies.push(enemy);
        });

        // Initialize barriers
        barriersConfig.forEach(barrierData => {
            // const barrier = new Barrier(barrierData.x, barrierData.y, barrierData.width, barrierData.height, barrierData.color);
            this.barriers.push(barrierData);
        });
    }

    drawBarriers(ctx) {
        this.barriers.forEach(barrier => barrier.draw(ctx));
    }

    updateEnemies(player, enemyBullets, ctx) {
        let allEnemiesDestroyed = true;
        this.enemies.forEach(enemy => {
            if (!enemy.isDestroyed) {

                allEnemiesDestroyed = false;
            }
        });
        return allEnemiesDestroyed; // Return true if all enemies are destroyed
    }
}
