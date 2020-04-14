const fs = require("fs");
let freelansim = require('./freelansim')
let freelansim1 = require('./freelansim1')

function send(result) {
    fs.writeFileSync('result.json', JSON.stringify(result, 2, 2))
}

//freelansim(false, send);
freelansim1(false, send);