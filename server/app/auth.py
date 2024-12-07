import json
import os
from flask import Flask, redirect, request, url_for, Blueprint
from flask_login import (
    LoginManager,
    current_user,
    login_required,
    login_user,
    logout_user,
)
from oauthlib.oauth2 import WebApplicationClient
import requests

auth = Blueprint("auth", __name__, url_prefix="/")