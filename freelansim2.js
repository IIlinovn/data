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
        id: task_id = url.split('/').pop(),
        desc: document.querySelector(".task__description").textContent.trim().replace("\n", " ").replace(" \n", " ").replace("\n\n", " "),
        price_value = Number.parseInt(document.querySelector('.b-layout__txt .b-layout__bold').textContent.trim().split(" ").shift()),
        price_valuta = document.querySelector('.b-layout__txt .b-layout__bold').textContent.trim().split(" ").pop(),
        date_in: document.querySelector(".task__meta").textContent.split('•')[0].trim(),
        
        user_id: document.querySelector(".fullname a").attributes.href.value.split('/')[2],
        user: document.querySelector(".fullname a").textContent
    }
}

async function getCountPage() {

    const html = await JSDOM.fromURL("https://www.fl.ru/projects/")

    fs.writeFileSync('hh.html', html.window.document.body.outerHTML)

    ('.b-pager__back-next')

    body.querySelectorAll('#projects-list').length

    const pages_max = html.window.document.querySelectorAll('#projects-list').length
    
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
            const category = task.querySelector(".b-post__foot span.b-post__bold").innerHTML;
            const link = 'https://www.weblancer.net/' + task.querySelector(".b-post__title  a").attributes.href.value;
        
            let anons = task.querySelector("b-post__body .b-post__txt").textContent

            let safe
            const safeHTML = task.querySelector(".b-post__price a");
            if (safeHTML) { 
                safe = safeHTML.textContent }
            
            let response = Number(task.querySelector('.b-post__foot a').textContent.split(" ").shift())

            let view = Number(task.querySelector('.b-post__foot span.b-post__txt').textContent.trim())

            const { id, desc, price_value, price_valuta, date_in, response, view, user_id, user, finished, in_work, feedbacks } = await getItem(link);

            result.push({ id, title, category, safe, price_value, price_valuta, anons, desc, date_in, response, view, user_id, user })
        
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
        }
    } else {
        callback(await getData());
    }
    console.log('Done')
}

module.exports = main
