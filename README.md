# Overview

Both experienced birders and non-birders come across birds that they think they have identified but would like to confirm. **Bird Confirm&trade;** can help! Users simply enter the bird's common name and **Bird Confrim&trade;** will tell them whether it is likely or unlikely to see that bird based on their location and time of year. ~~It will also show them one or more photographs of the bird (if available) that they can use to compare with the bird they see in the wild.~~ (still looking for an API for this)

## APIs

Any or multiple IP geolocation APIs:
* GoogleMaps: https://maps.googleapis.com/maps/api/geocode
* BidDataCloud: https://www.bigdatacloud.com/docs/ip-geolocation
* Abstract: https://www.abstractapi.com/api/ip-geolocation-api

Bird info APIs:
* eBird:
    * Region's species: https://api.ebird.org/v2/product/spplist/{{regionCode}}
    * Taxonomy codes: https://api.ebird.org/v2/ref/taxonomy/ebird
* Xeno-Canto: https://www.xeno-canto.org/api/2/recordings?query=cnt:brazil