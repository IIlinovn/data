const fs = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

async function getItem(url) {
    const document = (await JSDOM.fromURL(url)).window.document;

    try {
        return {
            id: task_id = Number(url.split("/")[5].split("-").pop()),
            desc: document.querySelector(".text_field p").textContent.replace("↵", " ").replace("\n", " "),
            view: Number(document.querySelector(".dot_divided").lastElementChild.textContent.split(' ').shift()),
            user_fio: document.querySelector(".name a").textContent,
            date_in: document.querySelector(".time_ago").attributes.title.value.replace(" в", ","),
        }
    } catch (error) {
        console.log('Не смог распарсить')
        return {
            id: '',
            desc: '',
            view: '',
            user_fio: '',
            date_in: '',
        }
    }
}

async function getCountPage() {

    const html = await JSDOM.fromURL("https://www.weblancer.net/jobs")

    fs.writeFileSync('hh.html', html.window.document.body.outerHTML)

    const pages_max = html.window.document.querySelector('.pagination_box .no-gutters .text-right a').attributes.href.value.split('=')[1]

    return Number(pages_max);
}



async function getData(numPage = 1) {

    let result = []

    const html = await JSDOM.fromURL("https://www.weblancer.net/jobs/?page=" + numPage)

    fs.writeFileSync('hh.html', html.window.document.body.outerHTML)

    const tasksHTML = html.window.document.querySelectorAll(".click_container-link");

    for (let i = 0; i < tasksHTML.length; i++) {
        const taskHTML = tasksHTML[i].innerHTML;
        const task = new JSDOM(taskHTML).window.document
        const title = task.querySelector(".col-sm-10 .title a").innerHTML;
        const category = task.querySelector(".dot_divided span a").innerHTML;
        const link = 'https://www.weblancer.net' + task.querySelector(".col-sm-10 .title a").attributes.href.value;

        const { id, desc, date_in, user_fio, view } = await getItem(link);

        const anons = task.querySelector(".col-sm-10 p").textContent;

        let success = false
        const successHTML = task.querySelector(".text-success");
        if (successHTML) {
            success = true
        }
        
        let response
        const responseHTML = task.querySelector(".col-sm-2 .text_field");
        if (responseHTML.textContent != "нет заявок") {
            response = Number(responseHTML.textContent.trim().split(" ").shift())
        } else { response = 0 }


        let price_value
        let price_valuta
        const priceHTML = task.querySelector(".amount");
        if (priceHTML) {
            const prices = priceHTML.textContent;
            price_value = Number(prices.slice(1))
            price_valuta = prices.slice(0, 1)
        }

        result.push({ id, title, category, anons, date_in, success, price_value, price_valuta, desc, user_fio, view, response })

    }

    return result;
}

async function main(flag = false, callback) {
    console.log('Start')
    if (flag) {
        const countPage = await getCountPage();
        for (let i = 0; i < countPage; i++) {
            console.log('page #' + (i + 1))
            const result = (await getData(i + 1).catch(e => []));
            callback(result)
            if(i % 5 == 0){
                await new Promise((resolve) => setTimeout(() => resolve(), 1000 * 30))
           }
        }
    } else {
        callback(await getData());
    }
    console.log('Done')
}

module.exports = main
