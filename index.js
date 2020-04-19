const fs = require("fs");
//let freelansim = require('./freelansim')
//let freelansim1 = require('./freelansim1')
let freelansim2 = require('./freelansim2')

function send(result) {
    fs.writeFileSync('result.json', JSON.stringify(result, 2, 2))
}

//freelansim(false, send);
//freelansim1(true, send);
freelansim2(true, send);