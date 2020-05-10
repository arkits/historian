#!/bin/bash

set -e

HISTORIAN_HOME=/home/arkits/software/historian

cd $HISTORIAN_HOME/src/frontend

git pull

echo "==> Building prod artifact"
yarn
yarn build
