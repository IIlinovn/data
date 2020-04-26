const fs = require("fs");
const axios = require("axios");

const freelansim = require("./freelansim");
const freelansim1 = require("./freelansim1");
const freelansim2 = require("./freelansim2");
const freelansim3 = require("./freelansim3");

const config = require("./config");

function send(result) {
  fs.writeFileSync("result.json", JSON.stringify(result, 2, 2));
  axios
    .post(config.base_url + "/" + config.group + "/task", result)
    .then((res) => {
      console.log("Server response: " + res.data);
    })
    .catch((err) => {
      console.error(err.response.data);
    });
}

freelansim(true, send);
freelansim1(true, send);
freelansim2(true, send);
freelansim3(true, send);
