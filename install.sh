#!/bin/sh
# rm -rf logs
# rm -rf metrics
git submodule init
git submodule update
mkdir logs && chmod 0777 logs
mkdir metrics && chmod 0777 metrics
mkdir models && chmod 0777 models
touch atm.db && chmod 0777 atm.db

vagrant up --provision-with vagrantprovision
vagrant reload

