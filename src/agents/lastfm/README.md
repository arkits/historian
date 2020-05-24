# LastFM Agent for Historian

## About

The LastFM Agent for Historian captures your now playing tracks and submits them to Historian.

## Setup

### Requirements
- Node.js
- LastFM API Credentials -  sign-up for at https://www.last.fm/api

### Installation
- Install dependencies.
```bash
yarn
```
- Configure the Agent by editing `config/default.json`.
    - The Agent uses node-config for config management. Please refer to their documentation for more info.

### Deployment
The LastFM Agent is designed to stay running 24x7. One way to accomplish this is to have [pm2](https://pm2.keymetrics.io/) manage the process. 

Follow [pm2's quick start](https://pm2.keymetrics.io/docs/usage/quick-start/) guide to install it on your system, and then start the Agent by running the following command in this directory - 
```bash
pm2 start yarn --interpreter bash --name "historian-lastfm" -- prod
```
This is equivalent to running `yarn run prod`, but the process is now managed by pm2. 