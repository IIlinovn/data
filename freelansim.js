const fs = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

async function getItem(url) {
    const document = (await JSDOM.fromURL(url)).window.document;

    const tags = []

    const tagsHTML = await document.querySelectorAll(".tags__item_link");

    for (let i = 0; i < tagsHTML.length; i++)
        tags.push(tagsHTML[i].innerHTML)

    return {
        title: document.querySelector(".task__title").textContent,
        desc: document.querySelector(".task__description").textContent,
        tags: tags
    }
}

async function getData() {

    let result = []

    const html = await JSDOM.fromURL("https://freelance.habr.com/tasks")

    fs.writeFileSync('hh.html', html.window.document.body.outerHTML)

    const tasksHTML = html.window.document.querySelectorAll(".task");

    for (let i = 0; i < tasksHTML.length; i++) {
        const taskHTML = tasksHTML[i].innerHTML;
        const task = new JSDOM(taskHTML).window.document
        const title = task.querySelector(".task__title a").innerHTML;
        const link = 'https://freelance.habr.com/' + task.querySelector(".task__title a").attributes.href.value

        const { desc, tags } = await getItem(link)

        let price_value
        let price_type
        let price_valuta

        const priceHTML = task.querySelector(".count");
        if (priceHTML) {
            const prices = priceHTML.innerHTML.split(/ <span class="suffix">/);
            price_value = Number.parseInt(prices[0].replace(' ', ''))
            price_valuta = prices[0].split(" ").pop()
            price_type = prices[1]

        }

        result.push({ title, price_value, price_type, price_valuta, desc, tags })
    }

    return result;
}

module.exports = getData
