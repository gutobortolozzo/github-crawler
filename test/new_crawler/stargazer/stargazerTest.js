require("should");
const stargazer = require(process.cwd()+"/src/new_crawler/stargazer/stargazer");
const cheerio = require('cheerio');
const fs = require('fs');

"use strict";
describe('Stars/Forks/Watchers', () => {

    it('number of stars', () => {
        stargazer.social(cheerioContent).stars.should.be.eql(1046);
    });

    it('number of forks', () => {
        stargazer.social(cheerioContent).forks.should.be.eql(177);
    });

    it('number of watchers', () => {
        stargazer.social(cheerioContent).watchers.should.be.eql(71);
    });

    const pageContent = fs.readFileSync(process.cwd()+"/test/new_crawler/stargazer/headerPage.txt", "utf8");
    const cheerioContent = cheerio.load(pageContent);
});
