const fs = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

async function getItem(url) {
    const document = (await JSDOM.fromURL(url)).window.document;

    try {
    
        return {
            id: task_id = Number(url.split('-').pop().split(".").shift()),
            desc: document.querySelector(".txt.href_me").textContent.replace("\n", " "). replace(".\n", ". "),
            user_id: Number(document.querySelector(".name .last_act").attributes.id.value.split("_").pop()),
            user_login: document.querySelector(".avatar a").attributes.href.value.split("/")[2],
            total: Number(document.querySelector(".bage_projects a").textContent),
            feedback_plus: Number(document.querySelector(".positive .cnt").textContent),
            feedback_minus: Number(document.querySelector(".negative .cnt").textContent)
        }
    } catch (error) {
        console.log('Не смог распарсить')
        return {
            id: '',
            desc: '',
            user_id: '',
            user_login: '',
            total: '',
            feedback_plus: '',
            feedback_minus: ''
        }
    }
}

async function getCountPage() {

    const html = await JSDOM.fromURL("https://freelance.ru/projects/?spec=4")

    fs.writeFileSync('hh.html', html.window.document.body.outerHTML)

    const pages_max = html.window.document.querySelector(".pagination.pagination-default").textContent.split(" ")[11]
    
    return Number(pages_max);
}



async function getData(numPage = 1) {

    let result = []
    
    const html = await JSDOM.fromURL("https://freelance.ru/projects/?spec=4?page=" + numPage)

    fs.writeFileSync('hh.html', html.window.document.body.outerHTML)

    const tasksHTML = html.window.document.querySelectorAll(".proj");

        for (let i = 0; i < tasksHTML.length; i++) {      
            const task = tasksHTML[i];  
            const title = task.querySelector("a.ptitle span").innerHTML;
            const link = 'https://freelance.ru' + task.querySelector(".ptitle").attributes.href.value;
        
            let link_page = link.split("//").pop()

            const { id, desc, user_id, user_login, total, feedback_plus, feedback_minus } = await getItem(link);

            let isBusiness = false
            const isBusinessHTML = task.querySelector(".not_public");
            if(isBusinessHTML) {
                isBusiness = true
            }

            let timeOut = false
            const timeOutHTML = task.querySelector("li.proj-inf.status");
            if (timeOutHTML.textContent == "Истек срок публикации") {
                timeOut = true
            }
            
            let forAll = true
            const forAllHTML = task.querySelector(".special_project");
            if(forAllHTML) {
                forAll = false
            }

            let anons = task.querySelectorAll("a.descr span")[1].textContent

            let date_in = task.querySelector(".list-inline li.pdata").attributes.title.value.trim().split("  ").pop().replace(" ", ", ")

            let view = Number(task.querySelector(".views").textContent.split(":").pop())
            
            let response = Number(task.querySelector(".messages a i").textContent)

            let isContract = false
            const isContractHTML = task.querySelector(".prepay_contract");
            if(isContractHTML) {
                isContract = true
            }

            let safe = false
            const safeHTML = task.querySelector(".safe_deal");
            if (safeHTML) { 
                safe = true }

           
            let user_fio
            user_fio = task.querySelector(".owner img").attributes.alt.value

            let price_value
            let price_valuta

            const priceHTML = task.querySelector("span.cost a");
            if (priceHTML) {
                const prices = priceHTML.innerHTML.trim().split(" ");
                price_valuta = prices.pop();
                price_value = Number(prices.slice(0, 2).join().replace(",", ""))
            }

            result.push({  site: 'freelance.ru', link_page, id, title, category: 'Программирование и ИТ', isBusiness, forAll, anons, isContract, timeOut, safe, price_value, price_valuta, desc, date_in, response, view, user_id, user_login, user_fio, total, feedback_plus, feedback_minus })
        
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
