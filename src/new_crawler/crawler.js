const Crawler = require("simplecrawler");
const urlUtil = require('./url/urlUtil');
const PageRepository = require('./pages/pageRepository');
const calculateSentiment = require('./sentiment/sentiment');
const tfidf = require('./tfidf/tfidf');
const cheerio = require('cheerio');
const rank = require('./rank/rank');
const stargazers = require('./stargazer/stargazer');

crawler          		= Crawler.crawl("https://github.com/NaturalNode/natural");
crawler.maxDepth 		= 0;
crawler.filterByDomain  = true; // restrict to github
crawler.acceptCookies	= false;

crawler.addFetchCondition(urlUtil.fetchCondition);

var pageRepository = new PageRepository();

crawler.on("fetchcomplete", function(queueItem, responseBuffer, response){

    var parsedUrl = urlUtil.parse(queueItem.url);

    if(urlUtil.blacklisted(parsedUrl.owner)) return;

    var finishEvent = this.wait();

    var response = responseBuffer.toString('utf-8');
    var $ = cheerio.load(response);

    pageRepository.addProject(parsedUrl.owner, parsedUrl.project)
    .then(() => {
        return pageRepository.incrementVisits(parsedUrl.owner, parsedUrl.project);
    })
    .then(() => {
        var bodyContentAsText = $('body').text().toLowerCase().replace(/\s+/g, ' ');

        var sentimentIndex = calculateSentiment(bodyContentAsText);

        return pageRepository.setSentimentIndex(parsedUrl.owner, parsedUrl.project, sentimentIndex);
    })
    .then(() => {
        var bodyContentAsText = $('body').text().toLowerCase().replace(/\s+/g, ' ');
        var listOfFrequencies = tfidf(bodyContentAsText);

        return pageRepository.setFrequency(parsedUrl.owner, parsedUrl.project, listOfFrequencies);
    })
    .then(() => {
        var bodyContentAsHtml = $('body').html();
        var rankedReferences = rank.calculateRank(bodyContentAsHtml, parsedUrl.owner, parsedUrl.project);

        return pageRepository.setRankedReferences(parsedUrl.owner, parsedUrl.project, rankedReferences);
    })
    .then(() => {
         var social = stargazers.social($);
         return pageRepository.setSocial(parsedUrl.owner, parsedUrl.project, social);
    })
    .then(() => {
        pageRepository.print();
        console.log('##########', 'enqueued', crawler.queue.length, '##########');
        console.log('##########', 'url', parsedUrl.pathname, '##########');
        finishEvent();
    })
    .catch((error) => {
        console.log(error);
        finishEvent();
    })
});

crawler.on("complete",function() {
    console.log("Finished!");
});