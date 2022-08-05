from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.core import serializers
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt
from . models import User
import requests as HTTP_Client
import pprint

pp = pprint.PrettyPrinter(indent=2, depth=4)

def send_the_homepage(request):
    print('home')
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
    return HttpResponse('hi')

@api_view(['POST'])
def log_in(request):
    print(dir(request))
    print(dir(request._request))

    # DRF assumes that the body is JSON, and automatically parses it into a dictionary at request.data
    email = request.data['email']
    password = request.data['password']
    # user = authenticate(username=email, password=password, email=email)
    user = authenticate(username=email, password=password)
    print('user?')
    print(user.email)
    print(user.password)
    if user is not None:
        if user.is_active:
            try:
                # access the base request, not the DRF request
                # this starts a login session for this user
                login(request._request, user)
            except Exception as e:
                print('except')
                print(str(e))
            return HttpResponse('success!')
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

def xeno_canto_api(request):
    print('received request for xeno-canto data')

    endpoint = "https://www.xeno-canto.org/api/2/recordings?query=Violet Wood Hoopoe"
    API_response = HTTP_Client.get(endpoint)
    responseJSON = API_response.json()
    # pp.pprint(responseJSON)
    pp.pprint(responseJSON['recordings'][0]['sp'])
    species = responseJSON['recordings'][0]['sp']

    response = render(request, 'bird_app/search.html', {'species': species})
    return response
