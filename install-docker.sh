git submodule init
git submodule update
mkdir logs && chmod 0777 logs
mkdir metrics && chmod 0777 metrics
mkdir models && chmod 0777 models

docker-compose up
