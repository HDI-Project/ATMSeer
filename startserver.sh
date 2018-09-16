#!/bin/sh
export PYTHONPATH=$PYTHONPATH:`pwd`/server/
python server/atm_server/server.py
