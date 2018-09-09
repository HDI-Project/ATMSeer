#!/usr/bin/env bash

npm run build
docker build . -t atm-vis