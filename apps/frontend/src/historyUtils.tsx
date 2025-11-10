import RedditIcon from '@mui/icons-material/Reddit';
import DescriptionIcon from '@mui/icons-material/Description';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { formatDistance } from 'date-fns';
import { prettyDate } from './dateFormat';

export const getPrettyType = (type) => {
    switch (type) {
        case 'log':
            return 'Log';
        case 'reddit/saved':
            return 'Reddit Saved';
        case 'reddit/upvoted':
            return 'Reddit Upvoted';
        case 'spotify/recently-played':
            return 'Spotify';
        case 'youtube/liked':
            return 'YouTube Liked';
        case 'instagram/saved':
            return 'Instagram Saved';
        default:
            return type;
    }
};

export const getPrettyAvatar = (history) => {
    switch (history?.type) {
        case 'log':
            return <ClearAllIcon />;
        case 'reddit/saved':
        case 'reddit/upvoted':
            return <RedditIcon />;
        case 'spotify/recently-played':
            return <MusicNoteRoundedIcon />;
        default:
            return <DescriptionIcon />;
    }
};

export const getTitleText = (history) => {
    switch (history?.type) {
        case 'log':
            return `${history?.content?.level}: ${history?.content?.message}`;
        case 'spotify/recently-played':
            return `${history?.content?.trackName} - ${history?.content?.artistName}`;
        case 'youtube/liked':
            return history?.content?.title ?? history?.content?.videoTitle ?? '[NO TITLE]';
        case 'reddit/saved':
        case 'reddit/upvoted':
        default:
            return history?.content?.title ?? '[NO TITLE]';
    }
};

export const getSubtitleText = (history) => {
    switch (history?.type) {
        case 'log':
            return `${getPrettyType(history?.type)}`;
        case 'reddit/saved':
        case 'reddit/upvoted':
            return `/r/${history?.content?.subreddit} • u/${history?.content?.author}`;
        case 'spotify/recently-played':
            return `${history?.content?.albumName}`;
        case 'youtube/liked':
            return `${history?.content?.channelTitle || history?.content?.channelName || 'Unknown Channel'}`;
        default:
            return history?.content?.author ? `By ${history?.content?.author}` : '';
    }
};

export const getSubtitleText2 = (history) => {
    switch (history?.type) {
        case 'reddit/saved':
        case 'reddit/upvoted':
            return `Posted ${formatDistance(new Date(history?.content?.created_utc * 1000), new Date())}`;
        case 'spotify/recently-played':
            return `Played ${formatDistance(new Date(history?.timelineTime), new Date(), {
                addSuffix: true
            })}`;
        case 'youtube/liked':
            return `Liked ${formatDistance(new Date(history?.timelineTime), new Date(), {
                addSuffix: true
            })}`;
        case 'log':
        default:
            return `Saved ${formatDistance(new Date(history?.createdAt), new Date(), {
                addSuffix: true
            })}`;
    }
};

export const getThumbnail = (history) => {
    switch (history?.type) {
        case 'log':
            return null;
        case 'reddit/saved':
        case 'reddit/upvoted':
            return history?.content?.thumbnail;
        case 'spotify/recently-played':
            return history?.content?.albumArt;
        case 'youtube/liked':
            return history?.content?.thumbnail || history?.content?.thumbnailUrl;
        default:
            return history?.content?.thumbnail;
    }
};
