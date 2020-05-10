#!/bin/bash

set -e

cd ..

echo "==> Running build"
yarn run build

echo "==> Running deploy"
yarn run deploy