const fs = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

async function getData() {

    let result = []

    const html = await JSDOM.fromURL("https://freelance.habr.com/tasks")

    fs.writeFileSync('hh.html', html.window.document.body.outerHTML)

    const tasksHTML = html.window.document.querySelectorAll(".task");

    for (let i = 0; i < tasksHTML.length; i++) {
        const taskHTML = tasksHTML[i].innerHTML;
        const title = new JSDOM(taskHTML).window.document.querySelector(".task__title a").innerHTML;

        let price_value
        let price_type
        let price_valuta

        const priceHTML = new JSDOM(taskHTML).window.document.querySelector(".count");
        if (priceHTML) {
            const prices  = priceHTML.innerHTML.split(/ <span class="suffix">/);
            price_value = Number.parseInt(prices[0].replace(' ', ''))
            price_valuta = prices[0].split(" ").pop()
            price_type = prices[1]
        }

        result.push({ title, price_value, price_type, price_valuta })
    }

    return result;
}

module.exports = getData
