from flask import Blueprint, redirect, render_template, url_for, request
from flask_login import current_user, login_required

main= Blueprint("main", __name__, url_prefix="/")
