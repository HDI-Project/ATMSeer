FROM ubuntu:16.04

RUN apt-get update -y && \
    apt-get install -y python3 python3-pip && \
    pip3 install --upgrade pip

RUN apt-get install -y libmysqlclient-dev sqlite3

RUN curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
RUN sudo apt-get install -yq nodejs \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

ADD . /code
WORKDIR /code

RUN pip3 install -r lib/atm/requirements.txt

RUN pip3 install lib/atm/

RUN pip3 install -r server/requirements.txt

RUN npm install --quiet

RUN npm run build

EXPOSE 5000

# ENTRYPOINT [ "python" ]
ENV PYTHONPATH "${PYTHONPATH}:/code/server"
