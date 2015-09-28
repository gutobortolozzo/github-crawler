var natural = require('natural');
var tokenizer = new natural.WordTokenizer();
var stopWords = require("keyword-extractor");
var TfIdf = natural.TfIdf;
var urlUtil = require('../url/urlUtil');

function tfidf(bodyContent) {
    var tokenized = tokenizer.tokenize(bodyContent).join(' ');

    var tokens = stopWords.extract(tokenized);

    var tfidf = new TfIdf();

    tfidf.addDocument(tokens);

    return tfidf.listTerms(0).slice(0, 100).filter(function (item) {
        return item.term.length > 2 && !urlUtil.blacklisted(item.term);
    }).slice(0, 30).map(function (item) {
        return {
            term: item.term,
            score: (item.tfidf).toFixed(3)
        }
    });
}

module.exports = tfidf;