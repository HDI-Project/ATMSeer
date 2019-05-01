# ATMSeer: Increasing Transparency and Controllability in Automated Machine Learning

### Abstract

To relieve the pain of manually selecting machine learning algorithms and tuning hyperparameters, automated machine learning (AutoML) methods have been developed to automatically search for good models.
Due to the huge model search space, it is impossible to try all models. Users tend to distrust automatic results and increase the search budget as much as they can, thereby undermining the efficiency of AutoML.
To address these issues, we design and implement ATMSeer, an interactive visualization tool that supports users in refining the search space of AutoML and analyzing the results.
To guide the design of ATMSeer, we derive a workflow of using AutoML based on interviews with machine learning experts.
A multi-granularity visualization is proposed to enable users to monitor the AutoML process, analyze the searched models, and refine the search space in real time.
We demonstrate the utility and usability of ATMSeer through two case studies, expert interviews, and a user study with 13 end users.

The paper has been published at **ACM CHI 2019**.[PDF](https://arxiv.org/abs/1902.05009)

=========================

# Video

[![ATMSEER VIDEO](https://img.youtube.com/vi/7QwN3mmiCzY/0.jpg)](http://www.youtube.com/watch?v=7QwN3mmiCzY "Video Title")

=========================

# Download ATMSeer

```
git clone https://github.com/HDI-Project/ATMSeer.git /path/to/atm
```

# Build a virtual enviroment
```
cd /path/to/atm
virtualenv venv
. venv/bin/activate
```

# Setup ATM

### Clone ATM as a submodule
First, run the following commands to clone ATM as a submodule

```
git submodule init
git submodule update
```

### Install a database
Then, go to `lib/atm`

You will need to install the libmysqlclient-dev package (for sqlalchemy)

```
sudo apt install libmysqlclient-dev
```

and at least one of the following databases.

- for SQLite (simpler):
```
sudo apt install sqlite3
```

- for MySQL:
```
sudo apt install mysql-server mysql-client
```

**Note:** as the scikit_learn has been updated and the new version of it is not compatible with current version of ATM, you should run the following commands

```
pip uninstall scikit_learn
pip install scikit_learn==0.19.2
```

### Install python dependencies for ATM.
```
python setup.py install
```


# Setup the server for ATMSeer
After configuring the ATM, then go to `server/` and run `pip install -r requirements.txt`





# Run
Go to root directory
Set `$PYTHONPATH` to include the local `atm_server` package:
```bash
export PYTHONPATH=$PYTHONPATH:`pwd`/server/
```

### Production Mode
At root directory, start the atm server by:
```
python server/atm_server/server.py
```

Build the frontend

```
npm install
npm run build
```

Then, access `http://localhost:7777/` at your web broswer to see the ATMSeer.

## Development Mode


At the root directory, start the atm server by:
```
python server/atm_server/server.py --debug
```

Start the front end at developer modo:

```
npm install
npm start
```

You can access the `http://localhost:7779/` to see the ATMSeer.

# Build

## Build and Deploy with Docker

Run `scripts/build_with_docker.sh` to build the docker image

Run `scripts/start_docker.sh` to start the app
