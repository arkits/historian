import RedditIcon from '@mui/icons-material/Reddit';
import DescriptionIcon from '@mui/icons-material/Description';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { formatDistance } from 'date-fns';

export const getPrettyType = (type) => {
    switch (type) {
        case 'log':
            return 'Log';
        case 'reddit/saved':
            return 'Saved';
        case 'reddit/upvoted':
            return 'Upvoted';
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
            return `${getPrettyType(history?.type)} • /${history?.content?.subreddit} • ${history?.content?.author}`;
        case 'spotify/recently-played':
            return `${getPrettyType(history?.type)} • ${history?.content?.albumName}`;
        default:
            return `${getPrettyType(history?.type)} • ${history?.content?.author}`;
    }
};

export const getSubtitleText2 = (history) => {
    switch (history?.type) {
        case 'reddit/saved':
        case 'reddit/upvoted':
            return `
            Saved ${formatDistance(new Date(history?.createdAt), new Date(), {
                addSuffix: true
            })} 
            • 
            Posted ${formatDistance(new Date(history?.content?.created_utc * 1000), new Date())}
            `;
        case 'spotify/recently-played':
            return `Saved ${formatDistance(new Date(history?.createdAt), new Date(), {
                addSuffix: true
            })}  • Played ${formatDistance(new Date(history?.content?.played_at), new Date(), {
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
        default:
            return history?.content?.thumbnail;
    }
};
