const fs = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

async function getItem(url) {
    const document = (await JSDOM.fromURL(url)).window.document;
    
    try {
    
        const tags = []

        const tagsHTML = await document.querySelectorAll(".tags__item_link");

        for (let i = 0; i < tagsHTML.length; i++)
            ags.push(tagsHTML[i].innerHTML)

        return {
            id: task_id = Number(url.split('/').pop()),
            title: document.querySelector(".task__title").textContent,
            desc: document.querySelector(".task__description").textContent.trim().replace("\n", " ").replace(" \n", " ").replace("\n\n", " "),
            tags: tags,
            date_in: document.querySelector(".task__meta").textContent.split('•')[0].trim(),
            response: document.querySelector(".task__meta").textContent.split('•')[1].trim().replace("\n", "").replace("\nотклик", "отклик").replace("\nотклика", "отклика").replace("\nоткликов", "откликов"),
            view: document.querySelector(".task__meta").textContent.split('•')[2].trim().replace("\n", "").replace("\nпросмотр", "просмотр").replace("\nпросмотра", "просмотра").replace("\nпросмотров", "просмотров"),
            finished: document.querySelector(".user_statistics").childNodes[5].textContent.trim().replace("\n", " "),
            in_work: document.querySelector(".user_statistics").childNodes[7].textContent.trim().replace("\n", " ").replace(" \n", " "),
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

    //const html = await JSDOM.fromURL("https://youdo.com/tasks-all-any-webdevelopment-1")

    //fs.writeFileSync('hh.html', html.window.document.body.outerHTML)

    const pages_max = 210
    
    return Number(pages_max);
}



async function getData(numPage = 1) {

    let result = []
    
    const html = await JSDOM.fromURL("https://youdo.com/tasks-all-any-webdevelopment-1?page=" + numPage)

    fs.writeFileSync('hh.html', html.window.document.body.outerHTML)

    const tasksHTML = html.window.document.querySelectorAll(".b-tasks__item__wrapper");

        for (let i = 0; i < tasksHTML.length; i++) {
            const taskHTML = tasksHTML[i].innerHTML;
            const task = new JSDOM(taskHTML).window.document
            const title = task.querySelector("a.b-tasks__item__title").innerHTML;
            const link = 'https://youdo.com' + task.querySelector("a.b-tasks__item__title").attributes.href.value;
        
            const { id, desc, tags, date_in, response, view, finished, in_work } = await getItem(link);

            let isVacancy = false
            const isVacancyHTML = task.querySelector(".b-tasks__item__business");
            if(isVacancyHTML.textContent == "Вакансия") {
                isVacancy = true
            }
        
            let safe = false
            const safeHTML = task.querySelector(".b-tasks__item__sbr");
            if (safeHTML) { 
                safe = true }
            
            let user_id
            let user_fio
            user_id = task.querySelector("a.b-avatar").attributes.href.value.slice(2)
            user_fio = task.querySelector("a.b-tasks__item__user_name").textContent

            let price_value
            let price_valuta
            let maxprice

            const priceHTML = task.querySelector(".b-tasks__item__price");
            if (priceHTML) {
                const prices = priceHTML.innerHTML.trim().split(" ");
                price_valuta = prices.pop();
                (prices.indexOf("до") != 0) ? price_value = Number(prices.slice(0, 2).join().replace(",", "")) : maxprice = Number(prices.slice(1, 3).join().replace(",", ""))
            }

            let feedback_plus
            let feedback_minus
            if(task.querySelector("p.b-tasks__item__user_reviews span").textContent == "Нет отзывов") {
                feedback_plus = 0
                feedback_minus = 0
            } else {
                feedback_plus = Number(task.querySelector("span.b-icon-reviews-positive").textContent)
                feedback_minus = Number(task.querySelector("span.b-icon-reviews-negative").textContent)
            }

            result.push({ id, title, isVacancy, urgent, safe, price_value, maxprice, price_valuta, desc, date_in, response, view, tags, user_id, user_fio, finished, in_work, feedback_plus, feedback_minus })
        
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
