FROM ubuntu:16.04

# install utilities
RUN apt-get update -yqq  \
 && apt-get install -yqq \
 unzip \
 curl \
 git \
 ssh \
 gcc \
 make \
 build-essential \
 libkrb5-dev \
 sudo \
 apt-utils

RUN sudo apt-get install -y python3 python3-pip && \
    pip3 install --upgrade pip

RUN sudo apt-get install -y libmysqlclient-dev sqlite3

RUN curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
RUN sudo apt-get install -yq nodejs \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

ADD . /code
WORKDIR /code

RUN pip3 install -r lib/atm/requirements.txt

RUN pip3 install lib/atm/

RUN pip3 install -r server/requirements.txt

RUN pip3 uninstall -y scikit_learn
RUN pip3 install scikit_learn==0.19.2

RUN npm install --quiet

RUN npm run build

EXPOSE 5000

# ENTRYPOINT [ "python" ]
ENV PYTHONPATH "${PYTHONPATH}:/code/server"
