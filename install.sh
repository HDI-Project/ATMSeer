#!/bin/sh
virtualenv venv
. venv/bin/activate

cd lib/atm
git submodule init
git submodule update

pip uninstall scikit_learn
pip install scikit_learn==0.19.2

python setup.py install

cd ../../server
pip install -r requirements.txt

cd ..
mkdir logs
mkdir metrics
chmod 0777 logs
chmod 0777 metrics

npm install
sh ./startserver.sh