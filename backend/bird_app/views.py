from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.core import serializers
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt
from . models import User
import requests as HTTP_Client
import pprint
import json
from . xeno_canto_processing import get_bird_data
import datetime

pp = pprint.PrettyPrinter(indent=2, depth=4)

def get_ip(request):
    try:
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
    except:
        ip = ''
    return ip

user_coords = [39.240, -5.740]

def geolocate(request):
    # ip = "208.185.59.34" # WeWork Chicago
    # ip = "23.19.122.235" # Windscribe Chicago Wrigley
    # ip = "185.253.99.155" # Windscribe Barcelona Batllo
    # ip = "66.203.113.138" # Windscribe Santiago, Chile
    # ip = "177.54.148.247" # Windscribe SP, Brasil (Pinacoteca)
    ip = "177.67.80.59" # Windscribe SP, Brasil (Mercadao)
    # ip = get_ip(request)
    print(f'*****************  IP ADDRESS FOR GEOLOCATE: {ip}')

    endpoint = f"https://ipgeolocation.abstractapi.com/v1/?api_key=631f880632664f8d9641d5dedeec4e13&ip_address={ip}"
        # print(f'endpoint: {endpoint}')

    API_response = HTTP_Client.get(endpoint)
    responseJSON = API_response.json()
    status_code = API_response.status_code

    # content = API_response.content
    lat = responseJSON['latitude']
    user_coords[0] = lat
    lng = responseJSON['longitude']
    user_coords[1] = lng
    # print(f'GEO STATUS: {status_code}')
    # print(f'GEO CONTENT: ')
    # print(f'GEO CONTENT: {responseJSON}')
    # pp.pprint(responseJSON)

    with open(f'geolocation_data.json', 'w') as f:
        json.dump(responseJSON, f, indent=2)
        print('file saved')    

    return JsonResponse({'coords': user_coords})


def send_the_homepage(request):
    print('home')
    # geolocation_data = geolocate(request)
    theIndex = open('static/index.html').read()
    return HttpResponse(theIndex)

@api_view(['POST'])
def sign_up(request):
    try:
        User.objects.create_user(
            username=request.data['email'],
            password=request.data['password'],
            email=request.data['email']
        )
    except Exception as e:
        print("error")
        print(str(e))
        return HttpResponse(e)
    return HttpResponse('hi')

@api_view(['POST'])
def log_in(request):
    # print(request.data)

    # DRF assumes that the body is JSON, and automatically parses it into a dictionary when accessing request.data
    email = request.data['email']
    password = request.data['password']
    # user = authenticate(username=email, password=password, email=email)
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
                print('except')
                print(str(e))
            return HttpResponse('log in successful')
            # Redirect to a success page.
        else:
            return HttpResponse('not active!')
            # Return a 'disabled account' error message
    else:
        return HttpResponse('no user!')
        # Return an 'invalid login' error message.

@api_view(['POST'])
def log_out(request):
    logout(request)
    return JsonResponse({'success':True})

@api_view(['GET'])
def who_am_i(request):
    # Make sure that you don't send sensitive information to the client, such as password hashes
    # raise Exception('oops')
    if request.user.is_authenticated:
        data = serializers.serialize("json", [request.user], fields=['email', 'username'])

        return HttpResponse(data)
    else:
        return JsonResponse({'user':None})

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
    print(f"received request to get data on '{bird_name}' from xeno-canto") 

    filtered_data = get_bird_data(request, user_coords, bird_name)
    return JsonResponse(filtered_data)

@api_view(['POST'])
def confirm_bird(request):
    print('saving bird... beepboobeep')
    body = json.loads(request.body)
    print(f"request.body: {request.body}")
    new_bird = Bird(date = datetime.datetime.now(), data = body['data'])
    try:
        new_bird.full_clean()
    except:
        return JsonResponse({'message': 'Problems saving data.'})
    else:
        new_bird.save()
    return JsonResponse({})
    return JsonResponse(response)