require("should");
var util = require(process.cwd()+"/src/new_crawler/url/urlUtil");

"use strict";
describe('url utils', () => {

    const githubCrawlerUrl = "https://github.com/gutobortolozzo/github-crawler";
    const githubCrawlerUrlToIssue = "https://github.com/gutobortolozzo/github-crawler/pulls?q=is%3Aopen+is%3Apr";

    it('parse simple url to project', () => {
        const parsed = util.parse(githubCrawlerUrl);
        parsed.should.have.properties({
            owner   : "gutobortolozzo",
            project : "github-crawler",
            pathname : "/gutobortolozzo/github-crawler"
        });
    });

    it('parse long url to project', () => {
        const parsed = util.parse(githubCrawlerUrlToIssue);
        parsed.should.have.properties({
            owner   : "gutobortolozzo",
            project : "github-crawler",
            pathname : "/gutobortolozzo/github-crawler/pulls"
        });
    });

    it('fetch condition to main project page', () => {
        util.fetchCondition({
            path : "/gutobortolozzo/github-crawler"
        }).should.be.true();
    });

    it('fetch condition to project pulls page', () => {
        util.fetchCondition({
            path : "/gutobortolozzo/github-crawler/pulls"
        }).should.be.true();
    });

    it('fetch condition to project issues page', () => {
        util.fetchCondition({
            path : "/gutobortolozzo/github-crawler/issues"
        }).should.be.true();
    });

    it('fetch condition to project wiki page', () => {
        util.fetchCondition({
            path : "/gutobortolozzo/github-crawler/wiki"
        }).should.be.true();
    });

    it('fetch condition to project pulse page', () => {
        util.fetchCondition({
            path : "/gutobortolozzo/github-crawler/pulse"
        }).should.be.false();
    });

    it('blacklist without owner', () => {
        util.blacklisted(undefined).should.be.true();
    });

    it('blacklist with owner', () => {
        util.blacklisted("explore").should.be.true();
    });

    it('blacklist with valid owner', () => {
        util.blacklisted("gutobortolozzo").should.be.false();
    });
});