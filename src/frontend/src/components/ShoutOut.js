import React from 'react';
import { Link, Typography } from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';

export default function ShoutOuts() {
    return (
        <Typography variant="body2" color="textSecondary" style={{ textAlign: 'center', color: '#FFC105' }}>
            <Link color="inherit" component={RouterLink} to="/">
                #NeverForget
            </Link>
            {' // '}
            <Link color="inherit" target="_blank" rel="noopener" href="https://github.com/arkits/historian">
                Historian
            </Link>
            {' by '}
            <Link color="inherit" target="_blank" rel="noopener" href="https://github.com/arkits">
                arkits
            </Link>
        </Typography>
    );
}
