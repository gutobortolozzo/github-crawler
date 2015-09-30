var cheerio = require('cheerio');
var urlUtil = require('../url/urlUtil');
var _ = require('underscore');

function calculateRank(bodyContent, currentOwner, currentProject){
    var $ = cheerio.load(bodyContent);

    var references = $("a").toArray().filter(function(link){
        return !!link.attribs.href;
    }).filter(function(link){
        return !!link.attribs.href.match(/^http/i);
    }).filter(function(link){
        return link.attribs.href.indexOf("github") >= 0;
    }).filter(function(link){
        var parsed = urlUtil.parse(link.attribs.href);

        if(!parsed.owner || !parsed.project) return false;

        if(currentOwner == parsed.owner && currentProject == parsed.project)
            return false;

        return !urlUtil.blacklisted(parsed.owner) && !urlUtil.blacklisted(parsed.project);
    }).map(function(link){
        var parsed = urlUtil.parse(link.attribs.href);
        return "/"+parsed.owner+"/"+parsed.project;
    });

    return _.uniq(references);
}

module.exports.calculateRank = calculateRank;