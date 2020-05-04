const fs = require("fs");
//let freelansim = require('./freelansim')
//let freelansim1 = require('./freelansim1')
//let freelansim2 = require('./freelansim2')
//let freelansim3 = require('./freelansim3')
//let freelansim4 = require('./freelansim4')
let freelansim5 = require('./freelansim5')

function send(result) {
    fs.writeFileSync('result.json', JSON.stringify(result, 2, 2))
}

//freelansim(false, send);
//freelansim1(true, send);
//freelansim2(true, send);
//freelansim3(true, send);
//freelansim4(true, send);
freelansim5(false, send);