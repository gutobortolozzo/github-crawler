var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var pageSchema = new Schema({
    arityOfsentences : Number,
    host			 : String,
    path			 : String,
    owner			 : String,
    project			 : String,
    references		 : Number,
    terms			 : [
        {
            term : String,
            score   : Number
        }
    ],
    parsed			 : {
        type : Date,
        default : Date.now
    }
});

var Page = mongoose.model('page', pageSchema);

module.exports = Page;