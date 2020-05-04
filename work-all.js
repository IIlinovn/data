const fs = require("fs");
const axios = require("axios");

const freelansim = require("./freelansim");
const freelansim1 = require("./freelansim1");
const freelansim2 = require("./freelansim2");
const freelansim3 = require("./freelansim3");
const freelansim4 = require("./freelansim4");
const freelansim5 = require("./freelansim5");

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

switch (Number(process.argv[2])) {
  case 1:
    freelansim(true, send);
    break;
  case 2:
    freelansim1(true, send);
    break;
  case 3:
    freelansim2(true, send);
    break;
  case 4:
    freelansim3(true, send);
    break;
  case 5:
    freelansim4(true, send);
    break;
  case 6:
    freelansim5(true, send);
    break;
  default:
    freelansim(true, send);
    freelansim1(true, send);
    freelansim2(true, send);
    freelansim3(true, send);
    freelansim4(true, send);
    freelansim5(true, send);

    break;
}