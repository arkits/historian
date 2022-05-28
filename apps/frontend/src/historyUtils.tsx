import InstagramIcon from '@mui/icons-material/Instagram';
import RedditIcon from '@mui/icons-material/Reddit';
import DescriptionIcon from '@mui/icons-material/Description';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';

export const getPrettyAvatar = (history) => {
    if (history?.type === 'instagram') {
        return <InstagramIcon />;
    } else if (history?.type === 'reddit') {
        return <RedditIcon />;
    } else if (history?.type === 'lastfm') {
        return <MusicNoteRoundedIcon />;
    } else {
        return <DescriptionIcon />;
    }
};
