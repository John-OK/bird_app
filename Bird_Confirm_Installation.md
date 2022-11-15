1. Create a directory to contain entire project; CD to the directory
2. Initialize an empty Git repository
```
git init
```
2. Clone the repository
```
git clone https://github.com/John-OK/bird_app.git
```
3. CD to "backend" directory and start server with the following:
```
python manage.py runserver
```
4. Check the response in the terminal to find the address of the server (usually 127.0.0.1:8000)
5. Open a web browser and naviage to 127.0.0.1:8000 (or whatever address and port was given in the previous step)
6. Currently, the user's location is hard coded to Sao Paulo, Brazil because the API used to geolocate works off of IP addresses, and you're running from your local machine, but you can enter your own IP address in the backend's "view.py" file around line 30, or comment out the current one and uncomment one of the ones available.
