let map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer.provider('Esri.WorldImagery').addTo(map);

document.getElementById("getLocation").addEventListener("click", function(event) {
    if (!navigator.geolocation) {
        console.log("No geolocation.");
    }

    navigator.geolocation.getCurrentPosition(position => {
        let lat = position.coords.latitude;
        let lon = position.coords.longitude;

        map.setView([lat, lon],100);
    });
});

document.getElementById('saveButton').addEventListener('click', function() {
    let canvas = document.getElementById('rasterMap');
    let ctx = canvas.getContext('2d');

    leafletImage(map, function(err, canvas) {
        let newCanvas = document.getElementById('rasterMap');
        newCanvas.width = 600; 
        newCanvas.height = 300; 
        let ctx2 = newCanvas.getContext('2d');
        ctx2.drawImage(canvas, 0, 0, 600, 300);
        
        splitIntoTiles(newCanvas);
        createDropZones();
    });
});

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function splitIntoTiles(canvas) {
    let puzzleContainer = document.getElementById('puzzle-container');
    puzzleContainer.innerHTML = ''; 

    let numRows = 4;
    let numCols = 4;

    let tileWidth = canvas.width / numCols;
    let tileHeight = canvas.height / numRows;
    let ctx = canvas.getContext('2d');

    let tiles = [];

    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            let tileCanvas = document.createElement('canvas');
            tileCanvas.width = tileWidth;
            tileCanvas.height = tileHeight;
            let tileCtx = tileCanvas.getContext('2d');

            tileCtx.drawImage(
                canvas,
                col * tileWidth, row * tileHeight, tileWidth, tileHeight,
                0, 0, tileWidth, tileHeight
            );

            let tile = document.createElement('div');
            tile.classList.add('tile');
            tile.setAttribute('draggable', 'true');
            tile.style.width = `${tileWidth}px`;
            tile.style.height = `${tileHeight}px`;
            tile.style.backgroundImage = `url(${tileCanvas.toDataURL()})`;
            tile.style.backgroundSize = 'cover'; 
            tile.id = `tile-${row}-${col}`;
            tile.addEventListener('dragstart', dragStart);

            tiles.push(tile);
        }
    }

    shuffle(tiles);

    tiles.forEach(tile => puzzleContainer.appendChild(tile));
}

function createDropZones() {
    let puzzleTarget = document.getElementById('puzzle-target');
    puzzleTarget.innerHTML = ''; 

    for (let i = 0; i < 16; i++) {
        let dropZone = document.createElement('div');
        dropZone.classList.add('drop-zone');
        dropZone.addEventListener('dragover', dragOver);
        dropZone.addEventListener('dragleave', dragLeave);
        dropZone.addEventListener('drop', drop);
        puzzleTarget.appendChild(dropZone);
    }
}

function dragStart(event) {
    event.dataTransfer.setData("text", event.target.id);
}

function dragOver(event) {
    event.preventDefault();
    event.target.classList.add('hovered');
}

function dragLeave(event) {
    event.target.classList.remove('hovered');
}

function drop(event) {
    event.preventDefault();
    event.target.classList.remove('hovered');

    let tileId = event.dataTransfer.getData("text");
    let tile = document.getElementById(tileId);

    if (event.target.classList.contains('tile')) return;

    if (event.target.firstChild) {
        let existingTile = event.target.firstChild;
        document.getElementById('puzzle-container').appendChild(existingTile);
    }

    event.target.appendChild(tile);

    checkPuzzleCompletion();
}

let puzzleContainer = document.getElementById('puzzle-container');
puzzleContainer.addEventListener("dragover", function (event) {
    event.preventDefault();
});

puzzleContainer.addEventListener("drop", function (event) {
    event.preventDefault();
    let tileId = event.dataTransfer.getData("text");
    let tile = document.getElementById(tileId);

    puzzleContainer.appendChild(tile);
});

function checkPuzzleCompletion() {
    let dropZones = document.querySelectorAll('.drop-zone');
    let correct = true;

    dropZones.forEach((dropZone, index) => {
        if (!dropZone.firstChild || dropZone.firstChild.id !== `tile-${Math.floor(index / 4)}-${index % 4}`) {
            correct = false;
        }
    });

    if (correct) {
        showCompletionNotification();
    }
}

function showCompletionNotification() {
    console.log("Puzzle completed! Congratulations!");
    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            new Notification("Congratulations!");
        } 
    });
}