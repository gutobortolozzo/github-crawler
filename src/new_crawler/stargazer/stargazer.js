module.exports.social = (cheerioContent) => {

    "use strict";
    let stars = cheerioContent('a[href*=stargazers]').text().trim().replace(',', '');
    let forks = cheerioContent('a[href*=network]').text().trim().replace(',', '');
    let watchers = cheerioContent('a[href*=watchers]').text().trim().replace(',', '');

    return {
        stars    : !!stars ? parseInt(stars) : 0,
        forks    : !!forks ? parseInt(forks) : 0,
        watchers : !!watchers ? parseInt(watchers) : 0
    }
};