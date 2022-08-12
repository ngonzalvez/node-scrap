# node-scrap

**node-scrap** is a scraping framework that makes it really easy to scrap paginated listings. It provides a base `Scraper` class that takes care of the inner workings of scraping and lets you focus on what really matter: extracting and processing the data you need.

## Instalation

Go to your project folder and run:

```sh
npm install --save node-scrap
```

## Introduction

_node-scrap_ is actually really simple. It simply loops through the following steps:

1. Get the URL of the page to be extracted.
2. Extract the data from the DOM.
3. Process the extracted data.
4. Runs a post-processing or cleanup step.
5. Repeat.

It's that simple!

## Usage

#### Extend the `Scraper` class

The first thing we need to do is to import _node-scrap_ and extend the `Scraper` class.

```typescript
import Scrapper from "node-scrap";

class HackerNewsScraper extends Scraper {
  // Let's define the initial state of the pagination.
  state = { currentPage: 1 };
}
```

#### Formatting The URL
Now, let's format the URL of the first page we'll scrap. In order to do that, extend the `getNextUrl()` method and use the data in `this.state` to create the URL.

```typescript
class HackerNewsScraper extends Scraper {
  // ...
  getNextUrl() {
  	return `https://news.ycombinator.com/news?p=${this.state.currentPage}`;
  }
}
```


#### Extracting Data From The DOM
The next step is to extend the `extract($)` method and scrap some data from the page. This method takes a Cheerio instance, which is really similar to JQuery. Use it to extract the data you need. Once you are done extracting the data, `return` it to be processed in the next step.

```typescript
class HackerNewsScraper extends Scraper {
  // ...
  extract($) {
    // Extract the title of each article.
    return $('.titlelink').map(link => $(link).text());
  }
}
```

In this example we are simply extracting the title of the article, but we could be extracting the URL for each article for further processing. 

#### Processing The Extracted Data
Now that we extracted some data, we need to process it. To keep it simple, we'll print it on the screen, but you could be storing this data in a database, doing sentiment analysis, using it to train a neural network, or anything else.

In order to do that, we'll extend the `process(data)` method that takes the value returned by the `extract()` method.

```typescript
class HackerNewsScraper extends Scraper {
  // ...
  process(articles) {
    articles.forEach(title => console.log(`- ${title}`));
  }
}
```

#### Moving On
Now that we've successfully scrapped the first page of HackerNews, we need to move on to the next page. Let's extend the `afterEach()` method to do that.

```typescript
class HackerNewsScraper extends Scraper {
  // ...
  afterEach() {
    this.state.currentPage++;
  }
}
```

That's it. If you created temporary files while processing the data, you can also use this method to clean up.

#### That's It!
Now you have succesfully implemented a scraper that will scrap the data from all HackerNews pages. Let's run it.

```typescript
const scraper = new HackerNewsScraper();
scraper.run();
```

If you execute this code, you should see articles being printed to the console as they are scraped from HackerNews. Isn't that awesome? But wait... I think we may have a problem... It runs forever! 

Don't worry, there's a way to stop it, I swear! Actually it's as simple as calling the `stop()` method. You may want to update your `process()` implementation to stop if we've got an empty page with no articles. It would look something like this:

```typescript
process(articles) {
  if (articles.length === 0) this.stop();
  
  // ...
}
```

Now everything should be fine. 

## Building More Advanced Projects
In our example we simply extracted the title of the articles from HackerNews. However, a real world situation you're implementation would have much greater complexity. You may be wondering how you can scale things up. There's a lot of approaches but let me show you a simple one.

Let's say you want to parse real estate information from Zillow. In this case, you'll need to implement two scrapers: one for the listing, and another for the detail page. The listing scraper will simple traverse the listing pagination and it will extract links. Once you have the links, you can push them to a database or to a message queue using the `process()` method. The second scraper, the one for the detail page, will take one of those links from the database or message queue in `getNextUrl()`, scrap the data for the property (in the `extract()` method) and store it in a database (in the `process()` method).

These two scrapers could run one after the other, or they could be running in parallel, passing the data around in real-time. In fact, you could have many nodes running simultaneously to parallelize the work.

#### Promises
_node-scrap_ also supports promises. So, if you need to do some asynchronous work, like waiting for a message to show up in the message queue, you can do that by making the extended functions `async`. It would looks something like this.

```typescript
async getNextUrl() {
  const {url} = await messageQueue.readMessage();
  return url;
}
```

## Comments and Suggestions
This is a personal project I started to make my life easier when scraping data around the internet. It's not perfect, and for sure it could be improved. I would love to hear your ideas and suggestions for the project. Feel free to create an issue if there's something you think could be done differently.