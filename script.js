const FIELDSIZE = 10
let DAY = 0;
let HOUR = 0;
//temperature
let TEMP = 24;
//variable ideas: rainChance,  

const generateGrid = (size) => {
    return (new Array(size).fill(null)
    .map(() => new Array(size).fill(null))
    )
}

const FIELD = generateGrid(FIELDSIZE)


function plant(genes, stats) {
    this.genes = genes
    this.stats = stats

    //chromos is the number of chromosomes a plant has
    this.randomDNA = (chromos = 5) => {
        this.genes = new Array(Math.ceil(Math.random() * chromos)).fill(null)
        .map(() => new Array(10).fill(null).map((x) => x = ran(4)))
    }
}

//randomness functions

//basic random - returns a random value ranging from 0 and a given input
function ran(n) {
    return ~~(Math.random() * (n + 1))
}

//returns a random value from a given range
ran.range = function(a,b) {
    return a + ~~(Math.random() * (b - a + 1)) 
}

//given a chance returns either true or false
ran.chance = (chance) => {
    if (ran(100) <= chance) {
        return true
    } else {
        return false
    }
}
