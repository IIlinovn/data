const fs = require("fs");
let freelansim = require('./freelansim')

async function dd() {
    fs.writeFileSync('result.json', JSON.stringify(await freelansim(), 2, 2))
}


dd()