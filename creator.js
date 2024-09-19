const editorCanvas = document.getElementById('editorCanvas');
const editorCtx = editorCanvas.getContext('2d');
let selectedObjectType = 'player';
let objects = [];
let hoveredCell = null; // Track which cell is hovered over

// Fixed size for grid cells (matches the object size, stays constant)
const OBJECT_SIZE = 50;

let currentLevelIndex = 0;

// Set the initial canvas size
function resizeCanvas() {
    editorCanvas.width = window.innerWidth;
    editorCanvas.height = window.innerHeight;
}
resizeCanvas();

// Helper functions to convert between pixel and percentage-based positions
function toPercentageX(x) {
    return (x / editorCanvas.width) * 100;
}

function toPercentageY(y) {
    return (y / editorCanvas.height) * 100;
}

function toPixelX(percentageX) {
    return (percentageX / 100) * editorCanvas.width;
}

function toPixelY(percentageY) {
    return (percentageY / 100) * editorCanvas.height;
}

// Set the object type for placement
function selectObjectType(type) {
    selectedObjectType = type;
}

// Handle mouse movement to show hovered cell
editorCanvas.addEventListener('mousemove', (e) => {
    const rect = editorCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Snap the hovered cell to the grid
    const snappedX = Math.floor(mouseX / OBJECT_SIZE) * OBJECT_SIZE;
    const snappedY = Math.floor(mouseY / OBJECT_SIZE) * OBJECT_SIZE;

    hoveredCell = { x: snappedX, y: snappedY };

    // Redraw the canvas with the hovered cell highlighted
    drawEditor();
});

// Handle mouse clicks for placing objects
editorCanvas.addEventListener('click', (e) => {
    const rect = editorCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Snap the object to the nearest grid cell and convert to percentages
    const snappedX = Math.floor(mouseX / OBJECT_SIZE) * OBJECT_SIZE;
    const snappedY = Math.floor(mouseY / OBJECT_SIZE) * OBJECT_SIZE;

    // Create an object based on the selected type
    const newObject = {
        type: selectedObjectType,
        xPercentage: toPercentageX(snappedX), // Store as percentage of canvas width
        yPercentage: toPercentageY(snappedY)  // Store as percentage of canvas height
    };

    // Push the object to the array
    objects.push(newObject);

    // Redraw the canvas with the newly placed object
    drawEditor();
});

// Draw the grid and all objects on the canvas
function drawEditor() {
    editorCtx.clearRect(0, 0, editorCanvas.width, editorCanvas.height);

    // Draw the grid
    drawGrid();

    // Draw the hovered cell (if any)
    if (hoveredCell) {
        editorCtx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Light shadow color
        editorCtx.fillRect(hoveredCell.x, hoveredCell.y, OBJECT_SIZE, OBJECT_SIZE);
    }

    // Draw placed objects (convert percentage to pixel values)
    objects.forEach(obj => {
        const pixelX = toPixelX(obj.xPercentage);
        const pixelY = toPixelY(obj.yPercentage);

        switch (obj.type) {
            case 'player':
                editorCtx.fillStyle = 'blue';
                break;
            case 'enemy':
                editorCtx.fillStyle = 'green';
                break;
            case 'ammo':
                editorCtx.fillStyle = 'brown';
                break;
            case 'rocketAmmo':
                editorCtx.fillStyle = 'red';
                break;
            case 'barrier':
                editorCtx.fillStyle = 'gray';
                break;
            case 'rubble':
                editorCtx.fillStyle = 'rgb(255, 64, 0)';
                break;
        }
        editorCtx.fillRect(pixelX, pixelY, OBJECT_SIZE, OBJECT_SIZE);
    });
}

// Draw the grid on the canvas
function drawGrid() {
    const numColumns = Math.floor(editorCanvas.width / OBJECT_SIZE);
    const numRows = Math.floor(editorCanvas.height / OBJECT_SIZE);

    editorCtx.strokeStyle = 'lightgray'; // Grid line color
    editorCtx.lineWidth = 1;

    // Draw vertical grid lines
    for (let col = 0; col <= numColumns; col++) {
        const x = col * OBJECT_SIZE;
        editorCtx.beginPath();
        editorCtx.moveTo(x, 0);
        editorCtx.lineTo(x, editorCanvas.height);
        editorCtx.stroke();
    }

    // Draw horizontal grid lines
    for (let row = 0; row <= numRows; row++) {
        const y = row * OBJECT_SIZE;
        editorCtx.beginPath();
        editorCtx.moveTo(0, y);
        editorCtx.lineTo(editorCanvas.width, y);
        editorCtx.stroke();
    }
}

// Generate the code for the level
function generateLevelCode() {
    const enemies = [];
    const barriers = [];
    const ammoPacks = [];
    let playerPosition = { x: 0, y: 0 };

    objects.forEach(obj => {
        const pixelX = toPixelX(obj.xPercentage);
        const pixelY = toPixelY(obj.yPercentage);

        if (obj.type === 'enemy') {
            enemies.push(`{ x: ${Math.round(pixelX)}, y: ${Math.round(pixelY)}, color: 'green' }`);
        } else if (obj.type === 'barrier') {
            barriers.push(`new Barrier(${Math.round(pixelX)}, ${Math.round(pixelY)}, ${OBJECT_SIZE}, ${OBJECT_SIZE}, 'grey')`);
        } else if (obj.type === 'rubble') {
            barriers.push(`new Rubble(${Math.round(pixelX)}, ${Math.round(pixelY)}, ${OBJECT_SIZE}, ${OBJECT_SIZE}, 2, 'brown')`);
        } else if (obj.type === 'ammo') {
            ammoPacks.push(`new AmmoPack(${Math.round(pixelX)}, ${Math.round(pixelY)})`);
        } else if (obj.type === 'rocketAmmo') {
            ammoPacks.push(`new RocketAmmoPack(${Math.round(pixelX)}, ${Math.round(pixelY)})`);
        } else if (obj.type === 'player') {
            playerPosition = { x: Math.round(pixelX), y: Math.round(pixelY) };
        }
    });

    // Generate the level code formatted like your example
    const levelCode = `
{
    level: new Level(${currentLevelIndex + 1},
        [${enemies.join(', ')}], // Enemies for Level ${currentLevelIndex + 1}
        [
            ${barriers.join(',\n            ')}
        ],
        [
            ${ammoPacks.join(',\n            ')}
        ]),
    playerPosition: { x: ${playerPosition.x}, y: ${playerPosition.y} }
}
`;

    // Display the generated code in the output element
    document.getElementById('output').innerText = levelCode;
}

// Handle window resize and recalculate positions
window.addEventListener('resize', () => {
    resizeCanvas();  // Adjust canvas size
    drawEditor();    // Redraw all objects based on new canvas size
});

// Initial draw
drawEditor();
