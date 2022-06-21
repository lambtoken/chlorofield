const FIELDSIZE = 15;
let SPEED = 3;
const FPS = 30;
let DAY = 0;
let nSpecies = 8;
//let HOUR = 0;
//temperature
//let TEMP = 24;
let SEED = Math.random().toString(36).substring(2,12);


//RANDOMNESS FUNCTIONS
function mulberry32(a) {
    return function() {
      let t = a += 0x6D2B79F5;
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
    }
}
let FIELDTEMP;


let species = []
function genSpecies(n) {
    for(let i = 0; i < n; i++) {
        species.push(
            {
                seed: false,
                life: false,
                stats: randomStats()
            }
        )
        species[i].id = i
    }
}
genSpecies(nSpecies)


function randomStats() {
    return(
        {
            energy: ran.range(30,80),
            health: ran.range(80,100),
            age: 0,
            lifespan: ran.range(50, 70),
            maturity: ran.range(10,20),
            seedingChance: ran.range(0.5,2),
            germination: ran.range(10,20),
            gen: 0
        }
    )
}

//SKINS
let numberOfSkins = 10;
let skins = []
let skinsTaken;

function skinsSetup() {
    for(let j = 0; j < Math.ceil(numberOfSkins/8); j++) {
        for(let i = 0; i < 8; i++) {
        skins.push([[i],[j]])
        }
    }
    skins.splice(numberOfSkins + 1);

    skinsTaken = JSON.parse(JSON.stringify(skins))

    for(let i = nSpecies; i <= numberOfSkins; i++) {
        skinsTaken.splice(~~(random() * skinsTaken.length), 1)
    }
}
skinsSetup()

//Generates a small 3x3 cluster of plants ready to be placed on the FIELD
function makeCluster(plant, maxSeed = 1, clusterSize = 3) {
    let max = maxSeed;
    let plant2place;
    let positions = new Array(clusterSize ** 2)
    for(let i = 0; i < positions.length; i++) {
        positions[i] = i;
    }
    let cluster = generateGrid(clusterSize, null)
    while(max > 0) {
        let n = ~~(random() * positions.length)
        let position = positions[n]
        let x = position%clusterSize;
        let y = ~~(position/clusterSize);
        
        //plant2place = 
        cluster[y][x] = JSON.parse(JSON.stringify(plant))
        cluster[y][x].stats = randomStats()
        cluster[y][x].life = true
        cluster[y][x].seed = false
  
        positions.splice(n, 1)
        max--
    }
    return cluster
}


//Places a number of species on the FIELD and makes sure they get an unique ID
function populate() {
    for(let i = 0; i < species.length; i++) {
        let cluster = makeCluster(species[i], 5)
        let randomCords = [ran(FIELDSIZE-1), ran(FIELDSIZE-1)]
        for(let j = 0; j < cluster.length; j++) {
            for(let k = 0; k < cluster.length; k++) {
                let x = randomCords[1] + k;
                let y = randomCords[0] + j;
                if((x < FIELDSIZE && x >= 0 && y < FIELDSIZE && y >= 0) && cluster[k][j] !== null) {
                    FIELD[randomCords[1] + k][randomCords[0] + j] = JSON.parse(JSON.stringify((cluster[k][j])))
                }
            }
        }
    }
}
populate()
populate()
populate()
populate()

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
canvas.addEventListener('mousemove', (event) => {
    window.mouseX = event.clientX - myCanvas.getBoundingClientRect().x
    window.mouseY = event.clientY - myCanvas.getBoundingClientRect().y
})
let day = document.getElementById('day')

let rainChance = 0;
function rain(duration) {
    return duration
}
let TICK = 0;
//1 step in time
function step() {
    TICK++
    if (TICK > ~~(FPS/SPEED)) {
        for (let y = 0; y < FIELDSIZE; y++) {
            for (let x = 0; x < FIELDSIZE; x++) {
                if((FIELD[y][x].life == true) && (FIELD[y][x].seed == false)) {
                    FIELD[y][x].stats.age += 1

                    if((FIELD[y][x].stats.age > FIELD[y][x].stats.lifespan) || FIELD[y][x].stats.energy < 1) {
                        FIELD[y][x] = {}
                        FIELD[y][x].seed = false
                        FIELD[y][x].life = false
                    }
                } else if(FIELD[y][x].life == true && FIELD[y][x].seed == true) {
                    FIELD[y][x].stats.age += 1
                        if(FIELD[y][x].stats.age > FIELD[y][x].stats.germination) {
                            FIELD[y][x].seed = false
                            FIELD[y][x].stats.age = 0
                        }
                }
            }
        }
    TICK = 0
    DAY++
    }
}

function restart() {
    //isPaused = true
    TICK = 0
    DAY = 0
    random = mulberry32(hashCode(SEED))
    SEED = seedBox.value
    FIELD = generateGrid(FIELDSIZE, null);
    for(let y = 0; y < FIELDSIZE; y++) {
        for(let x = 0; x < FIELDSIZE; x++) {
            FIELD[y][x] = {}
            FIELD[y][x].seed = false
            FIELD[y][x].life = false
        }
    }
    species = []
    genSpecies(nSpecies)
    skinsSetup();
    populate();
    //isPaused = false
}

function reproduce() {
    FIELDTEMP = JSON.parse(JSON.stringify(FIELD))
    for(let i = 0; i < FIELDSIZE; i++) {
        for(let j = 0; j < FIELDSIZE; j++) {
            if(FIELD[j][i].life == true && FIELD[j][i].seed == false && FIELD[j][i].stats.age % FIELD[j][i].stats.maturity == 0 && FIELD[j][i].stats.age != 0) {
                for(let y = -1; y <= 1; y++) {
                    for(let x = -1; x <= 1; x++) {
                        let adjX = i+x;
                        let adjY = j+y;
                        if(adjX < FIELDSIZE && adjX >= 0 && adjY < FIELDSIZE && adjY >= 0) {
                            if(FIELD[adjY][adjX].life == false && ran.chance(5)) {
                                FIELDTEMP[adjY][adjX] = JSON.parse(JSON.stringify(FIELD[j][i]))
                                FIELDTEMP[adjY][adjX].seed = true;
                                FIELDTEMP[adjY][adjX].stats.lifespan += Number((ran.chance(50) ? '+' : '-') + '100')
                                FIELDTEMP[adjY][adjX].stats.germination += Number((ran.chance(50) ? '+' : '-') + '1')
                                FIELDTEMP[adjY][adjX].stats.maturity += Number((ran.chance(50) ? '+' : '-') + '1')
                                FIELDTEMP[adjY][adjX].stats.age = 0
                                FIELDTEMP[adjY][adjX].stats.gen += 1
                            }
                        }
                    }
                }
            }
        }
    }
    FIELD = JSON.parse(JSON.stringify(FIELDTEMP))
}


//Main game loop handling graphics and some mouse stuff and calling the logic functions as well
let isPaused = false;
function GAMELOOP() {
    //hovered tile
    let tileHovered = new Array(2);
    tileHovered[0] = ~~(window.mouseX/TILESIZE)
    tileHovered[1] = ~~(window.mouseY/TILESIZE)

    paragraph.innerText = paragraph.innerText = 'X: ' + window.mouseX + '  Y: ' + window.mouseY + '  Cell: ' + tileHovered[0] + ' ' + tileHovered[1]
    day.innerText = 'Day: ' + DAY
    displayData(fieldSelected)
    if(!isPaused) {
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
                        ctx.drawImage(TILES, skinsTaken[FIELD[y][x].id][0] * TILESIZE/2, skinsTaken[FIELD[y][x].id][1] * TILESIZE/2, TILESIZE/2, TILESIZE/2, x * TILESIZE, y * TILESIZE, TILESIZE, TILESIZE)
                    } else if (FIELD[y][x].life == true && FIELD[y][x].seed == true) {
                        ctx.drawImage(TILES, 7 * TILESIZE/2, 7 * TILESIZE/2, TILESIZE/2, TILESIZE/2, x * TILESIZE, y * TILESIZE, TILESIZE, TILESIZE)
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
    fieldSelected = FIELD[~~(window.mouseY/TILESIZE)][~~(window.mouseX/TILESIZE)]
})

//display cell data
let dataDiv = document.getElementById('data')
function displayData(cell) {
    if(cell.life == true) {
        dataDiv.innerHTML = '<p> Energy: ' + cell.stats.energy + '</p>' +
        '<p> Health: ' + cell.stats.health + '</p /n' +
        '<p> Age: ' + cell.stats.age + '</p /n' +
        '<p> Lifespan: ' + cell.stats.lifespan + '</p' +
        '<p> Maturity: ' + cell.stats.maturity + '</p' +
        '<p> Germination: ' + cell.stats.germination + '</p' +
        '<p> Gen: ' + cell.stats.gen + '</p'

    } else {
        dataDiv.innerHTML = '<p>grass</p>'
    }
}

//button...
let button = document.getElementById('pause')
function pauseButton() {
    isPaused = !isPaused
    if(isPaused) {
        button.innerHTML = 'Resume'
    } else {
        button.innerHTML = 'Pause'
    }
}

let seedBox = document.getElementById('seedBox')
seedBox.value = SEED;

document.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault()
    restart(seedBox.value)    
})

let slider = document.getElementById('speedSlider')


//calling game loop each frame
let loop = setInterval(GAMELOOP, 1000/FPS);

function help() {
    console.log(
        'https://www.youtube.com/watch?v=jJ2d1FJRv3E!'
    )
}