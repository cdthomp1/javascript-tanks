export default class CollisionManager {
    // Check if two circular objects (like bullets) are colliding
    static isCollidingCircles(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const collisionDistance = obj1.radius + obj2.radius; // Sum of radii for circular collision
        return distance < collisionDistance;
    }

    // Check if a circular object (like a bullet) is colliding with a rectangular object (like a tank or barrier)
    static isCollidingCircleRect(circle, rect) {
        const distX = Math.abs(circle.x - rect.x - rect.width / 2);
        const distY = Math.abs(circle.y - rect.y - rect.height / 2);

        if (distX > (rect.width / 2 + circle.radius)) return false;
        if (distY > (rect.height / 2 + circle.radius)) return false;

        if (distX <= (rect.width / 2)) return true;
        if (distY <= (rect.height / 2)) return true;

        const dx = distX - rect.width / 2;
        const dy = distY - rect.height / 2;
        return (dx * dx + dy * dy <= (circle.radius * circle.radius));
    }

    // Check if two rectangular objects (like tanks or barriers) are colliding
    static isCollidingRects(rect1, rect2) {
        const rect1Left = rect1.x - rect1.width / 2;
        const rect1Right = rect1.x + rect1.width / 2;
        const rect1Top = rect1.y - rect1.height / 2;
        const rect1Bottom = rect1.y + rect1.height / 2;

        const rect2Left = rect2.x - rect2.width / 2;
        const rect2Right = rect2.x + rect2.width / 2;
        const rect2Top = rect2.y - rect2.height / 2;
        const rect2Bottom = rect2.y + rect2.height / 2;

        return (
            rect1Right > rect2Left &&
            rect1Left < rect2Right &&
            rect1Bottom > rect2Top &&
            rect1Top < rect2Bottom
        );
    }

    // Boundary collision (used for tanks or bullets to stay within the canvas)
    static isWithinBounds(obj, canvas) {
        const margin = obj.width / 2 || obj.radius; // Use width for tanks, radius for bullets
        return (
            obj.x > margin &&
            obj.x < canvas.width - margin &&
            obj.y > margin &&
            obj.y < canvas.height - margin
        );
    }
}