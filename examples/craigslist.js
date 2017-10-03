const Itscrap = require('../src/Itscrap');


class CraigslistScraper extends Itscrap {

    /**
     * Initial parameters.
     */
    getInitialParams() {
        return { offset: 0 };
    }

    /**
     * Fetch the next URL to be scraped.
     */
    getNextUrl() {
        // Here we just "hard-code" the URL but this could be reading the URL
        // from a queue.
        return `https://newyork.craigslist.org/search/aap?s=${this.params.offset}`;
    }

    /**
     * Scrap the current page.
     *
     * @param {Cheerio} $       Cheerio instance loaded with the page HTML.
     * @param {string}  url     The URL being scraped.
     */
    scrap($, url) {
        const flatsList = $('.result-row');
        const flatsData = [];

        // If this page is empty (the previous page was the last page),
        // stop here.
        if (flatsList.length === 0) {
            this.stop();
        }

        flatsList.each(function() {
            const item = $(this);
            const title = item.find('.result-title');

            flatsData.push({
                url: title.attr('href'),
                title: title.text(),
                price: item.find('.result-price').text(),
                housing: item.find('housing').text()
            });
        });

        return flatsData;
    }

    /**
     * Process the scraped data.
     *
     * @param {any} data    The return value of the #scrap() method.
     */
    process(data) {
        // Here we are just showing the information on the screen,
        // but this could be storing the data in a database or
        // pushing the detail page URL to a queue to be processed
        // by another scraper.
        data.forEach(d => console.log(`${d.price} - ${d.title}`));
    }

    /**
     * Function to be executed after a page was scraped.
     */
    afterEach() {
        // Increase the listing offset. This is needed by the getNextUrl()
        // method. Note that craiglist uses a pagination size of 120.
        this.params.offset += 120;
    }
}


const scraper = new RedditScraper();
scraper.run();
