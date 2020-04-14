const fs = require("fs");
let freelansim = require('./freelansim')
let freelansim2 = require('./freelansim2')

function send(result) {
    fs.writeFileSync('result.json', JSON.stringify(result, 2, 2))
}

freelansim(false, send);

//freelansim2(false, send)