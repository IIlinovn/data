const fs = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

async function getItem(url) {
    const document = (await JSDOM.fromURL(url)).window.document;
    
    try {
    
        return {
            id: task_id = Number(url.split('/').pop().slice(1)),
            desc: document.querySelector(".b-task-block__description span").textContent.replace("\n", " "). replace(".\n", ". "),
            date_in: document.querySelector(".b-task-block__info .date-value").textContent,
            category: document.querySelector("[itemprop=serviceType]").textContent.replace("\n", " ").trim(),
            view: document.querySelector(".b-task-brief__item--status + li").textContent.split(" ").shift(),
        }
    } catch (error) {
        console.log('Не смог распарсить')
        return {
            id: '',
            desc: '',
            view: '',
            category: '',
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

    const tasksHTML = html.window.document.querySelectorAll(".b-tasks__item:not(.hidden)");

        for (let i = 0; i < tasksHTML.length; i++) {      
            const task = tasksHTML[i];  
            const title = task.querySelector(" a.b-tasks__item__title").innerHTML;
            const link = 'https://youdo.com' + task.querySelector("a.b-tasks__item__title").attributes.href.value;
        
            const { id, desc, category, date_in, view  } = await getItem(link);

            let isVacancy = false
            const isVacancyHTML = task.querySelector(".b-tasks__item__business");
            if(isVacancyHTML) {
                isVacancy = true
            }

            let success = false
            const successHTML = task.querySelector(".item___72b99.status___05114:not(.i-new___5d5e0)");
            if (successHTML) {
                success = true
            }

            let safe = false
            const safeHTML = task.querySelector(".b-tasks__item__sbr");
            if (safeHTML) { 
                safe = true }

            let user_id
            let user_fio
            user_id = Number(task.querySelector("a.b-avatar").attributes.href.value.slice(2))
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
                if(task.querySelector("span.b-icon-reviews-negative")) {
                    feedback_minus = Number(task.querySelector("span.b-icon-reviews-negative").textContent)
                } else feedback_minus = 0
            }

            result.push({ id, title, isVacancy, success, safe, price_value, maxprice, price_valuta, desc, date_in, category, view, user_id, user_fio, feedback_plus, feedback_minus })
        
        }

    return result;
}

async function main(flag = false, callback) {
    console.log('Start')
    if (flag) {
        const countPage = await getCountPage();
        for(let i=0; i<countPage; i++) {
            console.log('page #' + (i + 1))
            const result = (await getData(i+1).catch(e => {
                console.error(e);
                return [];
            }));
            callback(result)
            if(i % 5 == 0){
                await new Promise((resolve) => setTimeout(() => resolve(), 1000 * 30))
           }
        }
    } else {
        try {
            callback(await getData());
        } catch (error) {
            console.error(error);
        }
    }
    console.log('Done')
}

module.exports = main
