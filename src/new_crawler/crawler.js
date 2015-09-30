var Crawler = require("simplecrawler");
var urlUtil = require('./url/urlUtil');
var PageRepository = require('./pages/pageRepository');
var calculateSentiment = require('./sentiment/sentiment');
var tdidf = require('./tfidf/tfidf');
var cheerio = require('cheerio');
var rank = require('./rank/rank');

crawler          		= Crawler.crawl("https://github.com/NaturalNode/natural");
crawler.maxDepth 		= 0;
crawler.filterByDomain  = true; // restrict to github
crawler.acceptCookies	= false;

crawler.addFetchCondition(urlUtil.fetchCondition);

var pageRepository = new PageRepository();

crawler.on("fetchcomplete", function(queueItem, responseBuffer, response){

    var parsedUrl = urlUtil.parse(queueItem.url);

    if(urlUtil.blacklisted(parsedUrl.owner)) return;

    pageRepository.addProject(parsedUrl.owner, parsedUrl.project);
    pageRepository.incrementVisits(parsedUrl.owner, parsedUrl.project);

    var response = responseBuffer.toString('utf-8');

    var $ = cheerio.load(response);
    var bodyContentAsHtml = $('body').html();
    var bodyContentAsText = $('body').text().toLowerCase().replace(/\s+/g, ' ');

    var sentimentIndex = calculateSentiment(bodyContentAsText);

    pageRepository.setSentimentIndex(parsedUrl.owner, parsedUrl.project, sentimentIndex);

    var listOfFrequencies = tdidf(bodyContentAsText);

    pageRepository.setFrequency(parsedUrl.owner, parsedUrl.project, listOfFrequencies);

    var rankedReferences = rank.calculateRank(bodyContentAsHtml, parsedUrl.owner, parsedUrl.project);

    pageRepository.setRankedReferences(parsedUrl.owner, parsedUrl.project, rankedReferences);

    //pageRepository.print();
    //
    //console.log('##########', 'enqueued', crawler.queue.length, '##########');
    //console.log('##########', 'url', parsedUrl.pathname, '##########');
});

crawler.on("complete",function() {
    console.log("Finished!");
});