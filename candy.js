// =================== AUDIO ===================
const soundCrush = new Audio("./sounds/soda_crush.mp3");
const soundBg = new Audio("./sounds/Voicy_Juicy.mp3");

soundCrush.preload = "auto";
soundBg.loop = true;
soundBg.volume = 0.5;
soundBg.preload = "auto";

function startBackgroundOnInteraction() {
    document.removeEventListener("click", startBackgroundOnInteraction);
    soundBg.play().catch(() => {});
}
document.addEventListener("click", startBackgroundOnInteraction, { once: true });

// =================== GAME VARIABLES ===================
const candies = ["Blue", "Orange", "Green", "Yellow", "Red", "Purple"];
const rows = 9;
const columns = 9;
let board = [];

let currTile = null;
let otherTile = null;

let score = 0;
let movesLeft = 30;
let timeLeft = 300;
let timerInterval = null;

// =================== DOM ELEMENTS ===================
const scoreDisplay = document.getElementById("score");
const movesDisplay = document.getElementById("moves");
const timerDisplay = document.getElementById("timer");

// =================== GAME INIT ===================
window.onload = function() {
    startGame();
    startTimer();
    setInterval(() => {
        crushCandy();
        slideCandy();
        generateCandy();
    }, 100);
};

// =================== BOARD FUNCTIONS ===================
function randomCandy() {
    return candies[Math.floor(Math.random() * candies.length)];
}

function startGame() {
    board = [];
    const boardDiv = document.getElementById("board");
    boardDiv.innerHTML = "";

    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            const tile = document.createElement("img");
            tile.id = `${r}-${c}`;
            tile.src = `./images/${randomCandy()}.png`;

            tile.draggable = true;
            tile.addEventListener("dragstart", dragStart);
            tile.addEventListener("dragover", dragOver);
            tile.addEventListener("dragenter", dragEnter);
            tile.addEventListener("dragleave", dragLeave);
            tile.addEventListener("drop", dragDrop);
            tile.addEventListener("dragend", dragEnd);

            boardDiv.appendChild(tile);
            row.push(tile);
        }
        board.push(row);
    }

    updateScore(0);
    movesDisplay.textContent = movesLeft;
    timerDisplay.textContent = timeLeft;
}

// =================== DRAG & DROP ===================
function dragStart() { currTile = this; }
function dragOver(e) { e.preventDefault(); }
function dragEnter(e) { e.preventDefault(); }
function dragLeave() {}
function dragDrop() { otherTile = this; }

function dragEnd() {
    if (!currTile || !otherTile) return;

    const [r1, c1] = currTile.id.split("-").map(Number);
    const [r2, c2] = otherTile.id.split("-").map(Number);

    const isAdjacent = (r1 === r2 && Math.abs(c1 - c2) === 1) || (c1 === c2 && Math.abs(r1 - r2) === 1);

    if (isAdjacent) {
        let tmp = currTile.src;
        currTile.src = otherTile.src;
        otherTile.src = tmp;

        if (checkValid()) {
            decreaseMoves();
            crushCandy();
            soundCrush.play().catch(() => {});
        } else {
            // Swap back if invalid
            tmp = currTile.src;
            currTile.src = otherTile.src;
            otherTile.src = tmp;
        }
    }

    currTile = null;
    otherTile = null;
}

// =================== SCORE & MOVES ===================
function updateScore(points) {
    score += points;
    scoreDisplay.textContent = `⭐ Score: ${score}`;
}

function decreaseMoves() {
    movesLeft--;
    movesDisplay.textContent = `🎮 Moves: ${movesLeft}`;
    if (movesLeft <= 0) {
        alert("Game Over! Out of moves.");
        resetGame();
    }
}

// =================== TIMER ===================
function startTimer() {
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `⏱️ Time: ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert("Time's up! Game Over.");
            resetGame();
        }
    }, 1000);
}

// =================== GAME LOGIC ===================
function crushCandy() {
    crushThree();
}

function crushThree() {
    let foundMatch = false;

    // Rows
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 2; c++) {
            const c1 = board[r][c];
            const c2 = board[r][c + 1];
            const c3 = board[r][c + 2];

            if (c1.src === c2.src && c2.src === c3.src && !c1.src.includes("blank")) {
                c1.src = c2.src = c3.src = "./images/blank.png";
                updateScore(30);
                foundMatch = true;
            }
        }
    }

    // Columns
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 2; r++) {
            const c1 = board[r][c];
            const c2 = board[r + 1][c];
            const c3 = board[r + 2][c];

            if (c1.src === c2.src && c2.src === c3.src && !c1.src.includes("blank")) {
                c1.src = c2.src = c3.src = "./images/blank.png";
                updateScore(30);
                foundMatch = true;
            }
        }
    }

    if (foundMatch) decreaseMoves();
}

// =================== CHECK VALID MOVE ===================
function checkValid() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 2; c++) {
            const c1 = board[r][c];
            const c2 = board[r][c + 1];
            const c3 = board[r][c + 2];
            if (c1.src === c2.src && c2.src === c3.src && !c1.src.includes("blank")) return true;
        }
    }

    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 2; r++) {
            const c1 = board[r][c];
            const c2 = board[r + 1][c];
            const c3 = board[r + 2][c];
            if (c1.src === c2.src && c2.src === c3.src && !c1.src.includes("blank")) return true;
        }
    }

    return false;
}

// =================== SLIDE & REFILL ===================
function slideCandy() {
    for (let c = 0; c < columns; c++) {
        let empty = rows - 1;
        for (let r = rows - 1; r >= 0; r--) {
            if (!board[r][c].src.includes("blank")) {
                board[empty][c].src = board[r][c].src;
                empty--;
            }
        }

        for (let r = empty; r >= 0; r--) {
            board[r][c].src = "./images/blank.png";
        }
    }
}

function generateCandy() {
    for (let c = 0; c < columns; c++) {
        if (board[0][c].src.includes("blank")) {
            board[0][c].src = `./images/${randomCandy()}.png`;
        }
    }
}

// =================== RESET ===================
function resetGame() {
    score = 0;
    movesLeft = 30;
    timeLeft = 300;

    clearInterval(timerInterval);
    document.getElementById("board").innerHTML = "";

    startGame();
    updateScore(0);
    movesDisplay.textContent = movesLeft;
    timerDisplay.textContent = timeLeft;
    startTimer();
}
