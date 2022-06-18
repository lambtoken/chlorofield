const FIELDSIZE = 15
let SPEED = 1;
const FPS = 25;
let DAY = 0;
//let HOUR = 0;
//temperature
//let TEMP = 24;
let SEED = Math.random().toString(36).substring(2,12);

//Makes a 2D Array
const generateGrid = (size, fill) => {
    return (new Array(size).fill(null)
    .map(() => new Array(size).fill(fill))
    )
}

//FIELD init
let FIELD = generateGrid(FIELDSIZE, null);

for(let y = 0; y < FIELDSIZE; y++) {
    for(let x = 0; x < FIELDSIZE; x++) {
        FIELD[y][x] = {}
        FIELD[y][x].seed = false
        FIELD[y][x].life = false
        FIELD[y][x].adult = {}
    }
}

//Plant Object
function plant(genes, stats) {
    this.genes = genes
    this.stats = stats
    this.id = undefined

    //chromos is the number of chromosomes a plant has
    this.randomDNA = (chromos = 5) => {
        this.genes = new Array(Math.ceil(random() * chromos)).fill(null)
        .map(() => new Array(10).fill(null).map((x) => x = ran(3)))
    }
    this.randomStats = () => {
        this.stats = {
            energy: ran.range(30,80),
            health: ran.range(80,100),
            age: 0,
            lifespan: ran.range(50, 70),
            maturity: ran.range(10,20),
            germination: ran.range(10,20)
        }
    }
}

//RANDOMNESS FUNCTIONS

function mulberry32(a) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

function hashCode(str) {
    let hash = 0;
    for (let i = 0, len = str.toString().length; i < len; i++) {
        let chr = str.toString().charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

let random = mulberry32(hashCode(SEED))

//basic random - returns a random value ranging from 0 and a given input
function ran(n) {
    return ~~(random() * (n + 1))
}

//returns a random value from a given range
ran.range = function(a,b) {
    return a + ~~(random() * (b - a + 1)) 
}

//given a chance returns either true or false
ran.chance = (chance) => {
    if (ran(100) <= chance) {
        return true
    } else {
        return false
    }
}

//Generates a small 3x3 cluster of plants ready to be placed on the FIELD
function cluster(density = 70) {
    let newPlant = new plant()
    newPlant.randomDNA()

    let cluster = generateGrid(3, null)
    for(let i = 0; i < cluster.length; i++) {
        for(let j = 0; j < cluster.length; j++) {
            cluster[j][i] = {}
            cluster[j][i].life = false
            cluster[j][i].adult = {}
            if(ran.chance(density)) {
                newPlant = new plant()
                newPlant.randomStats()
                cluster[j][i].adult = newPlant
                cluster[j][i].life = true
                cluster[j][i].seed = false
            }
        }
    }
    return cluster
}

//Places a number of species on the FIELD and makes sure they get an unique ID
(function populate(species = 8) {
    let speciesID = 0;
    for(let i = 0; i < species; i++) {
        let newCluster = cluster()
        let randomCords = [ran(FIELDSIZE-1), ran(FIELDSIZE-1)]
        for(let j = 0; j < newCluster.length; j++) {
            for(let k = 0; k < newCluster.length; k++) {
                let x = randomCords[1] + k;
                let y = randomCords[0] + j;
                if((x < FIELDSIZE && x >= 0 && y < FIELDSIZE && y >= 0) && newCluster[k][j].life == true) {
                    FIELD[randomCords[1] + k][randomCords[0] + j] = newCluster[k][j]
                    FIELD[randomCords[1] + k][randomCords[0] + j].id = speciesID
                }
            }
        }
        speciesID++
    }
})()


//GRAPHICS
const canvas = document.getElementById('myCanvas')
const ctx = canvas.getContext('2d')

const TILESIZE = 32;
const WIDTH = TILESIZE * FIELDSIZE;
const HEIGHT = TILESIZE * FIELDSIZE;
canvas.width = WIDTH;
canvas.height = HEIGHT;


const TILES = new Image(128,128)
TILES.src = "./resources/tiles.png"
ctx.imageSmoothingEnabled = false;

let paragraph = document.querySelector('p')
let mouseX, mouseY
canvas.addEventListener('mousemove', () => {
    window.mouseX = event.clientX
    window.mouseY = event.clientY
})
let day = document.getElementById('day')


let TICK = 0;
//1 step in time
function step() {
    TICK++
    if (TICK > ~~(FPS/SPEED)) {
        for (let y = 0; y < FIELDSIZE; y++) {
            for (let x = 0; x < FIELDSIZE; x++) {
                if((FIELD[y][x].life == true) && (FIELD[y][x].seed == false)) {
                    FIELD[y][x].adult.stats.age++
                    if(FIELD[y][x].adult.stats.age > FIELD[y][x].adult.stats.lifespan) {
                        FIELD[y][x] = {}
                        FIELD[y][x].seed = false
                        FIELD[y][x].life = false
                        FIELD[y][x].adult = {}
                    }
                } else if(FIELD[y][x].life == true && FIELD[y][x].seed == true) {
                    FIELD[y][x].adult.stats.age += 1
                        if(FIELD[y][x].adult.stats.age > FIELD[y][x].adult.stats.germination) {
                            FIELD[y][x].seed = false
                            FIELD[y][x].adult.stats.age = 0
                        }
                }
            }
        }
    TICK = 0
    DAY++
    }
}

function restart(seed = Math.random().toString(36).substring(2,12)) {
    isPaused = true
    DAY = 0
    SEED = seed;
    random = mulberry32(hashCode(SEED))
    seedBox.value = SEED
    FIELD = generateGrid(FIELDSIZE, null);
    for(let y = 0; y < FIELDSIZE; y++) {
        for(let x = 0; x < FIELDSIZE; x++) {
            FIELD[y][x] = {}
            FIELD[y][x].seed = false
            FIELD[y][x].life = false
            FIELD[y][x].adult = {}
        }
    }
    populate();
    isPaused = false
}

function reproduce() {
    for(let i = 0; i < FIELDSIZE; i++) {
        for(let j = 0; j < FIELDSIZE; j++) {
            if(FIELD[j][i].life == true && FIELD[j][i].adult.stats.age % FIELD[j][i].adult.stats.maturity == 0 && FIELD[j][i].adult.stats.age != 0) {
                for(let y = -1; y <= 1; y++) {
                    for(let x = -1; x <= 1; x++) {
                        let adjX = i+x;
                        let adjY = j+y;
                        if(adjX < FIELDSIZE && adjX >= 0 && adjY < FIELDSIZE && adjY >= 0) {
                            if(FIELD[adjY][adjX].life == false && ran.chance(70)) {
                                FIELD[adjY][adjX] = JSON.parse(JSON.stringify(FIELD[j][i]))
                                FIELD[adjY][adjX].seed = true;
                                FIELD[adjY][adjX].adult.stats.age = 0
                            }
                        }
                    }
                }
            }
        }
    }
}


//Main game loop handling graphics and some mouse stuff and calling the logic functions as well
let isPaused = false;
function GAMELOOP() {
    if(!isPaused) {
        //relative canvas mouse coordinates
        let canvasX = window.mouseX - myCanvas.getBoundingClientRect().x;
        let canvasY = window.mouseY - myCanvas.getBoundingClientRect().y;
        //hovered tile
        let tileHovered = new Array(2);
        tileHovered[0] = ~~(canvasX/TILESIZE)
        tileHovered[1] = ~~(canvasY/TILESIZE)
        paragraph.innerText = paragraph.innerText = 'X: ' + window.mouseX + '  Y: ' + window.mouseY + '  Cell: ' + tileHovered[0] + ' ' + tileHovered[1]
        day.innerText = 'Day: ' + DAY
        displayData(fieldSelected)
        SPEED = slider.value;
        //clear canvas
        ctx.clearRect(-WIDTH/2,-HEIGHT/2,WIDTH,HEIGHT)
        //render tiles
        for (let y = 0; y < FIELDSIZE; y++) {
            for (let x = 0; x < FIELDSIZE; x++) {
                if((tileHovered[0] == x) && (tileHovered[1] == y)) {
                    ctx.fillStyle = "silver"
                    ctx.fillRect(x * TILESIZE,(y * TILESIZE),TILESIZE,TILESIZE)
                } else {
                    if(FIELD[y][x].life == true && FIELD[y][x].seed == false) {
                        ctx.drawImage(TILES, FIELD[y][x].id * TILESIZE/2, 0, TILESIZE/2, TILESIZE/2, x * TILESIZE, y * TILESIZE, TILESIZE, TILESIZE)
                    } else if (FIELD[y][x].life == true && FIELD[y][x].seed == true) {
                        ctx.drawImage(TILES, 0 * TILESIZE/2, 1 * TILESIZE/2, TILESIZE/2, TILESIZE/2, x * TILESIZE, y * TILESIZE, TILESIZE, TILESIZE)
                    } else {
                        ctx.fillStyle = "white"
                        ctx.fillRect(x * TILESIZE,(y * TILESIZE),TILESIZE,TILESIZE)
                    }
                }
            }
        }
        step()
        reproduce()
    }
}

//HTML STUFF
//variable for selected cell
let fieldSelected = {life:false};

canvas.addEventListener('click', () => {
    let canvasX = window.mouseX - myCanvas.getBoundingClientRect().x;
    let canvasY = window.mouseY - myCanvas.getBoundingClientRect().y;
    fieldSelected = FIELD[~~(canvasY/TILESIZE)][~~(canvasX/TILESIZE)]
})

//display cell data
let dataDiv = document.getElementById('data')
function displayData(cell) {
    if(cell.life == true) {
        dataDiv.innerHTML = '<p>Genes: ' + cell.adult.genes + '<p>' + 
        '<p> Energy: ' + cell.adult.stats.energy + '</p>' +
        '<p> Health: ' + cell.adult.stats.health + '</p /n' +
        '<p> Age: ' + cell.adult.stats.age + '</p /n' +
        '<p> Lifespan: ' + cell.adult.stats.lifespan + '</p'
    } else {
        dataDiv.innerHTML = '<p>grass</p>'
    }
}

//button...
let button = document.getElementById('start')
function startButton() {
    isPaused = !isPaused
    if(isPaused) {
        button.innerHTML = 'Resume'
    } else {
        button.innerHTML = 'Pause'
    }
}

let seedBox = document.getElementById('seedBox')
seedBox.value = SEED

let slider = document.getElementById('speedSlider')


//calling game loop each frame
let loop = setInterval(GAMELOOP, 1000/FPS);

function help() {
    console.log(
        'restart(seed) - restarts the simulation. put your seed in or leave it blank for a random one'
    )
}