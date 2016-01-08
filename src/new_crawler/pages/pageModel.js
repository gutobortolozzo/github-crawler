const _ = require('underscore');

module.exports.newPage = (owner, project) => {
    return {
        owner       : owner,
        project     : project,
        visits      : 0,
        sentiment   : 0,
        frequencies : [],
        references  : [],
        referenced  : [],
        stars       : 0,
        forks       : 0,
        watchers    : 0
    }
};

module.exports.mergeSentiment = (currentSentiment, sentimentIndex, pageVisits) => {
    return (currentSentiment + sentimentIndex) / pageVisits;
};

module.exports.mergeFrequencies = (currentFrequencies, justExtractedFrequencies) => {

    var frequencies = currentFrequencies.concat(justExtractedFrequencies);

    var uniqueList = _.uniq(frequencies, function(item){
        return item.term;
    });

    return uniqueList.sort(function(a, b){
        return b.score - a.score;
    }).slice(0, 10);

};

module .exports.mergeReferenced = (owner, project, currentReferenced) => {
    currentReferenced.push({
        owner: owner,
        project: project
    });

    return _.uniq(currentReferenced, (referenced) => {
        return [referenced.owner, referenced.project].join();
    });
};

module .exports.mergeReferences = (owner, project, currentReferenced) => {
    const uniq =  this.mergeReferenced(owner, project, currentReferenced);

    return uniq.filter((element) => {
        return element.owner != owner && element.project != project
    });
};