const _ = require('underscore');
const elasticsearch = require('elasticsearch');

"use strict"
function PageRepository(){
    
    const projects = new Map();
    var visited = 0;

    var elastic = new elasticsearch.Client({
        host        : 'localhost:9200',
        apiVersion  : '2.1'
    });

    this.addProject = function(owner, project){
        visited++;

        if(isInvalid(owner, project))
            return Promise.resolve();

        var projectKey = generateKey(owner, project);

        return getById(projectKey)
        .then((data) => {

            if(data.hits && data.hits.total > 0)
                return Promise.resolve();

            return elastic.create({
                consistency : 'one',
                refresh : true,
                index: 'github',
                type: 'pages',
                id: projectKey,
                body : {
                    owner       : owner,
                    name        : project,
                    visits      : 0,
                    sentiment   : 0,
                    frequencies : [],
                    references  : 0,
                    referenced  : 0,
                    stars       : 0,
                    forks       : 0,
                    watchers    : 0
                }
            });
        });
    };

    this.incrementVisits = function(owner, project){
        if(isInvalid(owner, project))
            return Promise.resolve();

        var projectKey = generateKey(owner, project);

        return getById(projectKey)
        .then((data) => {
            return elastic.update({
                consistency : 'one',
                refresh : true,
                retryOnConflict: 3,
                index: 'github',
                type: 'pages',
                id: projectKey,
                body : {
                    doc : {
                        visits : data.hits.hits[0]._source.visits + 1
                    }
                }
            });
        });
    };

    this.setSentimentIndex = function(owner, project, sentimentIndex){
        if(isInvalid(owner, project))
            return Promise.resolve();

        var projectKey = generateKey(owner, project);

        return getById(projectKey)
        .then((data) => {
            var sentiment = (data.hits.hits[0]._source.sentiment + sentimentIndex) / data.hits.hits[0]._source.visits;

            return elastic.update({
                consistency : 'one',
                refresh : true,
                retryOnConflict: 3,
                index: 'github',
                type: 'pages',
                id: projectKey,
                body : {
                    doc : {
                        sentiment : sentiment
                    }
                }
            });
        });
    };

    this.setFrequency = function(owner, project, listOfFrequencies){
        if(isInvalid(owner, project))
            return Promise.resolve();

        var projectKey = generateKey(owner, project);

        return getById(projectKey)
        .then((data) => {
            var frequencies = data.hits.hits[0]._source.frequencies.concat(listOfFrequencies);

            var uniqueList = _.uniq(frequencies, function(item){
                return item.term;
            });

            const sortedFrequencies = uniqueList.sort(function(a, b){
                return b.score - a.score;
            }).slice(0, 10);

            return elastic.update({
                consistency : 'one',
                refresh : true,
                retryOnConflict: 3,
                index: 'github',
                type: 'pages',
                id: projectKey,
                body : {
                    doc : {
                        frequencies : sortedFrequencies
                    }
                }
            });
        });
    };

    this.setSocial = function(owner, project, social){
        if(isInvalid(owner, project))
            return Promise.resolve();

        var projectKey = generateKey(owner, project);

        return getById(projectKey)
        .then((data) => {
            return elastic.update({
                consistency : 'one',
                refresh : true,
                retryOnConflict: 3,
                index: 'github',
                type: 'pages',
                id: projectKey,
                body : {
                    doc : {
                        stars    : social.stars,
                        forks    : social.forks,
                        watchers : social.watchers
                    }
                }
            });
        });
    };

    this.setRankedReferences = function(owner, project, rankedReferences){
        var self = this;

        if(isInvalid(owner, project))
            return Promise.resolve();

        var projectKey = generateKey(owner, project);

        return getById(projectKey)
        .then((data) => {
            const promiseRanked = rankedReferences.map(function(ranked){
                return self.addProject(ranked.owner, ranked.project)
                .then(() => {
                    var localProjectKey = generateKey(ranked.owner, ranked.project);
                    return getById(localProjectKey);
                })
                .then((data) => {
                    return elastic.update({
                        consistency : 'one',
                        refresh : true,
                        retryOnConflict: 3,
                        index: 'github',
                        type: 'pages',
                        id: projectKey,
                        body : {
                            doc : {
                                referenced : data.hits.hits[0]._source.referenced + 1
                            }
                        }
                    });
                });
            });
            return Promise.all(promiseRanked);
        })
        .then(() => {
            return getById(projectKey)
        })
        .then((data) => {
            const references = data.hits.hits[0]._source.references + rankedReferences.length;
            return elastic.update({
                consistency : 'one',
                refresh : true,
                retryOnConflict: 3,
                index: 'github',
                type: 'pages',
                id: projectKey,
                body : {
                    doc : {
                        references : references
                    }
                }
            });
        })
    };

    this.print = function(){
        process.stdout.write('\u001B[2J\u001B[0;0f');
        console.log('##########', 'visited', visited, '##########');
    };

    var generateKey = function(owner, project){
        return (owner+':'+project).toLowerCase();
    };

    var isInvalid = function(owner, project){
        return !owner || !project;
    };

    var getById = function(projectKey) {
        return elastic.search({
            index: 'github',
            type: 'pages',
            ignore: [404],
            body : {
                query : {
                    term : {
                        _id : projectKey
                    }
                }
            }
        });
    };
}

module.exports = PageRepository;