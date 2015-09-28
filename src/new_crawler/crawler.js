var Crawler = require("simplecrawler");
var urlUtil = require('./url/urlUtil');
var PageRepository = require('./pages/pageRepository');
var calculateSentiment = require('./sentiment/sentiment');
var tdidf = require('./tfidf/tfidf');
var cheerio = require('cheerio');

crawler          		= Crawler.crawl("https://github.com/NaturalNode/natural");
crawler.interval 		= 800;
crawler.maxConcurrency  = 1;
crawler.maxDepth 		= 0;
crawler.filterByDomain  = true; // restrict to github
crawler.acceptCookies	= false;

crawler.addFetchCondition(function(parsedURL) {
    var path = parsedURL.path.toLocaleLowerCase();
    return !(path.match(/\.pdf$/i) ||
    path.match(/\.csv$/i) ||
    path.match(/\.png$/i) ||
    path.match(/\.jpg$/i) ||
    path.match(/\.atom$/i) ||
    path.match(/\.md$/i) ||
    path.match(/\.xml$/i));
});

var pageRepository = new PageRepository();

crawler.on("fetchcomplete", function(queueItem, responseBuffer, response){

    var parsedUrl = urlUtil.parse(queueItem.url);

    if(urlUtil.blacklisted(parsedUrl.owner)) return;

    pageRepository.addProject(parsedUrl.owner, parsedUrl.project);
    pageRepository.incrementReference(parsedUrl.owner, parsedUrl.project);

    var response = responseBuffer.toString('utf-8');
    var $ = cheerio.load(response);
    var bodyContent = $('body').text().toLowerCase().replace(/\s+/g, ' ');

    var sentimentIndex = calculateSentiment(bodyContent);

    pageRepository.setSentimentIndex(parsedUrl.owner, parsedUrl.project, sentimentIndex);

    var listOfFrequencies = tdidf(bodyContent);

    pageRepository.setFrequency(parsedUrl.owner, parsedUrl.project, listOfFrequencies);

    //pageRepository.print();
});

crawler.on("complete",function() {
    console.log("Finished!");
});