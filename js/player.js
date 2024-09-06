class PlayerTank {
    constructor(x, y, color = 'blue') {
        this.x = x;
        this.y = y;
        this.width = 65; // Width of the tank body
        this.height = 40; // Height of the tank body
        this.angle = 0; // Tank body rotation
        this.speed = 2;
        this.rotationSpeed = 0.05;
        this.turretAngle = 0; // Separate turret angle for more control
        this.color = color;
    }

    draw(ctx) {
        // Draw the tank body and tracks
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Draw tracks on the top and bottom
        ctx.fillStyle = 'black';
        ctx.fillRect(-(this.width + 8) / 2, -this.height / 2 - 10, this.width + 8, 10); // Top track
        ctx.fillRect(-(this.width + 8) / 2, this.height / 2, this.width + 8, 10); // Bottom track

        // Draw the main body of the tank
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

        // Draw the shaded section on the front of the tank
        this.drawShadedFront(ctx);
        ctx.restore();

        // Draw the turret on top of the tank body
        this.drawTurret(ctx);
        this.drawFrontIndicator(ctx);
    }

    drawTurret(ctx) {
        // Draw the turret and barrel
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.turretAngle); // The turret can rotate independently from the body

        // Draw turret base (circular)
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fillStyle = 'darkgray';
        ctx.fill();

        // Draw the turret barrel (rectangle extending from the turret)
        ctx.fillStyle = 'darkgray';
        ctx.fillRect(0, -5, 40, 10); // Barrel pointing forward
        ctx.restore();
    }

    drawFrontIndicator(ctx) {
        // Save the context and apply the transformation (position and rotation)
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Draw the front indicator
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0); // Start from the tank's center
        ctx.lineTo(this.width / 2 + 10, 0); // Line extends in front of the tank
        ctx.stroke();

        // Restore the context after drawing
        ctx.restore();
    }


    drawShadedFront(ctx) {
        // Add a semi-transparent or darker rectangle for shading the front
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent black
        ctx.fillRect(0, -this.height / 2, this.width / 2, this.height); // Front half shading
    }

    // Update the turret angle to point towards the mouse
    updateTurretAngle(mouseX, mouseY) {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        this.turretAngle = Math.atan2(dy, dx);
    }

    moveForward(enemies, barriers) {
        const nextX = this.x + Math.cos(this.angle) * this.speed;
        const nextY = this.y + Math.sin(this.angle) * this.speed;

        if (
            this.isWithinBounds(nextX, nextY) &&
            !this.isCollidingWithEnemy(nextX, nextY, enemies) &&
            !this.isCollidingWithBarrier(nextX, nextY, barriers)
        ) {
            this.x = nextX;
            this.y = nextY;
        } else {
            this.snapToBoundary(); // Ensure the player doesn't go beyond the boundary
        }
    }

    moveBackward(enemies, barriers) {
        const nextX = this.x - Math.cos(this.angle) * this.speed;
        const nextY = this.y - Math.sin(this.angle) * this.speed;

        if (
            this.isWithinBounds(nextX, nextY) &&
            !this.isCollidingWithEnemy(nextX, nextY, enemies) &&
            !this.isCollidingWithBarrier(nextX, nextY, barriers)
        ) {
            this.x = nextX;
            this.y = nextY;
        } else {
            this.snapToBoundary(); // Ensure the player doesn't go beyond the boundary
        }
    }

    rotateLeft() {
        this.angle -= this.rotationSpeed;
    }

    rotateRight() {
        this.angle += this.rotationSpeed;
    }

    shoot(bullets) {
        const bulletSpeed = 5;
        const bulletX = this.x + Math.cos(this.turretAngle) * (this.width / 2);
        const bulletY = this.y + Math.sin(this.turretAngle) * (this.height / 2);
        const bullet = new Bullet(bulletX, bulletY, this.turretAngle, bulletSpeed);
        bullets.push(bullet);
    }

    isWithinBounds(nextX, nextY) {
        const margin = this.width / 2;
        return nextX > margin && nextX < canvas.width - margin && nextY > margin && nextY < canvas.height - margin;
    }

    snapToBoundary() {
        // Ensure the player is snapped back to the nearest boundary when they move out of bounds
        const margin = this.width / 2;
        if (this.x < margin) this.x = margin;
        if (this.x > canvas.width - margin) this.x = canvas.width - margin;
        if (this.y < margin) this.y = margin;
        if (this.y > canvas.height - margin) this.y = canvas.height - margin;
    }

    isCollidingWithEnemy(nextX, nextY, enemies) {
        for (const enemy of enemies) {
            if (!enemy.isDestroyed) {
                const dx = nextX - enemy.x;
                const dy = nextY - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const collisionDistance = this.width / 2 + enemy.width / 2;
                if (distance < collisionDistance) {
                    return true;
                }
            }
        }
        return false;
    }

    // Check if the tank is colliding with any barrier
    isCollidingWithBarrier(nextX, nextY, barriers) {
        for (const barrier of barriers) {
            if (barrier.isCollidingWithTank({ x: nextX, y: nextY, width: this.width, height: this.height })) {
                return true;
            }
        }
        return false;
    }
}
