# A GUI for the ATM framework


# Setup

First, go to `lib/atm`, and install ATM as described in [here](https://github.com/HDI-Project/ATM)

Then go to `server/` and run `pip install -r requirements.txt`

In development mode:

In production mode: 

# Development

1. Set `$PYTHONPATH` to include the local `atm_server` package: 
    ```
    export PYTHONPATH=$PYTHONPATH:`pwd`/server/
    ```

2. Start the atm server by: `python server/atm_server/cli.py run` or `python server/atm_server/server.py`
