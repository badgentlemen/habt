const jsdom = require('jsdom');
const { JSDOM } = jsdom;

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
    url: string | null;
    avatar: string | null;
}

interface IHabrSearchOptions {
    searchTerm: string;
    orderBy: IHabrPostOrderBy;
}

interface IHabrResponse {
    posts: IHabrPostDetail[];
    pagesCount: Number;
    id?: Number;
}

type IHabrPostOrderBy = 'relevance' | 'date' | 'rating'

export class Habt {
    private options: IHabrSearchOptions;
    private firstPage: URL;
    outputs: [IHabrPostDetail];
    isProcessDone: boolean;
    private index: Number;

    constructor(options: IHabrSearchOptions = {
        orderBy: 'date',
        searchTerm: ''
    }) {
        this.options = options;
        this.firstPage = this.sequilizeEndpoint(1);
    }

    async search(): Promise<IHabrPostDetail[]> {
        this.isProcessDone = false;
        const self = this;
        const firsQuery = await self.seguePageAndParse(self.firstPage, true);
        const maxPage = firsQuery.pagesCount;
        let promises: IHabrResponse[] = [];
        for (let i = 2; i <= maxPage; i++) {
            self.index = i;
            const pageEndpoint = self.sequilizeEndpoint(i);
            const response = await self.seguePageAndParse(pageEndpoint);
            promises.push(response);
        }
        const otherPagesPosts = [].concat(...promises.map(response => response ? response.posts : []));
        this.isProcessDone = true;
        return [].concat(...firsQuery.posts, otherPagesPosts);
    }

    private async seguePageAndParse(url: URL, requirePagesCount: Boolean = false): Promise<IHabrResponse | null> {
        try {
            let dom = await JSDOM.fromURL(url);
            let node = dom.window.document;

            let pagesCount: Number = 0

            if (requirePagesCount) {
                const pagesCountNodeURL = node.querySelector('.toggle-menu_pagination > .toggle-menu__item_pagination:last-child > .toggle-menu__item-link_pagination').getAttribute('href');

                pagesCount = pagesCountNodeURL ? this.searchPageCountFromSource(pagesCountNodeURL) : 0
            }
            
            let liCollection = Array.from(node.querySelectorAll('.content-list_posts > .content-list__item_post')) as HTMLLIElement[];

            let posts: IHabrPostDetail[] = liCollection.map(element => this.postNodeParse(element));
            return {
                posts,
                pagesCount
            };
        } catch(error) {
            return null;
        }
    }

    private postNodeParse(node: HTMLElement | DocumentFragment): IHabrPostDetail {
        const header = node.querySelector('.post__meta');
        const name = header.querySelector('span.user-info__nickname') ? header.querySelector('span.user-info__nickname').innerHTML.trim() : '';
        const url = header.querySelector('a.post__user-info') ? header.querySelector('a.post__user-info').getAttribute('href') : '';
        const avatar = header.querySelector('img.user-info__image-pic_small') ? header.querySelector('img.user-info__image-pic_small').getAttribute('src') : null;
        const published_at = header.querySelector('span.post__time') ? header.querySelector('span.post__time').innerHTML.trim() : '';
        const post = node.querySelector('.post__title_link');
        const link = post && post.hasAttribute('href') ? post.getAttribute('href') : ''
        const title = post && post.innerHTML ? this.formatText(post.innerHTML) : '';
        const text = node.querySelector('.post__text') && node.querySelector('.post__text').innerHTML ? this.formatText(node.querySelector('.post__text').innerHTML) : ''
        const rating = node.querySelector('.voting-wjt__counter') ? new Number(node.querySelector('.voting-wjt__counter').innerHTML) : 0;
        const views = node.querySelector('.post-stats__views-count').innerHTML || ''
        const comments = node.querySelector('.post-stats__comments-count') ? new Number(node.querySelector('.post-stats__comments-count').innerHTML) : 0;

        return {
            user: {
                name,
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

    private sequilizeEndpoint(pageNum: number): URL {
        const url = new URL(`https://habr.com/ru/search/page${pageNum}/?target_type=posts`);
        url.searchParams.set('order_by', this.options.orderBy);
        url.searchParams.set('q', this.options.searchTerm);
        return url;
    }

    private formatText(inner: string): string {
        return inner.replace(/(<([^>]+)>)/ig, "")
            .replace(/(?:\r\n|\r|\n)/ig, '').trim();
    }

    private searchPageCountFromSource(url: string): Number {
        const regex = /\/search\/page([0-9]*)\//;
        var exc = regex.exec(url)
        if (exc) {
            return exc[1] == '' ? 0 : new Number(exc[1]);
        }
        return 0;
    }
}