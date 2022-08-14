# original code from https://www.johndcook.com/blog/python_longitude_latitude/

import math

def distance_on_unit_sphere(lat1, long1, lat2, long2, units='km'):
    EARTH_RADIUS_KM = 6378
    EARTH_RADIUS_MILES = 3963

    if units == 'km':
        unit = EARTH_RADIUS_KM
    else:
        unit = EARTH_RADIUS_MILES

    # Convert latitude and longitude to
    # spherical coordinates in radians.
    degrees_to_radians = math.pi/180.0

    # phi = 90 - latitude
    phi1 = (90.0 - lat1)*degrees_to_radians
    phi2 = (90.0 - lat2)*degrees_to_radians

    # theta = longitude
    theta1 = long1*degrees_to_radians
    theta2 = long2*degrees_to_radians

    # Compute spherical distance from spherical coordinates.

    # For two locations in spherical coordinates
    # (1, theta, phi) and (1, theta', phi')
    # cosine( arc length ) =
    # sin phi sin phi' cos(theta-theta') + cos phi cos phi'
    # distance = rho * arc length

    cos = (math.sin(phi1)*math.sin(phi2)*math.cos(theta1 - theta2) +
    math.cos(phi1)*math.cos(phi2))
    arc = math.acos( cos )

    # Remember to multiply arc by the radius of the earth
    # in your favorite set of units to get length.
    distance = arc * unit
    return distance

