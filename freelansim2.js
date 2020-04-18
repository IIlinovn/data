const fs = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

async function getItem(url) {
    const document = (await JSDOM.fromURL(url)).window.document;

    try {
    
        let task_id = Number(url.split("/")[4])
    
        const tags = []

        const tagsHTML = await document.querySelectorAll("#project_info_" + task_id + ".b-layout .b-layout__txt_padbot_20 a");

        for (let i = 0; i < tagsHTML.length; i++)
            tags.push(tagsHTML[i].innerHTML)
    
            return {
                id: task_id,
                tags: tags,
                desc: document.querySelector("#project_info_" + task_id + " " + "#projectp" + task_id).textContent.trim(),
                price_value: document.querySelector('td.b-layout__td .b-layout__txt span.b-layout__bold').textContent.trim().split(" ").reverse().slice(1).reverse().join().replace(",", ""),
                price_valuta: document.querySelector('td.b-layout__td .b-layout__txt span.b-layout__bold').textContent.trim().split(" ").pop(),
                date_in: document.querySelectorAll(".b-layout__txt.b-layout__txt_padbot_30 .b-layout__txt.b-layout__txt_fontsize_11")[1].textContent.trim().split("[").pop().split(":").slice(1).join().replace("]", "").replace(",", ":").replace(" |", ","),
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

    //const html = await JSDOM.fromURL("https://www.fl.ru/projects/")

    //fs.writeFileSync('hh.html', html.window.document.body.outerHTML)

    const pages_max = 355
    
    return Number(pages_max);
}



async function getData(numPage = 1) {

    let result = []
    
    const html = await JSDOM.fromURL("https://www.fl.ru/projects/?page=" + numPage)

    fs.writeFileSync('hh.html', html.window.document.body.outerHTML)

    const tasksHTML = html.window.document.querySelectorAll(".b-post");

        for (let i = 0; i < tasksHTML.length; i++) {
            const taskHTML = tasksHTML[i].innerHTML;
            const task = new JSDOM(taskHTML).window.document
            const title = task.querySelector(".b-post__title  a").innerHTML;
            const category = task.querySelector(".b-post__foot span.b-post__bold").textContent;
            const link = 'https://www.fl.ru' + task.querySelector(".b-post__title  a").attributes.href.value;
        
            const { id, tags, desc, price_value, price_valuta, date_in } = await getItem(link);
            
            let anons = task.querySelector(".b-post__body .b-post__txt").textContent

            let urgent = false
            const urgentHTML = task.querySelector(".b-post__title img")
            if (urgentHTML) { 
                urgent = true }
            
            let safe = false
            const safeHTML = task.querySelector(".b-post__price a")
            if (safeHTML) { 
                safe = true }
            
            let response
            const responseHTML = task.querySelector('.b-post__foot a')
            if(responseHTML.textContent != "Нет ответов") {
             response = Number(responseHTML.textContent.split(" ").shift())
            } else response = 0

            let view = Number(task.querySelector('.b-post__foot span.b-post__txt').textContent.trim())
            
            let isHidden = false
            const hiddenHTML = task.querySelector('.b-post__foot .b-post__txt .b-post__only')
            if(hiddenHTML.textContent != " ") {
                isHidden = true
            } 
            
            let forAll = false
            const forAllHTML = task.querySelector(".b-post__foot .b-post__txt span.b-post__bold i")
            if (forAllHTML) {
                forAll = true
            }

            result.push({ id, isHidden, title, urgent, tags, safe, forAll, anons, price_value, price_valuta, anons, desc, category, date_in, response, view })
        
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
