import EnemyTank from "./enemy.js";

export default class Level {
    constructor(levelNumber, enemiesConfig, barriersConfig, ammoPacksConfig = []) {
        this.levelNumber = levelNumber;
        this.enemies = [];
        this.barriers = [];
        this.ammoPacks = [];
        this.initializeLevel(enemiesConfig, barriersConfig, ammoPacksConfig);
    }

    // Initialize the level with enemies, barriers, and ammo packs
    initializeLevel(enemiesConfig, barriersConfig, ammoPacksConfig) {
        // Initialize enemies
        enemiesConfig.forEach(enemyData => {
            const enemy = new EnemyTank(enemyData.x, enemyData.y, 100, enemyData.color, enemyData.canvas);
            this.enemies.push(enemy);
        });

        // Initialize barriers
        barriersConfig.forEach(barrierData => {
            this.barriers.push(barrierData);
        });

        // Initialize ammo packs (AmmoPack and RocketAmmoPack)
        ammoPacksConfig.forEach(ammoPackData => {
            this.ammoPacks.push(ammoPackData);
        });
    }

    drawBarriers(ctx) {
        this.barriers.forEach(barrier => barrier.draw(ctx));
    }

    drawAmmoPacks(ctx) {
        this.ammoPacks.forEach(ammoPack => ammoPack.draw(ctx));
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

    checkAmmoCollisions(player) {
        this.ammoPacks = this.ammoPacks.filter(ammoPack => {
            if (ammoPack.isCollidingWithTank(player)) {
                player.ammo += ammoPack.ammoAmount;  // Add ammo to the player
                return false;  // Remove the ammo pack after collision
            }
            return true;  // Keep ammo pack if no collision
        });
    }
}
