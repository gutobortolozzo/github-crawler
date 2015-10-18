var _ = require('underscore');
var PouchDB = require('pouchdb');

"use strict"
function PageRepository(){
    
    var projects = new Map();
    var visited = 0;

    this.addProject = function(owner, project){
        visited++;
        if(isInvalid(owner, project)) return;

        var projectKey = generateKey(owner, project);

        if(projects.has(projectKey)) return;

        projects.set(projectKey, {
            owner       : owner,
            name        : project,
            visits      : 0,
            sentiment   : 0,
            frequencies : [],
            references  : 0,
            referenced  : 0
        });
    };

    this.incrementVisits = function(owner, project){
        if(isInvalid(owner, project)) return;

        var projectKey = generateKey(owner, project);

        projects.get(projectKey).visits += 1;
    };

    this.setSentimentIndex = function(owner, project, sentimentIndex){
        if(isInvalid(owner, project)) return;

        var projectKey = generateKey(owner, project);

        var project = projects.get(projectKey);

        project.sentiment = (project.sentiment + sentimentIndex) / project.visits;
    };

    this.setFrequency = function(owner, project, listOfFrequencies){
        if(isInvalid(owner, project)) return;

        var projectKey = generateKey(owner, project);

        var project = projects.get(projectKey);

        var frequencies = project.frequencies.concat(listOfFrequencies);

        var uniqueList = _.uniq(frequencies, function(item){
            return item.term;
        });

        project.frequencies = uniqueList.sort(function(a, b){
            return b.score - a.score;
        }).slice(0, 10);
    };

    this.setRankedReferences = function(owner, project, rankedReferences){
        var self = this;

        if(isInvalid(owner, project)) return;

        var projectKey = generateKey(owner, project);

        var project = projects.get(projectKey);

        rankedReferences.forEach(function(ranked){
            self.addProject(ranked.owner, ranked.project);

            var localProjectKey = generateKey(ranked.owner, ranked.project);

            var project = projects.get(localProjectKey);

            project.referenced += 1;
        });

        project.references += rankedReferences.length;
    };

    this.print = function(){
        process.stdout.write('\u001B[2J\u001B[0;0f');

        var values = projects.values();

        //for(let value of projects.values()){
        //    if(value.frequencies.length == 0) continue;
        //    console.log(value);
        //}

        console.log('##########', 'visited', visited, '##########');
    };

    var generateKey = function(owner, project){
        return owner+':'+project;
    };

    var isInvalid = function(owner, project){
        return !owner || !project;
    }
}

module.exports = PageRepository;