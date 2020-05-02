var bunyan = require('bunyan');
var log = bunyan.createLogger({ name: 'iss' });
var instagramApi = require('instagram-private-api');
var config = require('config');
var fs = require('fs');

const instagramConfig = config.get('instagram');

let igClient = new instagramApi.IgApiClient();

(async () => {
    try {
        await igClient.state.generateDevice(instagramConfig.username);
        await igClient.simulate.preLoginFlow();

        log.info('Logging in...');
        let loggedInUser = await igClient.account.login(instagramConfig.username, instagramConfig.password);
        await igClient.simulate.postLoginFlow();

        log.info('Logged in! loggedInUser.pk - ', loggedInUser.pk);

        let archivedItems = {};

        log.info('Getting saved items...');
        let saved = await igClient.feed.saved(loggedInUser.pk);
        let savedItems = await saved.items();

        let continueFetching = true;

        while (continueFetching) {
            for (let savedItem of savedItems) {
                let itemToArchive = await parseItem(savedItem);

                if (itemToArchive['pk'] in archivedItems) {
                    log.warn('Item - %s already exists... ignoring', itemToArchive['pk']);
                } else {
                    archivedItems[itemToArchive['pk']] = itemToArchive;
                    log.info('Added item - %s', itemToArchive['pk']);
                }
            }

            if (saved.isMoreAvailable()) {
                continueFetching = true;
                log.info('More saved posts are available... waiting before requesting...');
                dumpJson(archivedItems, 'archive.json');
                await timeout(200);
                log.info('Requesting more posts!');
                savedItems = await saved.items();
            } else {
                continueFetching = false;
            }
        }

        dumpJson(archivedItems, 'archive.json');
    } catch (error) {
        log.error('Caught Error! \n - ', error);
    }
})();

function timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function dumpJson(toDump, fileName) {
    log.info('Dumping checkpoint...');
    fs.writeFileSync(fileName, JSON.stringify(toDump, null, 4));
    return;
}

async function parseItem(savedItem) {
    let itemToArchive = {};

    try {
        itemToArchive['taken_at'] = savedItem.taken_at;
        itemToArchive['pk'] = savedItem.pk;
        itemToArchive['username'] = savedItem.user.username;

        // Get caption - which can be null
        if (savedItem.hasOwnProperty('caption') && savedItem.caption !== null) {
            itemToArchive['caption'] = savedItem.caption.text;
        }

        let mediaUrls = [];

        // Handle regular posts
        if (savedItem.hasOwnProperty('image_versions2')) {
            let url = savedItem.image_versions2.candidates[0].url;
            mediaUrls.push(url);
        }

        // Handle carousel_media
        if (savedItem.hasOwnProperty('carousel_media')) {
            for (let carouselMedia of savedItem.carousel_media) {
                let url = carouselMedia.image_versions2.candidates[0].url;
                mediaUrls.push(url);
            }
        }

        // Handle videos
        if (savedItem.hasOwnProperty('video_versions')) {
            let url = savedItem.video_versions[0].url;
            mediaUrls.push(url);
        }

        itemToArchive['mediaUrls'] = mediaUrls;
    } catch (error) {
        log.error('Caught error when parsing savedItem - ', error, savedItem);
    }

    return itemToArchive;
}
