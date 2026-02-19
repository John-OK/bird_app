from django.http import HttpResponse, JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.core import serializers
from django.core.cache import cache
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt
from .models import User, Bird
import requests as HTTP_Client
import pprint
import json
from .xeno_canto_processing import get_bird_data
import os
from dotenv import load_dotenv

# Default coordinates for legacy find_birds GET endpoint
# TODO: Refactor find_birds() to require coords parameter
DEFAULT_COORDS = [37.16, -4.15]

load_dotenv()

pp = pprint.PrettyPrinter(indent=2, depth=4)


def get_ip(request):
    try:
        x_real_ip = request.META.get("HTTP_X_REAL_IP")
        if x_real_ip:
            ip = x_real_ip
            print("HTTP_X_REAL_IP:", ip)
        else:
            x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
            pp.pprint(x_forwarded_for)
            if x_forwarded_for:
                ip = x_forwarded_for.split(",")[-1].strip()
                print("HTTP_X_FORWARDED_FOR:", ip)
            else:
                ip = request.META.get("REMOTE_ADDR")
                print("REMOTE_ADDR:", ip)
    except:
        ip = ""
        print("get_ip() failed")
    return ip


def try_iplocate(ip):
    """
    Try to get coordinates from IPLocate.io API.
    Returns (latitude, longitude) tuple.
    Raises exception on failure.
    """
    endpoint = f"https://www.iplocate.io/api/lookup/{ip}?apikey={os.environ['IPLOCATE_API_KEY']}"
    response = HTTP_Client.get(endpoint)
    data = response.json()

    lat = data["latitude"]
    lng = data["longitude"]

    if lat is None or lng is None:
        raise ValueError("IPLocate.io returned null coordinates")

    return (float(lat), float(lng))


def try_ipgeolocation(ip):
    """
    Try to get coordinates from ipgeolocation.io API.
    Returns (latitude, longitude) tuple.
    Raises exception on failure.
    """
    endpoint = f"https://api.ipgeolocation.io/ipgeo?apiKey={os.environ['IPGEOLOCATION_API_KEY']}&ip={ip}"

    response = HTTP_Client.get(endpoint)
    data = response.json()

    lat = data["latitude"]
    lng = data["longitude"]

    if lat is None or lng is None:
        raise ValueError("ipgeolocation.io returned null coordinates")

    return (float(lat), float(lng))


def try_abstract(ip):
    """
    Try to get coordinates from Abstract API.
    Returns (latitude, longitude) tuple.
    Raises exception on failure.
    """
    endpoint = f"https://ip-intelligence.abstractapi.com/v1/?api_key={os.environ['ABSTRACT_API_KEY']}&ip_address={ip}"
    response = HTTP_Client.get(endpoint)
    data = response.json()

    lat = data["location"]["latitude"]
    lng = data["location"]["longitude"]

    if lat is None or lng is None:
        raise ValueError("Abstract API returned null coordinates")

    return (float(lat), float(lng))


def geolocate(request):
    """
    Get user's geolocation from IP address with fallback cascade.
    Tries IPLocate.io -> ipgeolocation.io -> Abstract API.
    Rate limited to 20 requests per minute per IP.
    """
    if os.environ["env"] == "prod":
        ip = get_ip(request)
    else:
        # ip addresses for testing during development:
        # ip = "92.119.141.215" # TM Granada
        # ip = "208.185.59.34" # WeWork Chicago
        # ip = "104.223.92.190" # Windscribe Atlanta Mountain
        # ip = "206.217.143.141" # Windscribe Atlanta Piedmont
        # ip = "23.19.122.235" # Windscribe Chicago Wrigley
        ip = "185.253.99.155"  # Windscribe Barcelona Batllo
        # ip = "66.203.113.138" # Windscribe Santiago, Chile
        # ip = "177.54.148.247" # Windscribe SP, Brasil (Pinacoteca)
        # ip = "177.67.80.59" # Windscribe SP, Brasil (Mercadao)

    cache_key = f"geolocation_ratelimit_{ip}"
    request_count = cache.get(cache_key, 0)

    if request_count >= 20:
        return JsonResponse(
            {"error": "Rate limit exceeded. Please try again later."}, status=429
        )

    cache.set(cache_key, request_count + 1, timeout=600)

    lat = None
    lng = None

    # Try IPLocate.io (primary)
    try:
        lat, lng = try_iplocate(ip)
        print(f"✓ IPLocate.io succeeded: {lat}, {lng}")
    except Exception as e:
        print(f"✗ IPLocate.io failed: {e}")

        # Try ipgeolocation.io (fallback 1)
        try:
            lat, lng = try_ipgeolocation(ip)
            print(f"✓ ipgeolocation.io succeeded: {lat}, {lng}")
        except Exception as e:
            print(f"✗ ipgeolocation.io failed: {e}")

            # Try Abstract API (fallback 2)
            try:
                lat, lng = try_abstract(ip)
                print(f"✓ Abstract API succeeded: {lat}, {lng}")
            except Exception as e:
                print(f"✗ Abstract API failed: {e}")

                return JsonResponse(
                    {"error": "Unable to determine location from IP address"},
                    status=500,
                )

    return JsonResponse({"coords": [lat, lng]})


def send_the_homepage(request):
    print("home")
    # geolocation_data = geolocate(request)
    theIndex = open("static/index.html").read()
    return HttpResponse(theIndex)


@api_view(["POST"])
def sign_up(request):
    try:
        User.objects.create_user(
            username=request.data["email"],
            password=request.data["password"],
            email=request.data["email"],
        )
    except Exception as e:
        print("error")
        print(str(e))
        return HttpResponse(e)
    return HttpResponse("Sign Up successful")


# Use POST for logins because GET will show username and password in URL
@api_view(["POST"])
def log_in(request):
    # print(request.data)

    # DRF assumes that the body is JSON, and automatically parses it into a dictionary when accessing request.data
    email = request.data["email"]
    password = request.data["password"]
    user = authenticate(username=email, password=password)
    # print('user?')
    # print(user.is_active)
    # print(user.username)
    # print(user.password)
    if user is not None:
        if user.is_active:
            try:
                # access the base request (request._request), not the DRF request
                # this starts a login session for this user
                login(request._request, user)
            except Exception as e:
                print("except")
                print(str(e))
            return HttpResponse("log in successful")
            # Redirect to a success page.
        else:
            return HttpResponse("not active!")
            # Return a 'disabled account' error message
    else:
        return HttpResponse("no user!")
        # Return an 'invalid login' error message.


@api_view(["POST"])
def log_out(request):
    logout(request)
    return JsonResponse({"success": True})
    # Redirect to a "logged out" page, or homepage with a "logged out" popup


@api_view(["GET"])
def who_am_i(request):
    # Make sure that you don't send sensitive information to the client, such as password hashes
    # raise Exception('oops')
    if request.user.is_authenticated:
        data = serializers.serialize(
            "json", [request.user], fields=["email", "username"]
        )

        return HttpResponse(data)
    else:
        return JsonResponse({"user": None})


# def find_birds(request, bird_name):
#     print(f"received request to get data on '{bird_name}' from xeno-canto")
#     endpoint = f"https://www.xeno-canto.org/api/2/recordings?query={bird_name}"
#     API_response = HTTP_Client.get(endpoint)
#     responseJSON = API_response.json()
#     # pp.pprint(responseJSON)
#     # species = responseJSON['recordings'][0]['sp']
#     # common_name = responseJSON['recordings'][0]['en']
#     num_recordings = responseJSON['numRecordings']
#     num_species = responseJSON['numSpecies']
#     print(f"request returned {num_recordings} recordings of {num_species} different species")

#     # save data for future use
#     with open(f'bird_data_{bird_name}.json', 'w') as f:
#         json.dump(responseJSON, f, indent=2)
#         print('file saved')

#     filtered_data = filter_bird_data(responseJSON, user_coords)
#     return JsonResponse(filtered_data)


def find_birds(request, bird_name):
    print(f"received request to get data on '{bird_name}' from xeno-canto.")
    print(f"user_coords: {DEFAULT_COORDS}")

    # call to get_bird_data in xeno_canto_processing module
    filtered_data = get_bird_data(request, DEFAULT_COORDS, bird_name)
    return JsonResponse(filtered_data)


@api_view(["POST"])
def find_birds_post(request):
    search_type = request.data.get("search_type")
    term = request.data.get("term", "")
    coords = request.data.get("coords")
    if coords is None:
        return JsonResponse(
            {
                "error": {
                    "code": "missing_parameter",
                    "message": "coords is required",
                }
            },
            status=400,
        )
    elif (
        not isinstance(coords, list)
        or len(coords) != 2
        or not isinstance(coords[0], (int, float))
        or not isinstance(coords[1], (int, float))
    ):
        return JsonResponse(
            {
                "error": {
                    "code": "invalid_coords",
                    "message": "coords must be a list of two numbers [lat, lng]",
                }
            },
            status=400,
        )
    else:
        validated_coords = coords

    if not search_type:
        return JsonResponse(
            {
                "error": {
                    "code": "missing_parameter",
                    "message": "search_type is required",
                }
            },
            status=400,
        )

    print(
        f"received POST request to find birds. search_type={search_type} term='{term}'"
    )
    print(f"validated_coords: {validated_coords}")

    filtered_data = get_bird_data(
        request, validated_coords, term or "ALL", search_type=search_type
    )
    return JsonResponse(filtered_data)


@api_view(["POST"])
def confirm_bird(request):
    print("saving bird to database")
    try:
        new_bird = Bird(
            user=request.user,
            bird_name=request.data["bird_name"],
            user_lat=request.data["user_lat"],
            user_lng=request.data["user_lng"],
            data=request.data["data"],
        )
        new_bird.save()
    except:
        return JsonResponse({"message": "Problems saving data."})
        # return JsonResponse(response)
    return JsonResponse({"message": "All good."})


@api_view(["GET"])
def get_users_birds(request):
    print("retrieving user's birds...")
    try:
        birds = Bird.objects.filter(user=request.user)

        bird_list = []

        for bird in birds:
            bird_dict = {}
            bird_dict["id"] = bird.id
            bird_dict["name"] = bird.bird_name

            # 'user_lat' and user_lng' from DB do not parse to json, so convert to str()
            bird_dict["coords"] = [f"{bird.user_lat:.4f}", f"{bird.user_lng:.4f}"]

            # datetime type below ('date_confirmed' field from DB) does not parse to json,
            # so must format as string first; thus, .strftime() used below
            bird_dict["date"] = bird.date_confirmed.strftime("%A, %d %B, %Y %I:%M%p")

            # FOR FUTURE USE: return Xeno-Canto data used to confirm bird
            # NOTE: probably need to convert to a string
            # bird_dict['data'] = bird.data

            bird_list.append(bird_dict)
        pp.pprint(bird_list)
        print(bird_list[0]["date"])
        print(type(bird_list[0]["date"]))
        print(str(bird_list[0]["coords"]))
        print(type(bird_list))
        response = {"birds": bird_list}
    except:
        return JsonResponse(({"message": "FAILED"}))
    return JsonResponse(response)


def delete_birds(request):
    print("deleting user's birds...")
    try:
        birds = Bird.objects.filter(user=request.user)
        birds.delete()
    except:
        return JsonResponse({"message": "FAILED"})
    return JsonResponse({"message": "BIRDS DELETED"})
