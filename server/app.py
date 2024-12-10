# Create the app and run the app
# server/app.py
from .app import create_app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
