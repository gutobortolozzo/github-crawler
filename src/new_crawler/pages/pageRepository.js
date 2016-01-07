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
                    references  : [],
                    referenced  : [],
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
            return updateProject(projectKey, {
                visits : data.hits.hits[0]._source.visits + 1
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

            return updateProject(projectKey, {
                sentiment : sentiment
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

            return updateProject(projectKey, {
                frequencies : sortedFrequencies
            });
        });
    };

    this.setSocial = function(owner, project, social){
        if(isInvalid(owner, project))
            return Promise.resolve();

        var projectKey = generateKey(owner, project);

        return getById(projectKey)
        .then((data) => {
            return updateProject(projectKey, {
                stars    : social.stars,
                forks    : social.forks,
                watchers : social.watchers
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
                    const currentReferenced = data.hits.hits[0]._source.referenced;
                    currentReferenced.push({
                        owner   : owner,
                        project : project
                    });

                    return updateProject(projectKey, {
                        referenced : currentReferenced
                    });
                });
            });
            return Promise.all(promiseRanked);
        })
        .then(() => {
            return getById(projectKey)
        })
        .then((data) => {
            const currentReferences = data.hits.hits[0]._source.references;
            const currentReferencesUpdated = currentReferences.concat(rankedReferences);

            return updateProject(projectKey, {
                references : currentReferencesUpdated
            });
        })
    };

    this.print = function(){
        process.stdout.write('\u001B[2J\u001B[0;0f');
        console.log('##########', 'visited', visited, '##########');
    };

    const generateKey = function(owner, project){
        return (owner+':'+project).toLowerCase();
    };

    const isInvalid = function(owner, project){
        return !owner || !project;
    };

    const updateProject = function(projectKey, partialDoc) {
        return elastic.update({
            consistency : 'one',
            refresh : true,
            retryOnConflict: 5,
            index: 'github',
            type: 'pages',
            id: projectKey,
            body : {
                doc : partialDoc
            }
        });
    };

    const getById = function(projectKey) {
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