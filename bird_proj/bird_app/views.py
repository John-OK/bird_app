from django.shortcuts import render
from django.http import HttpResponse, JsonResponse

def send_the_homepage(request):
    print('home')
    
    return HttpResponse("hello")
