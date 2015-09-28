var express = require('express');
var app = express();
var mongoose = require("mongoose");
var Page = require("./../crawler/PageModel");

mongoose.connect("localhost/github");

function mapTerms(terms){
    return terms.map(function(term){
       return {
           term  : term.term
       }
    });
}

function mapAndSortDocument(docs){
    return docs.map(function(doc){
        return {
            name        : doc.project,
            path        : doc.path,
            state       : doc.arityOfsentences,
            references  : doc.references,
            terms       : mapTerms(doc.terms)
        }
    }).sort(function(a, b){
        return (b.state + b.references) - (a.state + a.references)
    });
}

app.get('/document/:name', function (req, res) {

    var queryParam = new RegExp('.*'+req.params.name+'.*', "i");

    var query = { $or: [
        { 'owner' : queryParam },
        { 'project' : queryParam },
        { 'terms' : {$elemMatch: { 'term' : queryParam }}}
    ]};

    Page.find(query).sort({ references : -1 }).limit(100).exec().then(function(docs){
        res.send(mapAndSortDocument(docs));
    }, function(err){
        res.send([]);
    });
});

var server = app.listen(3000, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});