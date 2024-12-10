"""
Initialize backend test package.
Ensures that pytest can discover and run tests correctly.
"""
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'server')))