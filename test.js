const fs = require("fs");
const axios = require("axios");

const freelansim = require("./freelansim");
const freelansim1 = require("./freelansim1");
const freelansim2 = require("./freelansim2");
const freelansim3 = require("./freelansim3");
const freelansim4 = require("./freelansim4");

const config = require("./config-test");

function send(result) {
  fs.writeFileSync("result.json", JSON.stringify(result, 2, 2));
  axios
    .post(config.base_url + '/' + config.group + "/task", result)
    .then(res => {
        console.log('Server response: ' + res.data)
    })
    .catch((err) => {
        console.error(err.response.data)
    });
}

//freelansim(false, send);
freelansim1(false, send);
//freelansim2(false, send);
//freelansim3(false, send);
//freelansim4(false, send);
