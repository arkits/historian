var fs = require('fs');
var axios = require('axios');

let saves = [];

(async () => {
    try {
        let keepGoing = true;
        let skip = 0;

        while (keepGoing) {
            let response = await axios.get(`https://rss.xyz/rss/api/saves?skip=${skip}&limit=50`, {
                headers: {
                    Authorization: 'Basic XXXX=='
                }
            });

            if (response.data.saved_posts.length > 0) {
                response.data.saved_posts.forEach((element) => {
                    saves.push(element);
                });
                dumpJson(saves, 'saves.json');
                skip = skip + 50;
            } else {
                keepGoing = false;
            }
        }
    } catch (error) {
        log.error('Caught Error! \n - ', error);
    }
})();

async function dumpJson(toDump, fileName) {
    console.log('Dumping checkpoint...');
    fs.writeFileSync(fileName, JSON.stringify(toDump, null, 4));
    return;
}