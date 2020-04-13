const fs = require("fs");
let freelansim = require('./freelansim')

function send(result) {
    fs.writeFileSync('result.json', JSON.stringify(result, 2, 2))
}

freelansim(false, send);