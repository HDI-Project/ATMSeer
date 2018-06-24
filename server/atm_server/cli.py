import click
from flask import Flask
from flask.cli import FlaskGroup

from atm_server.server import create_app

@click.group(cls=FlaskGroup, create_app=create_app)
def cli():
    """Management script for the Wiki application."""

if __name__ == '__main__':
    cli()