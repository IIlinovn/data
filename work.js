const fs = require("fs");
const axios = require("axios");

const freelansim = require("./freelansim");

const config = require("./config");

function send(result) {
  fs.writeFileSync("result.json", JSON.stringify(result, 2, 2));
  axios
    .post(config.base_url + '/' + config.group + "/task", result)
    .then(res => {
        console.log('Server response: ' + res.data)
    })
    .catch((err) => {
        console.error(err)
    });
}

freelansim(false, send);
