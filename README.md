<h3 align="center">node-scrap</h3>
<p align="center">Scrap paginated listings in no time</p>
<h1></h1>

&nbsp;
#### Instalation

Go to your project folder and run:

```sh
npm install --save node-scrap
```

&nbsp;
#### How does it work?

_node-scrap_ is actually really simple. You simply extend the `Scraper` class, implement 

1. Get the URL of the page to be extracted.
2. Extract the data from the DOM.
3. Process the extracted data.
4. Runs a post-processing or cleanup step.
5. Repeat.

It's that simple!

&nbsp;
#### Usage

The first thing we need to do is to import `node-scrap` and extend the `Scraper` class.

```typescript
import Scrapper from "node-scrap";

class HackerNewsScraper extends Scraper {
  // Initial state.
  state = { currentPage: 1 };

  /**
   * Formats the URL to be scraped using the current state.
   */
  getNextUrl() {
    return `https://news.ycombinator.com/news?p=${this.state.currentPage}`;
  }

  /**
   * Extracts the data from the page.
   *
   * @param $ - A cheerio instance (similar to JQuery) to access the DOM.
   * @returns the parsed data.
   */
  extract($) {
    // Extract the title of each article.
    return $('.titlelink').map(link => $(link).text());
  }

  /**
   * Processes the data returned by the extract() method.
   *  
   * @param data - the return value of the extract() method
   */
  process(data) {
    // Prevent it from running forever.
    if (data.length === 0) this.stop(); 

    // Print every article to the console.
    data.forEach(article => console.log(`- ${article}`));
  }

  
  /**
   * Executed after scraping a page.
   */
  afterEach() {
    // Move onto the next page.
    this.state.currentPage++;
  }
}
```

Now you have succesfully implemented a scraper that will scrap the data from all HackerNews pages. Let's run it.

```typescript
const scraper = new HackerNewsScraper();
scraper.run();
```

You should see articles printed to the console as they are scraped from HackerNews. Isn't that awesome? 

&nbsp;
#### Promises
_node-scrap_ also supports promises. So, if you need to do some asynchronous work, like waiting for a message to show up in the message queue, you can do that by making the extended functions `async`. It would looks something like this.

```typescript
async getNextUrl() {
  const {url} = await messageQueue.readMessage();
  return url;
}
```

&nbsp;
#### Building More Advanced Projects
In our example we simply extracted the title of the articles from HackerNews. However, a real world situation you're implementation would have much greater complexity. You may be wondering how you can scale things up. There's a lot of approaches but let me show you a simple one.

Let's say you want to parse real estate information from Zillow. In this case, you'll need to implement two scrapers: one for the listing, and another for the detail page. The listing scraper will simple traverse the listing pagination and it will extract links. Once you have the links, you can push them to a database or to a message queue using the `process()` method. The second scraper, the one for the detail page, will take one of those links from the database or message queue in `getNextUrl()`, scrap the data for the property (in the `extract()` method) and store it in a database (in the `process()` method).

These two scrapers could run one after the other, or they could be running in parallel, passing the data around in real-time. In fact, you could have many nodes running simultaneously to parallelize the work.



&nbsp;
#### Comments and Suggestions
This is a personal project I started to make my life easier when scraping data around the internet. It's not perfect, and for sure it could be improved. I would love to hear your ideas and suggestions for the project. Feel free to create an issue if there's something you think could be done differently.
