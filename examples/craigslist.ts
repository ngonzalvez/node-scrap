import Scraper from "../src/node-scrap";
import cheerio from "cheerio";

class CraigslistScraper extends Scraper {
  state = { offset: 0 };

  async getNextUrl() {
    return `https://newyork.craigslist.org/search/aap?s=${this.state.offset}`;
  }

  async extract($: cheerio.Root) {
    const flatsList = $(".result-row");
    const flatsData = [];

    // If this page is empty (the previous page was the last page),
    // stop here.
    if (flatsList.length === 0) {
      this.stop();
    }

    flatsList.each(function () {
      const item = $(this);
      const title = item.find(".result-title");

      flatsData.push({
        url: title.attr("href"),
        title: title.text(),
        price: item.find(".result-price").text(),
        housing: item.find("housing").text(),
      });
    });

    return flatsData;
  }

  async process(data: Record<string, any>[]) {
    // Here we are just showing the information on the screen,
    // but this could be storing the data in a database or
    // pushing the detail page URL to a queue to be processed
    // by another scraper.
    data.forEach((flat) => console.log(`${flat.price} - ${flat.title}`));
  }

  async afterEach() {
    // Increase the listing offset. This is needed by the getNextUrl()
    // method. Note that craiglist uses a pagination size of 120.
    this.state.offset += 120;
  }
}

const scraper = new CraigslistScraper();
scraper.run();
