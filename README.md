# A GUI for the ATM framework


# Setup

First, run the follow commands to clone ATM as a submodule

```
git submodule init 
git submodule update
```
Then, go to `lib/atm` and install ATM as described in [here](https://github.com/HDI-Project/ATM)

Then go to `server/` and run `pip install -r requirements.txt`

In development mode:

In production mode: 

# Development

## Server

To start the server, first set `$PYTHONPATH` to include the local `atm_server` package: 
```bash
export PYTHONPATH=$PYTHONPATH:`pwd`/server/
```

Then start the atm server by: `python server/atm_server/server.py`

The routes (API) are defined in `server/atm_server/api.py`

## Front
