const http = require('http.min');
const cheerio = require('cheerio');

const Logger = require('./Logger');


class Itscrap {
    constructor() {
        this.halt = false;
        this.params = this.getInitialParams();
        this.firstTime = true;
    }

    setLogLevel(lvl) {
        Logger.level = lvl;
    }

    getInitialParams() {
        return {};
    }

    getNextUrl() {
        return '';
    }

    async fetchDocument(url) {
        const response = await http(url);
        Logger.log(response.data, 2);
        return cheerio.load(response.data);
    }

    scrap($) {
        return {};
    }

    process(data) {}
    afterEach() {}

    stop() {
        Logger.log('Stopping scrapper');
        this.halt = true;
    }

    async step() {
        let url = this.getNextUrl();
        let doc;
        let data;

        Logger.log(`Fetching ${url}`);
        doc = await this.fetchDocument(url);

        Logger.log('Scraping document');
        data = this.scrap(doc, url);

        Logger.log('Processing data')
        Logger.log(data, 2);
        this.process(data);

        this.afterEach();
        this.firstTime = false;

        if (!this.halt) {
            this.step();
        }
    }

    run() {
        this.halt = false;
        this.step()
            .catch(err => console.log(err));
    }
}


module.exports = Itscrap;
module.exports.Logger = Logger;
