#Itscrap

**Itscrap** is a nodejs library whose aim is to help you scrap web listings very easily.



## Instalation

Go to your project folder and run:

```sh
npm install --save itscrap
```

## Introduction

*Itscrap* is designed to sequentially scrap lists of web pages. It does it with a scraping loop. And this loop looks like this:

1. Get the next page to be scraped.
2. Scrap it (extracts the data)
3. Process the extracted data.
4. Execute an optional post-processing function.
5. If the user didn't stop the scraper, go back to (1).


## Usage

Let's scrap a listing of flats from Craigslist. The first thing we need to do is to create our scraper class and make it inherit from Itscrap.

```js
const Itscrap = require('itscrap');

class CraigslistScraper extends Itscrap { }
```

Before instantiating and running this scraper we need to define some logic into it.

When we run our scraper, the first thing it will do is to call the `getNextUrl()` method. So, let's define it.

```js
class CraigslistScraper extends Itscrap { 
	getNextUrl() {
		return `https://newyork.craigslist.org/search/aap?s=${this.params.offset}`;
	}
}
```

In this method we must return the URL of the site to be scraped next. This is just the flats listing page URL from Craigslist but you can see that we are using an "offset" value from the `this.params` object. 

*Itscrap* allows you to set an initial value for these params using the `getInitialParams()` method. So, let's initialize our listing offset with a value of 0.

```js
class CraigslistScraper extends Itscrap { 
	getInitialParams() {
		return { offset: 0 };
	}

	getNextUrl() { ... }
}
```


After fetching the page returned by `getNextUrl()`, *Itscrap* will convert the site to a [cheerio](https://github.com/cheeriojs/cheerio) instance to facilitate DOM manipulation. Next, it will call `scrap()` method with the cheerio instance and the url of the site being scraped.

```js
class CraigslistScraper extends Itscrap { 
	getInitialParams() { ... }
	getNextUrl() { ... }
	
	scrap($, url) {
		console.log('Scraping', url);
	
		// Get all the items in the list.
		const listItems = $('.result-row');
		const flatsData = [];
		
		// If the list is empty, stop the scraper.
		if (listItems.length === 0) this.stop();
		
		listItems.each(function() {
			// Wrap the current element in a cheerio instance.
			const el = $(this);	
			const title = 
	
			flatsData.push({
				title: el.find('.result.title').text(),
				price: el.find('.result.price').text()
			});
		});
		
		return flatsData;
	}
}
```

Now we have a scrap method that extracts the title and the price information from each item in the listing. Also, once it has ran out of results (i.e. it got to the end of the listing) it calls `this.stop()` to stop the scraper.

However, altough this scraper extracts the data from Craigslist, it does nothing with it. Now we need to implement the `process(data)` method, which takes the return value of `scrap()` as a first argument.

```js
class CraigslistScraper extends Itscrap { 
	getInitialParams() { ... }
	getNextUrl() { ... }
	scrap($, url) { ... }
	
	process(data) {
		data.forEach(flat => console.log(`${flat.price} - ${flat.title}`));
	}
```

Here we told the scraper to print the extracted data to the console after it has finished scraping the current page. This may not seem really useful, but you could be storing it in a database, or extracting the URL of the flat detail page and pushing it into a queue to be scraped by another scraper.

Lastly, before running the scraper we need to update the `this.params.offset` value, otherwise it will scrap the same page indefinitely. We can do that in the `afterEach()` method. This method will be executed after the `process()` method for each scraped web page.

```js
class CraigslistScraper extends Itscrap { 
	getInitialParams() { ... }
	getNextUrl() { ... }
	scrap($, url) { ... }
	process(data) { ... }
	
	afterEach() {
		// Note: Craigslist pagination size is 120.
		this.params.offset += 120;
	}
```

And that's it. All you have to do now is to instantiate the scraper and run it.

```js
const scraper = new CraigslistScraper();
scraper.run();
```

### Debugging

If, for some reason, you need to see what's going on at a deeper level, you can increase the logging level with `setLogLevel()`. Currently there are three levels (0, 1 and 2) with 0 being no logging and 2 being the most verbose.

```js
const scraper = new CraigslistScraper();
scraper.setLogLevel(2);
scraper.run();
```
