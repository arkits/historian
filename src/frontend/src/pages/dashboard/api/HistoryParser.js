const getPrettyTitle = (history, titleLength) => {
    let title = '';
    if (history?.type === 'instagram_saved') {
        title = history?.metadata?.caption;
    } else if (history?.type === 'lastfm_nowplaying') {
        title = history?.metadata?.name;
    } else {
        title = history?.metadata?.title;
    }

    try {
        if (title.length > titleLength) {
            title = title.slice(0, titleLength) + '...';
        }
    } catch (error) {
        title = '[No Title]';
    }

    return title;
};

const getPrettyUsername = (history) => {
    if (history?.type === 'instagram_saved') {
        return history?.metadata?.username;
    } else if (history?.type === 'lastfm_nowplaying') {
        return history?.metadata?.artist['#text'] + ' // ' + history?.metadata?.album['#text'];
    } else {
        return history?.metadata?.author;
    }
};

const getThumbnail = (history) => {
    if (history?.type === 'instagram_saved') {
        return history?.metadata?.mediaUrls[0];
    } else if (history?.type === 'lastfm_nowplaying') {
        return history?.metadata?.image[history?.metadata?.image.length - 1]['#text'];
    } else {
        return history?.metadata?.thumbnail;
    }
};

const getPermalink = (history) => {
    if (history?.type === 'instagram_saved') {
        return history?.metadata?.mediaUrls[0];
    } else if (history?.type === 'lastfm_nowplaying') {
        return history?.metadata?.url;
    } else {
        return history?.metadata?.content_url;
    }
};

module.exports = {
    getPrettyTitle,
    getPrettyUsername,
    getThumbnail,
    getPermalink
};
