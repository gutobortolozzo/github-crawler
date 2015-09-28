var Queue = require("./../../node_modules/simplecrawler-queue-mongo/build/MongoQueue.js");
var url = require('url');
var natural = require('natural');
var TfIdf = natural.TfIdf;
var cheerio = require('cheerio');
var Crawler = require("simplecrawler");
var tokenizer = new natural.WordTokenizer();
var stopWords = require("keyword-extractor");
var Retext = require('retext');
var visit = require('retext-visit');
var sentiment = require('retext-sentiment');
var mongoose = require("mongoose");
var retext = new Retext().use(sentiment).use(visit);
var request = require('request');
var Page = require("./PageModel");

console.log = function(){}

mongoose.connect("localhost/github");

crawler          		= Crawler.crawl("https://github.com/NaturalNode/natural");
crawler.name  	 		= 'generic-queue';
crawler.interval 		= 800; 
crawler.maxConcurrency  = 1;
crawler.queue 			= new Queue(mongoose.connections[0], crawler);
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

function owner(path){
    return path.split("/")[1];
}

function project(path){
    return path.split("/")[2];
}

function calculateArity(bodyContent){

    var polarities = [];

    retext.parse(bodyContent, function(err, tree) {
        tree.visit(tree.SENTENCE_NODE, function(node) {
            polarities.push(node.data.polarity)
        });
    });

    if(polarities.length == 0) return 0;

    var elementsToDiscount = parseInt((polarities.length * 20) / 100);

    var aritySentences = polarities.sort(function(a, b){
        return a - b;
    }).slice(elementsToDiscount, polarities.length - elementsToDiscount).reduce(function(current, value, index){
        return (current + value) / index;
    });

    return parseInt(aritySentences);
}

function listQualifiedTfidf(bodyContent) {
    var tokenized = tokenizer.tokenize(bodyContent).join(' ');

    var tokens = stopWords.extract(tokenized);

    var tfidf = new TfIdf();

    tfidf.addDocument(tokens);

    return tfidf.listTerms(0).slice(0, 100).filter(function (item) {
        return item.term.length > 3;
    }).slice(0, 10).map(function (item) {
        return {
            term: item.term,
            score: (item.tfidf).toFixed(3)
        }
    });
}

function buildPageInformation(content, queueItem, path) {

    var $ = cheerio.load(content);

    var bodyContent = $('body').text().toLowerCase().replace(/\s+/g, ' ');

    var pageInformation = {};

    pageInformation['arityOfsentences'] = calculateArity(bodyContent);
    pageInformation['host'] = queueItem.host;
    pageInformation['path'] = path;
    pageInformation['owner'] = owner(path);
    pageInformation['project'] = project(path);
    pageInformation['references'] = 0;
    pageInformation['terms'] = listQualifiedTfidf(bodyContent);

    return pageInformation;
}

function saveIfAbsent(pathname, pageInformation) {
    Page.where({owner: owner(pathname), project: project(pathname)}).count(function (err, count) {
        if (count > 0) return;
        console.error('new project owned by', owner(pathname), "with name", project(pathname));
        new Page(pageInformation).save(function (err) {
        });
    });
}
function mineAndSaveRootInformation(queueItem, pathname){

    var path = "/" + owner(pathname) + "/" + project(pathname);
    var uri = queueItem.protocol + "://" + queueItem.host + path;

    request({url : uri}, function(error, response, body){
        var pageInformation = buildPageInformation(body, queueItem, path);
        saveIfAbsent(pathname, pageInformation);
    });
}

crawler.on("fetchcomplete", function(queueItem, responseBuffer, response){

    var pathname = url.parse(queueItem.url).pathname;

    if(pathname.split('/').length <= 2) return;

    var content = responseBuffer.toString('utf-8');

    if(blackListOwner.indexOf(owner(pathname)) >= 0 || blackListOwner.indexOf(project(pathname)) >= 0) return;

    Page.findOne({owner : owner(pathname), project: project(pathname)}, function(err, page){
        if(!page){
            mineAndSaveRootInformation(queueItem, pathname);
        } else{
            console.log('updating', page.path);
            page.references = page.references + 1;
            page.save(function(err){});
        }
    });
});

crawler.on("complete",function() {
    console.log("Finished!");
});

var blackListOwner = ['showcases', 'blog', 'explore', 'search', 'followers', 'following'];