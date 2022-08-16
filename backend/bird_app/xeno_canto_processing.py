import requests as HTTP_Client
from django.http import JsonResponse
from . sphere_math import distance_on_unit_sphere as degree_to_km
import json
import pprint

BASE_ENDPOINT_XC = f"https://www.xeno-canto.org/api/2/recordings?query="

pp = pprint.PrettyPrinter(indent=2, depth=4)

# Correct for edge cases where meridian > 180 or < -180
def meridian_correction(long):
    if long > 0:
        return long % -180
    else:
        return long % 180

# Calculate latitude and longitude limits around user's coordinates
def calc_coord_limits(lat, long, kms_per_deg_long, radius):
    # calculate degrees latitude to add/subtract from user's location
    KMS_PER_DEG_LAT = 111.31709969218723
    degs_per_km_lat = 1 / KMS_PER_DEG_LAT
    radius_lat_degs = radius * degs_per_km_lat

    # calculate northern & southern limits around user location
    n_lat = lat + radius_lat_degs
    s_lat = lat - radius_lat_degs

    # correct for latitude calculations > 90 or < -90
    if n_lat > 90:
        n_lat = 90
    if s_lat < -90:
        s_lat = -90

    # calculate degrees longitude to add/subtract from user's location
    degs_per_km_long = 1 / kms_per_deg_long
    radius_long_degs = radius * degs_per_km_long

    # calculate eastern & western limits around user location
    e_long = long + radius_long_degs
    w_long = long - radius_long_degs

    # correct for longitude calculations > 180 or < -180
    if e_long > 180:
        e_long = meridian_correction(e_long)
    if w_long < -180:
        w_long = meridian_correction(w_long)

    # for future use to draw radius on map
    corner_coords = {
        'nw_corner': [n_lat, w_long],
        'ne_corner': [n_lat, e_long],
        'se_corner': [s_lat, e_long],
        'sw_corner': [s_lat, w_long],
        }
    
    min_max_lat_long = {
        'min_lat': min(n_lat, s_lat),
        'max_lat': max(n_lat, s_lat,),
        'min_long': min(e_long, w_long),
        'max_long': max(e_long, w_long),
    }
    return min_max_lat_long

def get_radius_limits(coords, radius=100):
    lat = coords[0]
    long1 = coords[1]
    long2 = None

    # Account for edge cases where adding 1 to longitude > 180 degrees
    if long1 > 179:
        long2 = long1 - 1
    else:
        long2 = long1 + 1

    # Number of kms in 1 degree of longitude at user's latitude
    kms_per_deg_long = degree_to_km(lat, long1, lat, long2)

    # Avoid divide by zero errors when user at 90 degrees latitude (0 km/deg)
    if kms_per_deg_long < 0.02:
        kms_per_deg_long = 0.02
    print(f"@ {lat} latitude, 1 degree longitude = {kms_per_deg_long} kms")

    radius_limits = calc_coord_limits(lat, long1, kms_per_deg_long, radius)
    return radius_limits

# Can filter through API. Keep this code to use if API filtering is poor
# # Filter for birds within set radius (default 100 kms) of user
# def get_birds_within_radius(user_coords, records):
#     radius_limits = get_radius_limits(user_coords)
#     min_lat = radius_limits['min_lat']
#     max_lat = radius_limits['max_lat']
#     min_long = radius_limits['min_long']
#     max_long = radius_limits['max_long']

#     birds_in_radius = []

#     # pp.pprint(records)
#     for record in records:
#         # if record's lat and lng are not null, check if bird within radius
#         if record['lat'] and record['lng'] and (
#             float(record['lat']) >= min_lat
#             and float(record['lat']) <= max_lat
#             and float(record['lng']) >= min_long
#             and float(record['lng']) <= max_long
#             ):
#             birds_in_radius.append([record['lat'], record['lng']])
#     return birds_in_radius


# Filter birds
def filter_bird_data(data, user_coords):
    records = data['recordings']

    ## Unnecessary if using API's box filtering
    # birds_in_radius = get_birds_within_radius(user_coords, records)
    # print(f"birds in radius: {birds_in_radius}")

    return {'filtered_birds': records}

def get_bird_data(request, user_coords, bird_name):
    # Get limits of radius around user
    radius_limits = get_radius_limits(user_coords)
    print(f"radius limits: {radius_limits}")

    # Write box query string conforming to xeno-canto's requirements
    min_lat = radius_limits['min_lat']
    max_lat = radius_limits['max_lat']
    min_long = radius_limits['min_long']
    max_long = radius_limits['max_long']
    box_around_user = f"box:{min_lat},{min_long},{max_lat},{max_long}"
    print(f"box string: {box_around_user}")

    # Build up endpoint
    if bird_name == "NONE":
        bird_name = ""
    endpoint = f"{BASE_ENDPOINT_XC}{bird_name}"
    print(f"endpoint1: {endpoint}")
    endpoint = f"{endpoint}+{box_around_user}"
    print(f"endpoint2: {endpoint}")

    API_response = HTTP_Client.get(endpoint)
    responseJSON = API_response.json()
    # pp.pprint(responseJSON)

    # species = responseJSON['recordings'][0]['sp']
    # common_name = responseJSON['recordings'][0]['en']
    num_recordings = responseJSON['numRecordings']
    num_species = responseJSON['numSpecies']
    print(f"request returned {num_recordings} recordings of {num_species} different species")

    # save data for future use
    with open(f'bird_data_{bird_name}.json', 'w') as f:
        json.dump(responseJSON, f, indent=2)
        print('file saved')

    filtered_data = filter_bird_data(responseJSON, user_coords)
    return {'filtered_data': filtered_data}