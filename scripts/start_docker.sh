#!/usr/bin/env bash

docker run -p 5000:5000 -v ~/workspace/atm/ATM-VIS/atm.db:/code/atm.db \
    -v ~/workspace/atm/ATM-VIS/atm:/code/atm -v ~/workspace/atm/ATM-VIS/logs:/code/logs \
    -v ~/workspace/atm/ATM-VIS/models:/code/models -v ~/workspace/atm/ATM-VIS/metrics:/code/metrics  \
    atm-vis