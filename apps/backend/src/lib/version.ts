import getRepoInfo from 'git-repo-info';
import logger from './logger';

const info = getRepoInfo();

export const timeStart = new Date();
export const version = info.abbreviatedSha;
