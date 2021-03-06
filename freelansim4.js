const fs = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

async function getItem(url) {
    console.log(url)
    const document = (await JSDOM.fromURL(url)).window.document;

    fs.writeFileSync('detail.html', document.body.outerHTML)

    try {
    
        return {
            desc: [...document.querySelectorAll(".txt")].map(item => item.textContent).join(' ').replace("\n", " "). replace(".\n\n", ". "),
            user_id: Number(document.querySelector(".last_act").attributes[0].value.split(/\_/).pop()),
            view: document.querySelector(".viewers div") ? Number(document.querySelector(".viewers div").textContent) : null,
            category: document.querySelector(".proj_breadcrumb a.active").textContent
        }
    } catch (error) {
        console.log('Не смог распарсить')
        return {
            desc: '',
            user_id: '',
            view: '',
            category: ''
        }
    }
}

async function getCountPage() {

    const html = await JSDOM.fromURL("https://freelance.ru/projects/")

    fs.writeFileSync('hh.html', html.window.document.body.outerHTML)

    const pages_max = html.window.document.querySelector(".pagination.pagination-default").textContent.split(" ")[11]
    
    return Number(pages_max);
}



async function getData(numPage = 1) {

    let result = []
    
    const html = await JSDOM.fromURL("https://freelance.ru/projects/?&page=" + numPage);
console.log(numPage);
    fs.writeFileSync('hh.html', html.window.document.body.outerHTML)

    const tasksHTML = html.window.document.querySelectorAll(".proj");

        for (let i = 0; i < tasksHTML.length; i++) {      
            const task = tasksHTML[i];  

            const task_id = Number(task.attributes[1].value)
            let id = task_id

            const title = task.querySelector("a.ptitle span").innerHTML;
            const link = 'https://freelance.ru' + task.querySelector("a.ptitle").attributes.href.value;
        
            let link_page = link.split("//").pop()


            let isBusiness = false
            const isBusinessHTML = task.querySelector("li.proj-inf.status");
            if(isBusinessHTML.textContent == "Для Бизнес-аккаунтов") {
                isBusiness = true
            }

            let timeOut = false
            const timeOutHTML = task.querySelector("li.proj-inf.status");
            if (timeOutHTML.textContent == "Истек срок публикации") {
                timeOut = true
            }
            
            let isSpecial = false
            const isSpecialHTML = task.querySelector("i.special_project_ico");
            if(isSpecialHTML) {
                isSpecial = true
            }

            let anons = task.querySelectorAll("a.descr span")[1].textContent.replace('\n', ' ')

            let date_in = task.querySelector(".list-inline li.pdata").attributes.title.value.trim().split("  ").pop().replace(" ", ", ")

            let view = Number(task.querySelector(".views").textContent.split(":").pop())
            
            let response = Number(task.querySelector(".messages a i").textContent)

            let isContract = false
            const isContractHTML = task.querySelector("li.proj-inf.status");
            if(isContractHTML.textContent == "Заключение договора") {
                isContract = true
            }

            let desc, user_id, category;

            if (!isBusiness && !isContract && !isSpecial && !timeOut)
                ({ desc, user_id, category } = await getItem(link));


            let safe = false
            const safeHTML = task.querySelector("li.proj-inf.status");
            if (safeHTML.textContent == "Безопасная Сделка") { 
                safe = true }

            let user_login
            let user_fio
            user_fio = task.querySelector(".owner img").attributes.alt.value
            user_login = task.querySelector(".owner img").attributes[3].value

            let price_value
            let price_valuta

            const priceHTML = task.querySelector("span.cost a");
            if (priceHTML) {
                const prices = priceHTML.innerHTML.trim().split(" ");
                price_valuta = prices.pop();
                price_value = Number(prices.slice(0, 2).join().replace(",", ""))
            }

            result.push({  site: 'freelance.ru', link_page, id, title, category, isBusiness, isSpecial, anons, isContract, timeOut, safe, price_value, price_valuta, desc, date_in, response, view, user_id, user_login, user_fio })
        
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
            if(i % 5 == 0) {
                await new Promise((resolve) => setTimeout(() => resolve(), 1000 * 30))
           }
        }
    } else {
        try {
            callback(await getData());
            callback(await getData(2));
            callback(await getData(3));
        } catch (error) {
            console.error(error);
        }
    }
    console.log('Done')
}

module.exports = main
