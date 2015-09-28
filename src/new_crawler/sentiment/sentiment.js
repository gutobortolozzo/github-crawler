var sentiment = require('retext-sentiment');
var visit = require('retext-visit');
var Retext = require('retext');
var retext = new Retext().use(sentiment).use(visit);

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

module.exports = calculateArity;