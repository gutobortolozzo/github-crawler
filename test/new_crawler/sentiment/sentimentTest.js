require("should");
var sentiment = require(process.cwd()+"/src/new_crawler/sentiment/sentiment");

"use strict";
describe('sentiment', function () {

    it('extracted sentiment from empty content', () => {
        sentiment(emptyText).should.be.eql(0);
    });

    it('extracted sentiment from good text', () => {
        sentiment(goodText).should.be.eql(4);
    });

    it('extracted sentiment from bad text', () => {
        sentiment(badText).should.be.eql(-6);
    });

    it('extracted sentiment from mixed bad and good text', () => {
        sentiment(badText+goodText).should.be.eql(0);
    });

    const emptyText = "";
    const goodText = "It's still in the early stages, so we're very interested in bug reports, contributions and the like.";
    const badText = "In fact, if no one has a bad opinion about you, you are doing something utterly wrong.";
});
