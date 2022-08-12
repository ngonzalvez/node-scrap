import axios from "axios";
import cheerio from "cheerio";

/**
 * Base scraper class.
 *
 * node-scrap provides a base Scraper class that you will need to extend in order to build your own scraper. This class
 * takes care of the "low level" details of scraping and it lets you focus on the important stuff: scraping the data
 * you need.
 *
 * The way this works is really simple. The scraping loop consists of the following steps:
 *
 * 1. Fetch the URL be scraped using `getNextUrl()`.
 * 2. node-scrap downloads the HTML document and parses the DOM using `cheerio`.
 * 3. The `scrap($)` method takes the DOM instance and extracts the desired data.
 * 4. The `process(data)` method takes the data returned by the `scrap()` method and process it.
 * 5. The `afterEach()` method is called.
 *
 * This cycle repeats until you call the `stop()` method.
 */
class Scraper {
  isStopped: boolean = false;
  state: Record<string, any> = {};

  /**
   * Generates the next URL to be scraped.
   *
   * Use this method to encapsulate all the pagination logic or whatever processing you need to do in order to generate
   * the next URL to be scraped.
   *
   * @returns the URL of the next page to be scrapped.
   */
  getNextUrl(): string | Promise<string> {
    throw new Error("Your scraper class must implement getNextUrl()");
  }

  /**
   * Scraps the page and extracts the data.
   *
   * This is where the actual data scraping takes place. Use the cheerio
   * instance to find DOM elements and extract the desired data from them. Once
   * you are done, return the scraped data.
   *
   * @param $ - cheerio instance at the root of the page.
   * @returns the scraped data.
   */
  extract($: cheerio.Root): any | Promise<any> {
    throw new Error("Your scraper class must implement the scrap() method");
  }

  /**
   * Processed the scraped data.
   *
   * If you need to preprocess the scraped, store it in a database, or do
   * anything to it, this is where you do it. This method takes the return value
   * from the `extract()` method.
   *
   * @param data - the scraped data.
   */
  process(data: any): void | Promise<void> {
    console.log("Scraped data:", data);
  }

  /**
   * This method runs after `process()` in the scraping loop.
   *
   * If you need to update the `currentPage` number in the `state` property, this is where you do need to do it.
   */
  afterEach(): Promise<void> | void {}

  /**
   * Stops the scraping loop.
   *
   * If you got to the last page and you're done scraping the website, call this method to stop.
   */
  stop(): void {
    this.isStopped = true;
  }

  /**
   * This method implements the logic for a `tick` in the scraping loop.
   */
  async step(): Promise<void> {
    const url: string = await this.getNextUrl();
    const response = await axios.get(url);
    const root = cheerio.load(response.data);
    const data = await this.extract(root);
    await this.process(data);
    await this.afterEach();

    if (!this.isStopped) {
      this.step();
    }
  }

  /**
   * Starts the scraping loop.
   */
  async run(): Promise<void> {
    this.isStopped = false;
    await this.step();
  }
}

export default Scraper;
