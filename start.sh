#!/bin/sh
. /vagrant/venv/bin/activate
export PYTHONPATH=$PYTHONPATH:`pwd`/server/
npm start > node.log &
python server/atm_server/server.py --debug
