#!/bin/bash

set -e

HISTORIAN_HOME=/home/arkits/software/historian

cd $HISTORIAN_HOME/src/frontend

echo "==> Building prod artifact"
yarn
yarn build
