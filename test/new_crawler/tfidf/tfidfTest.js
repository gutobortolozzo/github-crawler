const should = require("should");
var tfidf = require(process.cwd()+"/src/new_crawler/tfidf/tfidf");

"use strict";
describe('text frequency, inverse document frequency', function () {

    it('calculate number of frequencies', () => {
        var frequencies = tfidf(text);
        frequencies.length.should.be.eql(29);
    });

    it('calculate most acurate frequencies', () => {
        var frequencies = tfidf(text);

        frequencies.should.be.containDeep([{
           term  : "nvm",
           score : 0.921
        }]);
    });

    it('calculate ordered frequencies', () => {

        const frequencies = tfidf(text);

        for(var index = 0; index < frequencies.length -1; index++)
            if (frequencies[index].score < frequencies[++index].score)
                should.fail('Elements ordered incorrectly')
    });

    const text = "First you'll need to make sure your system has a c++ compiler. For OSX, XCode will work, for Ubuntu, the build-essential and libssl-dev packages work."+
            "Note: nvm does not support Windows (see #284). Two alternatives exist, which are neither supported nor developed by us:"+
            "nvm-windows"+
            "Note: nvm does not support Fish either (see #303). An alternative exists, which is neither supported nor developed by us:"+
            "bass allows to use utilities written for Bash in fish shell"
});

