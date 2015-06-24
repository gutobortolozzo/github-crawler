var http = require('http');
var url = require('url');

function Route(path, callback){
	this._path = path;
	this._callback = callback;
	
	this.accept = function(query){
		return this._path == query;
	}
}

function Routes(){
	
	this.routes = [];
	
	this.get = function(path, callback){
		var extension = new Route(path, callback);
		this.routes.push(extension);
	}
}

var routes = new Routes();

routes.get("/name", function(){
	return "Augusto";
});

routes.get("/path", function(){
	return {
		nome : 'Joao',
		cep  : '80540-230'
	}
	
});

var server = http.createServer(function(request, response) {
	var pathname = url.parse(request.url, true).pathname;
	
	routes.routes.filter(function(route){
		return route.accept(pathname);
	}).forEach(function(route){
		var result = route._callback();
		response.end(JSON.stringify(result));
	});
	
	response.end();
	response.writeHead(200, {"Content-Type": "text/plain" });
});

server.listen(12001);
