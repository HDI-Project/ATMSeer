FROM ubuntu:16.04

COPY ./sources.list.0 /etc/apt/sources.list

RUN apt-get update \
    && apt-get -y install \
    curl \
    apt-transport-https \
    apt-utils \
    python3 \
    python3-pip \
    unzip \
    git \
    ssh \
    gcc \
    make \
    build-essential \
    libkrb5-dev \
    libmysqlclient-dev \
    sqlite3 \
    libssl-dev \
    libcrypto++-dev

COPY ./sources.list /etc/apt/sources.list

RUN curl -sSL https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add - \
    && apt-get update \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

ADD . /code

WORKDIR /code

RUN pip3 install --upgrade pip \
    && pip3 config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple\
    && pip3 install -r lib/atm/requirements.txt \
    && pip3 install lib/atm/ \
    && pip3 install -r server/requirements.txt \
    && pip3 uninstall -y scikit_learn \
    && pip3 install scikit_learn==0.19.2

RUN npm install --quiet \
    && npm run build

EXPOSE 5000

# ENTRYPOINT [ "python" ]
ENV PYTHONPATH "${PYTHONPATH}:/code/server"
