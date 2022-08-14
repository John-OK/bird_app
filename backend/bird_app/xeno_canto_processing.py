from . sphere_math import distance_on_unit_sphere as degree_to_km

def pole_correction(lat):
    if lat > 0:
        return lat % 90
    else:
        return lat % -90

def meridian_correction(long):
    if long > 0:
        return long % -180
    else:
        return long % 180

def calc_corners(lat, long, kms_in_1_deg_long, radius):
    # calculate degrees latitude to add/subtract from user's location
    KMS_IN_1_DEG_LAT = 111.31709969218723
    degs_per_km_lat = 1 / KMS_IN_1_DEG_LAT
    half_radius_lat_degs = (radius * degs_per_km_lat) / 2

    # calculate northern & southern limits around user location
    n_lat = lat + half_radius_lat_degs
    s_lat = lat - half_radius_lat_degs

    # correct for latitude calculations > 90 or < -90
    if n_lat > 90:
        n_lat = pole_correction(n_lat)
    if s_lat < -90:
        s_lat = pole_correction(s_lat)

    # calculate degrees longitude to add/subtract from user's location
    degs_per_km_long = 1 / kms_in_1_deg_long
    half_radius_long_degs = (radius * degs_per_km_long) / 2

    # calculate eastern & western limits around user location
    e_long = long + half_radius_long_degs
    w_long = long - half_radius_long_degs

    # correct for longitude calculations > 180 or < -180
    if e_long > 180:
        e_long = meridian_correction(e_long)
    if w_long < -180:
        w_long = meridian_correction(w_long)

    corner_coords = {
        'nw_corner': [n_lat, w_long],
        'ne_corner': [n_lat, e_long],
        'se_corner': [s_lat, e_long],
        'sw_corner': [s_lat, w_long],
        }

    return corner_coords

def get_perimeter_corner_coords(coords, radius=10):
    lat = coords[0]
    long1 = coords[1]
    long2 = None

    if long1 > -1 or long1 > 179:
        long2 = long1 - 1
    else:
        long2 = long1 + 1

    kms_in_1_deg_long = degree_to_km(lat, long1, lat, long2)
    if kms_in_1_deg_long < 0.1:
        kms_in_1_deg_long = 0.1
    print(f"@ {lat} latitude, 1 degree longitude = {kms_in_1_deg_long} kms")

    corner_coords = calc_corners(lat, long1, kms_in_1_deg_long, radius)
    return corner_coords


    # for record in data.continent:
    #     print(record['id']) 