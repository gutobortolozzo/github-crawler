require("should");
var rank = require(process.cwd()+"/src/new_crawler/rank/rank");

"use strict";
describe('rank', function () {

    const content = "<!DOCTYPE html>"+
        "<html>"+
        "<body>"+
        "<p><a href=\"https://www.github.com/test/test\">Magic test project</a></p>"+
        "</body>"+
        "</html>";

    it('extracted one referenced project', () => {
        rank.calculateRank(content, "crawler", "crawler").length.should.be.eql(1);
    });

    it('extracted one referenced project and check owner/project',() => {
        var ranking = rank.calculateRank(content, "crawler", "crawler");

        ranking.length.should.be.eql(1);
        ranking.pop().should.have.properties({
            owner   : "test",
            project : "test"
        });
    });

    it('extracted none referenced project since owner/project is the same', () => {
        rank.calculateRank(content, "Test", "test").length.should.be.eql(0);
    });
});
