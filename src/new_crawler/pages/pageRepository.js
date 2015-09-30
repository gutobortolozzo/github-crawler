var _ = require('underscore');

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
            references  : 0
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

        project.sentiment = (project.sentiment + sentimentIndex) / project.references;
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
        if(isInvalid(owner, project)) return;



        rankedReferences.forEach(function(){

        });

    };

    this.print = function(){
        process.stdout.write('\u001B[2J\u001B[0;0f');

        var values = projects.values();

        var next = values.next();

        while(!!next.value){
            console.log(next.value);
            next = values.next();
        }

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