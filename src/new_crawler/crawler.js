var Crawler = require("simplecrawler");
var urlUtil = require('./url/urlUtil');

crawler          		= Crawler.crawl("https://github.com/NaturalNode/natural");
crawler.interval 		= 600;
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

crawler.on("fetchcomplete", function(queueItem, responseBuffer, response){

    var parsedUrl = urlUtil.parse(queueItem.url);

    if(urlUtil.blacklisted(parsedUrl.owner)){
        console.log('owner of project was blacklisted:', parsedUrl.owner);
        return;
    }

    console.log(parsedUrl);

});

crawler.on("complete",function() {
    console.log("Finished!");
});