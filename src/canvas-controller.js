let walkers = [];
let foods = [];

let paused = false;
let ctx;
let canvas;

const ringCenter = {
    x: 320,
    y: 240,
    radius: 40,
    fill: 'white',
    stroke: 'black'
}

let fps = 60;
let shouldSpawnWalker = 'spawn';
let gamemode = 'none';

window.onload = function () {
    canvas = document.querySelector('canvas');
    ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(20, 20, 600, 440);
    setInterval(drawEverything, 1000 / fps);
    canvas.onclick = canvasClicked;
    document.querySelectorAll('input[name="click_control"]').forEach(button => {
        button.onchange = e => {
            shouldSpawnWalker = e.target.value;
        }
    });

    document.querySelector('#nuke').onclick = () => {
        walkers = [];
        foods = [];
        cls();
    }
    document.querySelector('#pause').onclick = (e) => {
        paused = !paused;
        document.querySelector('#pause').innerHTML = paused ? "Unpause" : "Pause";
    }
}

function canvasClicked(e) {
    let rect = e.target.getBoundingClientRect();
    let mouseX = e.clientX - rect.x;
    let mouseY = e.clientY - rect.y;
    if (shouldSpawnWalker == 'spawn') {
        createWalker(mouseX, mouseY, getRandomColor(), 10000);

    } else if (shouldSpawnWalker == 'center') {
        ringCenter.x = mouseX;
        ringCenter.y = mouseY;
    } else {
        createFood(mouseX, mouseY)
    }
}

function drawWalkers() {
    for (const walker of walkers) {
        ctx.strokeStyle = walker.color;
        ctx.lineWidth = walker.radius;
        ctx.beginPath();
        if (!paused) {
            ctx.moveTo(walker.x, walker.y);
            walker.move();
            gainPoints()
            ctx.lineTo(walker.x, walker.y);
        } else {
            ctx.rect(walker.x, walker.y, walker.radius / 2, walker.radius / 2)
        }
        checkFoodCollisions();
        checkZombieCollisions();
        ctx.closePath();
        ctx.stroke();

    }
}

function drawEverything() {
    ctx.save();
    ctx.fillStyle = 'black';
    ctx.globalAlpha = 1 / fps * 3;
    if (!paused) {
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        drawCenter();
    }
    ctx.restore();
    drawWalkers();
    drawFood();
    cleanupDeadWalkers();
}

function drawFood() {
    for (const food of foods) {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.rect(food.x, food.y, food.radius, food.radius);
        ctx.closePath();
        ctx.fill();
    }
}

function drawCenter() {
    ctx.save();
    ctx.fillStyle = ringCenter.fill;
    ctx.strokeStyle = ringCenter.stroke;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(ringCenter.x, ringCenter.y, ringCenter.radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}

function checkFoodCollisions() {
    walkers.forEach(walker => {
        for (let i = 0; i < foods.length; i++) {
            if (checkCollisions(walker, foods[i])) {
                foods.splice(i, 1);
                walker.eatFood();
            }
        }
    });
}

function cleanupDeadWalkers() {
    for (let i = 0; i < walkers.length; i++) {
        if (!walkers[i].isAlive()) {
            walkers.splice(i, 1);
        }
    }
}

function calculateClosestItem(object, array) {
    if (array.length <= 0) {
        return null;
    }
    let distance = Number.MAX_VALUE;
    let toReturn = null;
    array.forEach(item => {
        let tempDist = Math.sqrt(Math.pow(item.x - object.x, 2) + Math.pow(item.y - object.y, 2));
        if (tempDist < distance) {
            distance = tempDist;
            toReturn = item;
        }
    })
    return toReturn;
}

function getRandomColor() {
    function getByte() {
        return Math.round(Math.random() * 255);
    }
    return "rgba(" + getByte() + "," + getByte() + "," + getByte() + ",1)";
}

function cls() {
    ctx.clearRect(0, 0, 640, 480);
}

function flipWeightedCoin(weight = 0.5) {
    return Math.random() < weight;
}

function moveTowards(a, b, horizontal = true) {
    if (a == null && b == null) {
        return;
    }
    if (horizontal) {
        if (a.x < b.x) {
            a.x += a.radius * a.speed;
        } else if (a.x > b.x) {
            a.x -= a.radius * a.speed;
        }
    } else {
        if (a.y < b.y) {
            a.y += a.radius * a.speed;
        } else if (a.y > b.y) {
            a.y -= a.radius * a.speed;
        }
    }
}

function moveAwayFrom(a, b, horizontal = true) {
    if (a == null && b == null) {
        return;
    }
    if (horizontal) {
        if (a.x < b.x) {
            a.x -= a.radius * a.speed;
        } else if (a.x > b.x) {
            a.x += a.radius * a.speed;
        }
    } else {
        if (a.y < b.y) {
            a.y -= a.radius * a.speed;
        } else if (a.y > b.y) {
            a.y += a.radius * a.speed;
        }
    }
}

function createWalker(x, y, color = 'white', movesLeft = 100, decayRate = 10) {
    let walker = {
        x: x,
        y: y,
        color: color,
        movesLeft: movesLeft,
        radius: movesLeft / decayRate > 10 ? 10 : movesLeft / decayRate,
        speed: 1 + (Math.random() * 1.2),
        move() {
            if (flipWeightedCoin()) { // Does walker go in horizontal?
                if (flipWeightedCoin()) {
                    this.x += this.radius * this.speed;
                } else {
                    this.x -= this.radius * this.speed;
                }
            } else {
                if (flipWeightedCoin()) {
                    this.y += this.radius * this.speed;
                } else {
                    this.y -= this.radius * this.speed;
                }
            }
            this.movesLeft--;
            this.radius = this.movesLeft / decayRate > 10 ? 10 : this.movesLeft / decayRate;
            if (this.x > canvas.width) {
                this.x = 0;
            }
            if (this.x < 0) {
                this.x = canvas.width;
            }
            if (this.y > canvas.height) {
                this.y = 0;
            }
            if (this.y < 0) {
                this.y = canvas.height
            }
        },
        isAlive() {
            return this.movesLeft > 0;
        },
        eatFood() {
            this.movesLeft += 50;
        },
    }
    walkers.push(walker);
    return walker;
}

function createFood(x, y, width = 10) {
    let food = {
        x: x,
        y: y,
        radius: width
    };
    foods.push(food);
}

// AABB Collision
function checkCollisions(a, b) {
    return a.x < b.x + b.radius &&
        a.x + a.radius > b.x &&
        a.y < b.y + b.radius &&
        a.y + a.radius > b.y;
}