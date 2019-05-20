git submodule init
git submodule update
mkdir logs && chmod 0777 logs
mkdir metrics && chmod 0777 metrics
mkdir models && chmod 0777 models

vagrant up --provision-with vagrantprovision
vagrant reload
