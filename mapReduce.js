#### Pages grouped and categorized by their rank (arity of their sentences) ######

var maped = function() {
	if(this.terms.length > 1)
		emit(this.arityOfsentences, this);
};

var reduced = function(sentimentRank, documents) {

	var reducedVal = {};
	reducedVal.paths = [];
	reducedVal.rank = sentimentRank;
	reducedVal.sortedReferences = [];
	
	documents.forEach(function(document){
	 	if(document.path){
			var path = document.path;
			if (path.match && path.match('/.+?/.+?/') && reducedVal.paths.indexOf(path.match('/.+?/.+?/')[0]) == -1)
				path = path.match('/.+?/.+?/')[0];
			reducedVal.paths.push(path);
	 	}
	});
	
	var allTerms = [];
	
	for(var documentIndex = 0; documentIndex < documents.length; documentIndex++){
		var document = documents[documentIndex];
		if(document.terms){
			for(var termIndex = 0; termIndex < document.terms.length; termIndex++){
				var term = document.terms[termIndex];
				allTerms.push({
					term  : term.term,
					score : term.score
				});
			}
		}
	}
	
	reducedVal.sortedReferences = allTerms.sort(function(image1, image2){
		return image2.score - image1.score;
	}).slice(0, 10);
	
	return reducedVal;
};

	
db.pages.mapReduce(maped, reduced, { out : "pages_reduced" });
db.pages_reduced.find().limit(20).pretty()
db.pages_reduced.drop()

##################################

#### AVG documents arity #############

db.pages.aggregate({
  $group : {
     _id : 'key',
     sum: { $sum: "$arityOfsentences" }
  }
}, function(err, results){
	return results.sum;
});

db.pages.mapReduce(maped, reduced, { out : "arities_reduced" });
db.arities_reduced.find().limit(20).pretty()
db.arities_reduced.drop()
		 
// QUEUE controle
		 
 // "ratio unique: " + db.queueitems.distinct('path').length / db.queueitems.count() + " total: " +  db.queueitems.count() + " fetched: "+ db.queueitems.count({ fetched : true}) + " domains: " + db.queueitems.distinct('host').length
		 
		 
db.pages.aggregate(db.pages.aggregate([ {
	 $group: { 
         _id: null, 
         total: { 
             $sum: "$arityOfsentences" 
         } 
     } 
	} ]
)
		 