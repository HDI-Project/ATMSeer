
cd /vagrant
. /vagrant/venv/bin/activate
npm start > node.log &
export PYTHONPATH=$PYTHONPATH:`pwd`/server/
python server/atm_server/server.py --debug

#source startserver.sh