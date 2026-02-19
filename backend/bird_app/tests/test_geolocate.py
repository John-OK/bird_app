import pytest
import json
from unittest.mock import patch, Mock
from django.test import RequestFactory
from django.core.cache import cache
from bird_app.views import geolocate


class TestGeolocate:
    """Tests for the geolocate endpoint with API fallback cascade."""

    @pytest.fixture
    def request_factory(self):
        """Create a RequestFactory for generating fake requests."""
        return RequestFactory()

    @pytest.fixture
    def mock_request(self, request_factory):
        """Create a mock GET request with a fake IP address."""
        request = request_factory.get("/geolocate/")

        request.META["HTTP_X_REAL_IP"] = "8.8.8.8"
        return request

    @pytest.fixture(autouse=True)
    def clear_cache(self):
        """Clear cache before each test to avoid interference."""
        cache.clear()
        yield
        cache.clear()

    @patch("bird_app.views.HTTP_Client.get")
    def test_primary_api_success_returns_coordinates(self, mock_http_get, mock_request):
        """
        Test that when IPLocate.io (primary API) succeeds,
        geolocate() returns normalized coordinates.
        """

        mock_response = Mock()
        mock_response.json.return_value = {
            "ip": "8.8.8.8",
            "latitude": 37.38605,
            "longitude": -122.08385,
            "postal_code": "94035",
            "city": "Mountain View",
            "country": "United States",
        }
        mock_http_get.return_value = mock_response

        response = geolocate(mock_request)

        assert response.status_code == 200
        response_data = json.loads(response.content)
        assert "coords" in response_data
        assert response_data["coords"] == [37.38605, -122.08385]

    @patch("bird_app.views.HTTP_Client.get")
    def test_fallback_to_ipgeolocation_when_primary_fails(
        self, mock_http_get, mock_request
    ):
        """
        Test that when IPLocate.io fails, we fall back to ipgeolocation.io
        and return normalized coordinates.
        """

        ipgeolocation_response = Mock()
        ipgeolocation_response.json.return_value = {
            "ip": "8.8.8.8",
            "latitude": "37.38605",
            "longitude": "-122.08385",
            "zipcode": "94035",
            "city": "Mountain View",
            "country_name": "United States",
        }

        mock_http_get.side_effect = [
            Exception("IPLocate.io connection failed"),
            ipgeolocation_response,
        ]

        response = geolocate(mock_request)

        assert response.status_code == 200
        response_data = json.loads(response.content)
        assert "coords" in response_data
        assert response_data["coords"] == [37.38605, -122.08385]
        assert mock_http_get.call_count == 2

    @patch("bird_app.views.HTTP_Client.get")
    def test_fallback_to_abstract_when_first_two_fail(
        self, mock_http_get, mock_request
    ):
        """
        Test that when IPLocate.io and ipgeolocation.io both fail,
        we fall back to Abstract API and return normalized coordinates.
        """

        abstract_response = Mock()
        abstract_response.json.return_value = {
            "ip": "8.8.8.8",
            "location": {"latitude": 37.38605, "longitude": -122.08385},
            "city": "Mountain View",
            "postal_code": "94035",
            "country": "United States",
        }

        mock_http_get.side_effect = [
            Exception("IPLocate.io connection failed"),
            Exception("ipgeolocation.io connection failed"),
            abstract_response,
        ]

        response = geolocate(mock_request)

        assert response.status_code == 200
        response_data = json.loads(response.content)
        assert "coords" in response_data
        assert response_data["coords"] == [37.38605, -122.08385]
        assert mock_http_get.call_count == 3

    @patch("bird_app.views.HTTP_Client.get")
    def test_all_apis_fail_returns_error(self, mock_http_get, mock_request):
        """
        Test that when all three APIs fail,
        we return HTTP 500 with error message.
        """
        mock_http_get.side_effect = [
            Exception("IPLocate.io connection failed"),
            Exception("ipgeolocation.io connection failed"),
            Exception("Abstract API connection failed"),
        ]

        response = geolocate(mock_request)

        assert response.status_code == 500
        response_data = json.loads(response.content)
        assert "error" in response_data
        assert "Unable to determine location" in response_data["error"]
        assert mock_http_get.call_count == 3

    @patch("bird_app.views.HTTP_Client.get")
    def test_rate_limiting_blocks_excessive_requests(self, mock_http_get, mock_request):
        """
        Test that rate limiting blocks requests after 20 requests per minute per IP.
        """
        mock_response = Mock()
        mock_response.json.return_value = {
            "latitude": 37.38605,
            "longitude": -122.08385,
        }
        mock_http_get.return_value = mock_response

        for i in range(20):
            response = geolocate(mock_request)
            assert response.status_code == 200, f"Request {i+1} should succeed"

        response = geolocate(mock_request)
        assert response.status_code == 429
        response_data = json.loads(response.content)
        assert "error" in response_data
        assert "rate limit" in response_data["error"].lower()
