![Bird Confirm Banner](https://github.com/John-OK/bird_app/blob/master/European%20Sparrowhawk.jpg)
![GitHub last commit](https://img.shields.io/github/last-commit/John-OK/bird_app?style=plastic)
# Overview

Both experienced birders and non-birders come across birds that they think they have identified but would like to confirm. **Bird Confirm** can help! Users simply enter the bird's common or scientific name and **Bird Confirm** will show them a map with all the places that bird has been seen within 100 km of their location. It will also offer to play the bird's song/call (if available) for further confirmation. Links to images of that bird will also be provided to aid in confirmation. If a user has no idea of the bird's name, they can simply hit 'search' without entering a name and Bird Confirm will show all the birds that have been seen within 100 km of their location that they can click through.

## Current and future APIs

Any or multiple IP geolocation APIs:
* Abstract: https://www.abstractapi.com/api/ip-geolocation-api
* GoogleMaps: https://maps.googleapis.com/maps/api/geocode (for future implementaion)
* BigDataCloud: https://www.bigdatacloud.com/docs/ip-geolocation (for future implementaion)

Bird info APIs:
* Xeno-Canto (vocalizations and location) https://www.xeno-canto.org/api/2/recordings?query=cnt:brazil
* eBird (for future implementaion):
    * Species list for a region: https://api.ebird.org/v2/product/spplist/{{regionCode}}
    * Taxonomy codes: https://api.ebird.org/v2/ref/taxonomy/ebird
