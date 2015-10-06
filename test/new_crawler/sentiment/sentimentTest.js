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

    it('extracted sentiment from mixed bad and good text', () => {
        sentiment(bigMixedText).should.be.eql(0);
    });

    const emptyText = "";
    const goodText = "It's still in the early stages, so we're very interested in bug reports, contributions and the like.";
    const badText = "In fact, if no one has a bad opinion about you, you are doing something utterly wrong.";

    const bigMixedText = "The computer's techniques for unraveling Jeopardy! clues sounded just like mine. That machine zeroes " +
        "in on key words in a clue, then combs its memory (in Watson's case, a 15-terabyte data bank of human knowledge) for " +
        "clusters of associations with those words. It rigorously checks the top hits against all the contextual information " +
        "it can muster: the category name; the kind of answer being sought; the time, place, and gender hinted at in the clue; and " +
        "so on. And when it feels sure enough, it decides to buzz. This is all an instant, intuitive process for a human Jeopardy! " +
        "player, but I felt convinced that under the hood my brain was doing more or less the same thing.";
});
