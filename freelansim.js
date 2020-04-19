const fs = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

async function getItem(url) {
    const document = (await JSDOM.fromURL(url)).window.document;
    
    try {
    
        const tags = []

        const tagsHTML = await document.querySelectorAll(".tags__item_link");

        for (let i = 0; i < tagsHTML.length; i++)
            tags.push(tagsHTML[i].innerHTML)

        return {
            id: task_id = Number(url.split('/').pop()),
            title: document.querySelector(".task__title").textContent,
            desc: document.querySelector(".task__description").textContent.trim().replace("\n", " ").replace(" \n", " ").replace("\n\n", " "),
            tags: tags,
            date_in: document.querySelector(".task__meta").textContent.split('•')[0].trim(),
            response: Number(document.querySelector(".task__meta").textContent.split('•')[1].trim().split('\n').shift()),
            view: Number(document.querySelector(".task__meta").textContent.split('•')[2].trim().split('\n').shift()),
            user_login: document.querySelector(".fullname a").attributes.href.value.split('/')[2],
            user_fio: document.querySelector(".fullname a").textContent,
            finished: Number(document.querySelector(".user_statistics").childNodes[5].textContent.trim().split('\n').pop()),
            in_work: Number(document.querySelector(".user_statistics").childNodes[7].textContent.trim().split('\n').pop()),
            feedback_plus: Number(document.querySelector(".user_statistics").childNodes[11].textContent.trim().split('\n').pop().split(" / ").shift()),
            feedback_minus: Number(document.querySelector(".user_statistics").childNodes[11].textContent.trim().split('\n').pop().split(" / ").pop())
        }
    } catch (error) {
        console.log('Не смог распарсить')
        return {
            id: '',
            title: '',
            tags: '',
            desc: '',
            price_value: '',
            price_valuta: '',
            date_in: '',
            response: '',
            view: '',
            user_login: '',
            user_fio: '',
            finished: '',
            in_work: '',
            feedback_plus: '',
            feedback_minus: ''
        }
    }
}


async function getCountPage() {

    const html = await JSDOM.fromURL("https://freelance.habr.com/tasks")

    fs.writeFileSync('hh.html', html.window.document.body.outerHTML)

    const pages_max = html.window.document.querySelector('.pagination').childNodes[14].textContent
    
    return Number(pages_max);
}



async function getData(numPage = 1) {

    let result = []
    
    const html = await JSDOM.fromURL("https://freelance.habr.com/tasks?page=" + numPage)

    fs.writeFileSync('hh.html', html.window.document.body.outerHTML)

    const tasksHTML = html.window.document.querySelectorAll(".task");

        for (let i = 0; i < tasksHTML.length; i++) {
            const taskHTML = tasksHTML[i].innerHTML;
            const task = new JSDOM(taskHTML).window.document
            const title = task.querySelector(".task__title a").innerHTML;
            const link = 'https://freelance.habr.com' + task.querySelector(".task__title a").attributes.href.value;
        
            let urgent = false
            const urgentHTML = task.querySelector(".task__urgent");
            if (urgentHTML) { 
                urgent = true }
        
            let safe = false
            const safeHTML = task.querySelector(".safe-deal-icon");
            if (safeHTML) { 
                safe = true }

            const { id, desc, tags, date_in, response, view, user_login, user_fio, finished, in_work, feedback_plus, feedback_minus } = await getItem(link);

            let price_value
            let price_type
            let price_valuta

            const priceHTML = task.querySelector(".count");
            if (priceHTML) {
                const prices = priceHTML.innerHTML.split(/ <span class="suffix">/);
                price_value = Number.parseInt(prices[0].replace(' ', ''))
                price_valuta = prices[0].split(" ").pop();
                price_type = prices[1].replace("проект</span>", "проект").replace("час</span>", "час")
            }

            result.push({ id, title, urgent, safe, price_value, price_type, price_valuta, desc, date_in, response, view, tags, user_login, user_fio, finished, in_work, feedback_plus, feedback_minus })
        
        }

    return result;
}

async function main(flag = false, callback) {
    console.log('Start')
    if (flag) {
        const countPage = await getCountPage();
        for(let i=0; i<countPage; i++) {
            console.log('page #' + (i + 1))
            const result = (await getData(i+1).catch(e => []));
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
