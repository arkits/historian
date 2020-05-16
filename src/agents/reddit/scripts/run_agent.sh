set -e

AGENT_HOME="/home/arkits/software/historian/src/agents/reddit"

cd $AGENT_HOME

# install deps
yarn

# run with production
yarn run prod
