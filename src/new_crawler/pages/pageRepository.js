const _ = require('underscore');
const elasticsearch = require('elasticsearch');
const pageModel = require(process.cwd()+'/src/new_crawler/pages/pageModel');

"use strict"
function PageRepository(){
    
    var visited = 0;

    const elastic = new elasticsearch.Client({
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
                body : pageModel.newPage(owner, project)
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
            var source = data.hits.hits[0]._source;
            const sentiment = pageModel.mergeSentiment(source.sentiment, sentimentIndex, source.visits);

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
            const frequencies = data.hits.hits[0]._source.frequencies;

            const sortedFrequencies = pageModel.mergeFrequencies(frequencies, listOfFrequencies)

            return updateProject(projectKey, {
                frequencies : sortedFrequencies
            });
        });
    };

    this.setSocial = function(owner, project, social){
        if(isInvalid(owner, project))
            return Promise.resolve();

        var projectKey = generateKey(owner, project);

        return updateProject(projectKey, {
            stars    : social.stars,
            forks    : social.forks,
            watchers : social.watchers
        });
    };

    this.setRankedReferences = function(owner, project, rankedReferences){
        var self = this;

        if(isInvalid(owner, project))
            return Promise.resolve();

        var projectKey = generateKey(owner, project);

        const promiseRanked = rankedReferences.map(function(ranked){
            return self.addProject(ranked.owner, ranked.project)
                .then(() => {
                    var localProjectKey = generateKey(ranked.owner, ranked.project);
                    return getById(localProjectKey);
                })
                .then((data) => {
                    const currentReferenced = data.hits.hits[0]._source.referenced;
                    const referenced = pageModel.mergeReferenced(owner, project, currentReferenced);

                    return updateProject(projectKey, {
                        referenced : referenced
                    });
                });
        });

        return Promise.all(promiseRanked)
        .then(() => {
            return getById(projectKey)
        })
        .then((data) => {
            const currentReferences = data.hits.hits[0]._source.references;
            const currentReferencesUpdated = currentReferences.concat(rankedReferences);
            const references = pageModel.mergeReferences(owner, project, currentReferencesUpdated);

            return updateProject(projectKey, {
                references : references
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