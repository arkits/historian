var fs = require('fs');
const snoowrap = require('snoowrap');
const config = require('config');
const historianDomain = require('./historian');

(async () => {
    try {
        console.log('Reading saves.json');
        let saves = fs.readFileSync('test.json');
        saves = JSON.parse(saves);
        console.log('There are ' + saves.length + ' posts');

        // Create reddit client
        const redditClient = new snoowrap({
            userAgent: config.get('reddit.userAgent'),
            clientId: config.get('reddit.clientId'),
            clientSecret: config.get('reddit.clientSecret'),
            username: config.get('reddit.username'),
            password: config.get('reddit.password')
        });

        let histories = [];

        for (let save of saves) {
            console.log('Get Content for - ', save.id);

            try {
                // let score = await (await redditClient.getSubmission(save.id)).score;
                let content_url = await (await redditClient.getSubmission(save.id)).url;

                let parsedMetadata = {
                    pk: save.id,
                    score: save.ups,
                    title: save.title,
                    author: save.author,
                    permalink: save.permalink,
                    subreddit: save.subreddit,
                    thumbnail: save.thumbnail,
                    content_url: content_url,
                    created_utc: save.created_utc
                };

                let historyBody = {
                    type: 'reddit_saved',
                    metadata: parsedMetadata,
                    timestamp: new Date()
                };

                console.log('Parsed - ', historyBody.metadata.pk);

                histories.push(historyBody);

                dumpJson(histories, 'historyBody.json');

                await historianDomain.sleep(200);
            } catch (error) {
                console.log('Caught Error - ', error);
            }
        }

        console.log('Completed Parsing...');

        await historianDomain.staggeredHistoryInsert(histories);

        await historianDomain.updateUserMetadata();
    } catch (error) {
        console.log('Caught Error! \n - ', error);
    }
})();

async function dumpJson(toDump, fileName) {
    console.log('Dumping checkpoint...');
    fs.writeFileSync(fileName, JSON.stringify(toDump, null, 4));
    return;
}
