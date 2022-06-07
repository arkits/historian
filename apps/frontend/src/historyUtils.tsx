import InstagramIcon from '@mui/icons-material/Instagram';
import RedditIcon from '@mui/icons-material/Reddit';
import DescriptionIcon from '@mui/icons-material/Description';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';

export const getPrettyType = (type) => {
    switch (type) {
        case 'reddit-saved':
            return 'Saved';
        case 'reddit-upvoted':
            return 'Upvoted';
        default:
            return type;
    }
};

export const getPrettyAvatar = (history) => {
    if (history?.type === 'instagram') {
        return <InstagramIcon />;
    } else if (history?.type === 'reddit-saved') {
        return <RedditIcon />;
    } else if (history?.type === 'reddit-upvoted') {
        return <RedditIcon />;
    } else if (history?.type === 'lastfm') {
        return <MusicNoteRoundedIcon />;
    } else {
        return <DescriptionIcon />;
    }
};

export const getTitleText = (history) => {
    return history?.content?.title ?? '[NO TITLE]';
};

export const getSubtitleText = (history) => {
    switch (history?.type) {
        case 'reddit-saved':
        case 'reddit-upvoted':
            return `${getPrettyType(history?.type)} • /${history?.content?.subreddit} • ${history?.content?.author}`;
        default:
            return `${getPrettyType(history?.type)} • ${history?.content?.author}`;
    }
};
