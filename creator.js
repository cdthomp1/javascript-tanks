// Get canvas and context
const editorCanvas = document.getElementById('editorCanvas');
const editorCtx = editorCanvas.getContext('2d');
let selectedObjectType = 'player';
let objects = [];
let hoveredCell = null; // Track which cell is hovered over
let levels = [];  // Store loaded levels
let currentLevelIndex = null;  // Track the currently loaded level

// Fixed size for grid cells (matches the object size, stays constant)
const OBJECT_SIZE = 50;

// Fixed canvas size (1200x900)
editorCanvas.width = 1200;
editorCanvas.height = 900;

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

// Handle mouse clicks for placing and removing objects
editorCanvas.addEventListener('click', (e) => {
    const rect = editorCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Snap the object to the nearest grid cell
    const snappedX = Math.floor(mouseX / OBJECT_SIZE) * OBJECT_SIZE;
    const snappedY = Math.floor(mouseY / OBJECT_SIZE) * OBJECT_SIZE;

    // Check if an object is already in the clicked cell
    const objectIndex = objects.findIndex(obj => obj.x === snappedX && obj.y === snappedY);

    if (objectIndex !== -1) {
        // If the object exists at the clicked position, remove it
        objects.splice(objectIndex, 1);
    } else {
        // If the cell is empty, create a new object based on the selected type
        const newObject = {
            type: selectedObjectType,
            x: snappedX,
            y: snappedY
        };

        // Push the new object to the array
        objects.push(newObject);
    }

    // Redraw the canvas with updated objects
    drawEditor();
});

// Function to load levels from the JSON file
async function loadLevels() {
    const response = await fetch('./levels/levels.json');
    levels = await response.json();
    updateLevelList();
}

// Update the level list in the UI
function updateLevelList() {
    const levelListContainer = document.getElementById('levelListContainer');
    levelListContainer.innerHTML = '';  // Clear the existing list

    levels.forEach((level, index) => {
        const li = document.createElement('li');
        li.setAttribute("id", index)
        li.textContent = `Level ${index + 1}`;
        li.onclick = () => loadLevel(index);
        levelListContainer.appendChild(li);
    });
}

// Load a level by index
function loadLevel(index) {
    currentLevelIndex = index;
    const levelData = levels[index];
    objects = []; // Clear existing objects

    // Remove 'active-level' class from all list items
    const allListItems = document.querySelectorAll('#levelListContainer li');
    allListItems.forEach(item => {
        item.classList.remove('active-level');
    });

    // Add 'active-level' class to the selected level item
    const levelElement = document.getElementById(index);
    levelElement.classList.add('active-level');

    // Load enemies
    levelData.enemies.forEach(enemy => {
        objects.push({
            type: 'enemy',
            x: enemy.x,
            y: enemy.y
        });
    });

    // Load barriers
    levelData.barriers.forEach(barrier => {
        objects.push({
            type: barrier.type.toLowerCase(),
            x: barrier.x,
            y: barrier.y
        });
    });

    // Load ammo packs
    levelData.ammoPacks.forEach(ammo => {
        objects.push({
            type: ammo.type === 'AmmoPack' ? 'ammo' : 'rocketAmmo',
            x: ammo.x,
            y: ammo.y
        });
    });

    // Load player position
    objects.push({
        type: 'player',
        x: levelData.playerPosition.x,
        y: levelData.playerPosition.y
    });

    drawEditor(); // Redraw editor with the loaded level
}


// Create a new level
function createNewLevel() {
    objects = [];  // Clear the editor
    currentLevelIndex = levels.length;  // New level index
    drawEditor();
}

// Save the current level
function saveLevel() {
    const levelJson = {
        level: currentLevelIndex + 1,
        enemies: [],
        barriers: [],
        ammoPacks: [],
        playerPosition: {}
    };

    objects.forEach(obj => {
        if (obj.type === 'enemy') {
            levelJson.enemies.push({ x: obj.x, y: obj.y, color: 'green' });
        } else if (obj.type === 'barrier') {
            levelJson.barriers.push({ type: 'Barrier', x: obj.x, y: obj.y, width: 50, height: 50, color: 'grey' });
        } else if (obj.type === 'rubble') {
            levelJson.barriers.push({ type: 'Rubble', x: obj.x, y: obj.y, width: 50, height: 50, durability: 2, color: 'brown' });
        } else if (obj.type === 'ammo') {
            levelJson.ammoPacks.push({ type: 'AmmoPack', x: obj.x, y: obj.y });
        } else if (obj.type === 'rocketAmmo') {
            levelJson.ammoPacks.push({ type: 'RocketAmmoPack', x: obj.x, y: obj.y });
        } else if (obj.type === 'player') {
            levelJson.playerPosition = { x: obj.x, y: obj.y };
        }
    });

    // Save the level to the levels array
    if (currentLevelIndex < levels.length) {
        levels[currentLevelIndex] = levelJson;
    } else {
        levels.push(levelJson);
    }

    // Convert to JSON string and simulate saving to a file
    const jsonBlob = new Blob([JSON.stringify(levels, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(jsonBlob);
    link.download = `levels.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    updateLevelList();  // Update the level list
}

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

    // Draw placed objects
    objects.forEach(obj => {
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
        editorCtx.fillRect(obj.x, obj.y, OBJECT_SIZE, OBJECT_SIZE);
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

// Initialize: Load levels on page load
loadLevels();
drawEditor();
