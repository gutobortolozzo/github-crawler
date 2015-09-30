var urlProcessor = require('url');

function parse(url){

    var parsed = urlProcessor.parse(url);

    return {
        owner    : owner(parsed.pathname),
        project  : project(parsed.pathname),
        pathname : parsed.pathname
    }
}

function owner(path){
    return path.split("/")[1];
}

function project(path){
    return path.split("/")[2];
}

function fetchCondition(parsedURL) {
    var path = parsedURL.path.toLocaleLowerCase();

    var containsIssues = path.indexOf('issues') >= 0;
    var containsPulls = path.indexOf('pulls') >= 0;

    if(containsIssues || containsPulls) return true;

    var formerPath = '/'+owner(path)+'/'+project(path);

    return path == formerPath;
}

var blackListOwner = new Map();
blackListOwner.set('showcases');
blackListOwner.set('blog');
blackListOwner.set('assets');
blackListOwner.set('articles');
blackListOwner.set('explore');
blackListOwner.set('search');
blackListOwner.set('followers');
blackListOwner.set('following');
blackListOwner.set('follow');
blackListOwner.set('join');
blackListOwner.set('joined');
blackListOwner.set('login');
blackListOwner.set('sign');
blackListOwner.set('features');
blackListOwner.set('pricing');
blackListOwner.set('about');
blackListOwner.set('site');
blackListOwner.set('terms');
blackListOwner.set('privacy');
blackListOwner.set('contact');
blackListOwner.set('integrations');
blackListOwner.set();

function blacklisted(projectOwner){
    return !projectOwner || blackListOwner.has(projectOwner);
}

module.exports.parse = parse;
module.exports.blacklisted = blacklisted;
module.exports.fetchCondition = fetchCondition;