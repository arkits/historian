# Reddit Agent for Historian

## About

The Reddit Agent for Historian captures your Saved posts (comments and submission) and submits them to Historian.

## Setup

### Requirements
- Node.js
- Reddit API Credentials

### Installation
- Install dependencies.
```bash
yarn
```
- Configure the Agent by editing `config/default.json`.
    - The Agent uses node-config for config management. Please refer to their documentation for more info.
- Setup cronjob to invoke the Agent on a timer.
```bash
crontab -e

# sample crontab syntax to invoke the agent every 1 hour
0 * * * * /home/arkits/software/historian/src/agents/reddit/scripts/run_agent.sh
```