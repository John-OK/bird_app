![Bird Confirm Banner](https://github.com/John-OK/bird_app/blob/master/github_assets/Eurasian_Sparrowhawk.jpg)
- - -
A webapp to help confirm bird identification (mobile app coming!)

![GitHub last commit](https://img.shields.io/github/last-commit/John-OK/bird_app?style=plastic) ![GitHub language count](https://img.shields.io/github/languages/count/John-OK/bird_app)

# Overview

Bird Confirm was designed to help novice and experienced birders confirm the identification of birds they see in the field. It displays a map of the user's location and shows whether the bird they think they have identified (and entered in the search field) has been seen within 100 km of them by plotting all sightings of that bird on the map. Further confirmation is provided by the ability to play the bird's call/song and offering links to images of the bird.

# Usage

## Simple confirmation that the bird occurs in the area
Enter a bird's common or scientific name. If that bird has been seen within 100 km of your location, then you will see all the locations that bird has been seen plotted on the map with an icon of a crane, and can be sure that the bird occurs near you.

## Further confirmation with bird call or song, and images
Click on one of the icons to display a popup with links to play the bird call or song and to take you to a search page showing you images of the bird species

## Show all species seen within 100 km of your location
Simply leave the search field blank and click "Check" to show all species seen within 100 km of your location. Click on each icon to see the name of the species and links to calls/songs and images.

[See demonstrations of three use cases of bird confirm](https://github.com/John-OK/bird_app/blob/master/DEMO.md)

# About this project
Bird Confirm started as a personal project for a 15-week full-stack coding intensive at [Code Platoon](https://www.codeplatoon.org/), an organization that serves veterans and military spouses by providing technical training and career placement.

I continue to develop it and will add more features, deploy it, and create Android and iOS versions.

## Bird Confirm uses the following technologies:
- Front end:
   - JavaScript
   - React
   - Vite

- Back end:
   - Python
   - Django
   - PostgreSQL

- APIs:
   - [Abstract (IP geoloactaion):](https://www.abstractapi.com/api/ip-geolocation-api)
   - [Xeno-Canto (vocalizations and locations of birds)](https://www.xeno-canto.org/api/2/recordings?query=cnt:brazil)
   - [Leaflet (interactive map functionality](https://leafletjs.com/)
   - [Thunder Forest (maps)](https://www.thunderforest.com/)

# Installation
Make sure you have Python 3.10.6+, PostgreSQL, npm, Node.js, React and Vite installed, then do the following:
1. Create a directory to contain entire project; CD to the directory
2. Clone the repository
```
git clone https://github.com/John-OK/bird_app.git
```
3. Create a virtual environment (".venv" in the example is the directory for the virtual environment)
```
python -m venv .venv
```
4. Source the virtual environemt
```
source .venv/bin/activate
```
5. Install requirements
```
pip install -r requirements.txt
```
6. CD to "backend" directory and start server with the following:
```
python manage.py runserver
```
7. Check the response in the terminal to find the address of the server (usually 127.0.0.1:8000)
8. Open a web browser and naviage to 127.0.0.1:8000 (or whatever address and port was given in the previous step)
9. Currently, the user's location is hard coded to Sao Paulo, Brazil because the API used to geolocate works off of IP addresses, and you're running from your local machine, but you can enter your own IP address in the backend's "view.py" file around line 30, or comment out the current one and uncomment one of the ones available.

# Future Features
- Web App
- List all birds in area
- Allow users to save birds confirmed

# Tech to experiment with later
- React Native for web app
- Java for web app

# What I would have done differently if I started over again
- Started with React Native to get a mobile app working as it is more useful than a web app when you're in the field
