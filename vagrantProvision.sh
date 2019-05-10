sudo apt-get update -y && \
   apt-get install -y python3 python3-pip && \
   pip3 install --upgrade pip

sudo apt-get install -y libmysqlclient-dev sqlite3
sudo pip3 install virtualenv

cd /vagrant && virtualenv venv
source venv/bin/activate

pip3 install -r lib/atm/requirements.txt
pip3 install lib/atm/
pip3 install -r /vagrant/server/requirements.txt

pip3 uninstall -y scikit_learn
pip3 install scikit_learn==0.19.2

(cd /vagrant/lib/atm/ && python setup.py install)

curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install
