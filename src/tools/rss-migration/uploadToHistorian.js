var fs = require('fs');
const historianDomain = require('./historian');

(async () => {
    try {
        console.log('Reading saves.json');
        let saves = fs.readFileSync('historyBody.json');
        saves = JSON.parse(saves);
        console.log('There are ' + saves.length + ' posts');

        await historianDomain.staggeredHistoryInsert(saves);

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
