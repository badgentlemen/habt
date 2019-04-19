const puppeteer = require('puppeteer');
const node: DocumentFragment = require('./test.node.js')

interface IHabrPostDetail {
    user: IHabrUser;
    link: string;
    published_at: string;
    title: string;
    text: string;
    rating: Number;
    views: string;
    comments: Number;
}

interface IHabrUser {
    name: string;
    url: string;
    avatar: string;
}

(async () => {
    let browser = puppeteer.launch();
    let page = browser.newPage();
    await page.goto("https://habr.com/ru/search/page1/?target_type=posts&q=%D0%B8%D0%BB%D0%BE%D0%BD+%D0%BC%D0%B0%D1%81%D0%BA&order_by=date&flow=");

    const numberOfPosts: number = await page.evaluate(() => new Number(document.querySelector('.tabs-menu__item-counter_total').innerHTML))



    browser.close();
})()


const supperTrim = (inner: string): string => {
    return inner.replace(/(<([^>]+)>)/ig, "").trim();
}

async function seguePageAndParse(pageUrl: string): Promise<[IHabrPostDetail]> {
    let answer = postNodeParser(node)
    return [answer]
}

const postNodeParser = (node: HTMLElement | DocumentFragment): IHabrPostDetail => {
    const header = node.querySelector('.post__meta');
    const username = header.querySelector('span.user-info__nickname').innerHTML.trim();
    const url = header.querySelector('a.post__user-info').getAttribute('href');
    const avatar = header.querySelector('img.user-info__image-pic_small').getAttribute('src');
    const published_at = header.querySelector('span.post__time').innerHTML.trim();
    const post = node.querySelector('.post__title_link');
    const link = post.getAttribute('href')
    const title = supperTrim(post.innerHTML);
    const text = supperTrim(node.querySelector('.post__text').innerHTML)
    const rating = new Number(node.querySelector('.voting-wjt__counter').innerHTML || 0);
    const views = node.querySelector('.post-stats__views-count').innerHTML
    const comments = new Number(node.querySelector('.post-stats__comments-count').innerHTML || 0);

    return {
        user: {
            name: username,
            url,
            avatar
        },
        link,
        published_at,
        title,
        text,
        rating,
        views,
        comments
    }
}


let output: [IHabrPostDetail];

let seArchTerm = process.env.term || "Илон Маск";


seguePageAndParse("").then(output => {
    console.log(output);
})


console.log()

