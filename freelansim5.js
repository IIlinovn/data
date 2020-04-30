const fs = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

async function getItem(url) {
    //TODO!! не парсит страницы??
    const document = (await JSD??romURL(url)).window.document;

    const tags = []

    const tagsHTML = await docu??.querySelectorAll(".tags .tag.with-tooltip");

    for (let i = 0; i < tagsHTML.length; i++)
        {tags.push(tagsHTML[i].innerHTML)}
    
    const category = []

    const categoryHTML = await document.querySelectorAll(".smaller a");
    
    for (let i = 0; i < categoryHTML.length; i++)
        {category.push(categoryHTML[i].innerHTML)}
    
    const descs = []

    const descsHTML = await document.querySelectorAll(".well p");
    
    for (let i = 0; i < descsHTML.length; i++)
        {descs.push(descsHTML[i].innerHTML)}
    
    try {
        
        return {
            id: task_id = Number(url.split('/').pop()),
            category: category,
            desc: descs.join().replace(",", " "),
            tags: tags,
            user_id: Number(document.querySelector(".avatar-container .profile-status").attributes[0].textContent),
            user_fio: document.querySelector("a.profile-name").textContent,
            user_login: document.querySelector("a.profile-name").attributes.href.value.split('/').pop().split(".").shift(),
            date_in: document.querySelectorAll(".col-md-3 .row")[1].querySelector(".with-tooltip").attributes[4].value.slice(12).replace(" в", ","),
            response: Number(document.querySelector("span#bids_count").textContent),
            view: Number(document.querySelectorAll(".col-md-3 .row")[1].querySelector(".widget div div").textContent.trim().split(' ').shift()),
            feedback_plus: Number(document.querySelector("span.nowrap span.text-green").textContent),
            feedback_minus: Number(document.querySelector("span.nowrap span.text-light-gray.with-tooltip").textContent)
        }
    } catch (error) {
        console.log('Не смог распарсить')
        return {
            id: '',
            category: '',
            desc: '',
            tags: '',
            user_id: '',
            user_fio: '',
            user_login: '',
            date_in: '',
            response: '',
            view: '',
            feedback_plus: '',
            feedback_minus: '',
        }
    }
}

async function getCountPage() {

    const html = await JSDOM.fromURL("https://freelancehunt.com/projects")

    fs.writeFileSync('hh.html', html.window.document.body.outerHTML)
   
    const pages_max = Math.round(Number(html.window.document.querySelector("h1 span").textContent)/15)
    
    return Number(pages_max);
}



async function getData(numPage = 1) {

    let result = []
    
    const html = await JSDOM.fromURL("https://freelancehunt.com/projects?page=" + numPage)

    fs.writeFileSync('hh.html', html.window.document.body.outerHTML)

    const tasksHTML = html.window.document.querySelectorAll(".table.project-list tbody tr");

        for (let i = 0; i < tasksHTML.length; i++) {
            const task = tasksHTML[i];
            const title = task.querySelector("td.left a").innerHTML;
            const link = task.querySelector("td.left a").attributes.href.value;
            
            let link_page = link.split("//").pop()
            
            const { id, desc, tags, category, user_id, user_fio, user_login, date_in, response, view, feedback_plus, feedback_minus } = await getItem(link);

            let anons
            let anonsHTML = task.querySelector("td.left p")
            if (anonsHTML) {
                anons = anonsHTML.innerHTML;
            } else {
                anons = task.querySelector("td.left div small").textContent
            }
            anons = anons.trim().replace("\n", " ")
        
            let isHidden = false
            const isHiddenHTML = task.querySelector("img.with-tooltip");
            if (isHiddenHTML && isHiddenHTML.attributes.src.value == "/static/images/fugu/lock.png") { 
                isHidden = true }

            let isBusiness = false
            const isBusinessHTML = task.querySelector("img.with-tooltip");
            if (isBusinessHTML && isBusinessHTML.attributes.src.value == "/static/images/freelancehunt/sm/business_safe.svg") { 
                isBusiness = true }

            let isVacancy = false
            const isVacancyHTML = task.querySelector("img.with-tooltip");
            if (isVacancyHTML && isVacancyHTML.attributes.src.value == "/static/images/fugu/calendar-month.png") { 
                isVacancy = true }
            
            let budgetUpper = false
            const budgetUpperHTML = task.querySelector("img.with-tooltip");
            if (budgetUpperHTML && budgetUpperHTML.attributes.src.value == "/static/images/fugu/diamond.png") { 
                budgetUpper = true }
                
            let urgent = false
            const urgentHTML = task.querySelector("img.with-tooltip");
            if (urgentHTML && urgentHTML.attributes.src.value == "/static/images/fugu/fire-big.png") { 
                urgent = true }

            let forPlus = false
            const forPlusHTML = task.querySelector("img.with-tooltip");
            if (forPlusHTML && forPlusHTML.attributes.src.value == "/static/images/freelancehunt/sm/plus.svg") { 
                forPlus = true }
        
            let isPremium = false
            const isPremiumHTML = task.querySelector(".label.color-orange.with-tooltip");
            if (isPremiumHTML) { 
                isPremium = true }

            let price_value
            let price_valuta
            
            const priceHTML = task.querySelector(".text-green.price");
            if (priceHTML) {
                const prices = priceHTML.innerHTML.trim().split(" ");
                price_value = Number.parseInt(prices.shift())
                price_valuta = priceHTML.querySelector("span").textContent;
            }

            result.push({ site: 'freelancehunt.com', link_page, id, title, anons, urgent, category, isHidden, isBusiness, isPremium, budgetUpper, forPlus, isVacancy, price_value, price_valuta, desc, date_in, response, view, tags, user_id, user_login, user_fio, feedback_plus, feedback_minus })
        
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