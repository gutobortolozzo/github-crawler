const elasticsearch = require('elasticsearch');
const util = require('util');
const client = new elasticsearch.Client({
    host : 'localhost:9200'
});

const query = () => {
    return client.search({
        index: 'github',
        query_string : {
            fields : ["description", "tags"],
            query : "node"
        }
    });
};

client.ping({
    requestTimeout: 50,
    hello: "elasticsearch_Bortolozzo"
}).then(() => {
    return client.indices.delete({
        index: 'github'
    });
}).then(() => {
    return client.create({
        consistency : 'one',
        refresh : true,
        index: 'github',
        type: 'repos',
        id: '1',
        body: {
            description: 'Sequelize is an easy-to-use multi sql dialect ORM for Node.js & io.js. It currently supports MySQL, MariaDB, SQLite, PostgreSQL and MSSQL.',
            tags: ['node.js', 'ORM', 'mysql', 'postgresql', 'open source'],
            published_at: new Date(),
            counter: 1
        }
    });
}).then(() => {
    return query();
}).then((response) => {
    console.log(util.inspect(response.hits, false, null));
    return response;
}).then((response) => {
    return client.update({
        consistency : 'one',
        refresh : true,
        index: 'github',
        type: 'repos',
        id: '1',
        body : {
            doc: {
                counter : response.hits.hits[0]._source.counter + 1
            }
        }
    });
}).then(() => {
    return query();
}).then((response) => {
    console.log(util.inspect(response.hits, false, null));
}).catch((error) => {
    console.log(error);
})