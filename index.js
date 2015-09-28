var cluster = require('cluster');

if (cluster.isMaster) {
		
	for (var i = 0; i < 8; i++)
		cluster.fork();
	
} else {
    require('./src/crawler/natural.js');
}