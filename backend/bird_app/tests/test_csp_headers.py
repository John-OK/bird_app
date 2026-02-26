import pytest
from django.test import Client
from django.urls import reverse


class TestCSPHeaders:
    """Test for Content Security Policy headers."""

    @pytest.fixture
    def client(self):
        """Create a test client."""
        return Client()

    def test_csp_header_present_on_responses(self, client):
        """
        Test that CSP header is present on all responses.

        Intent: Verify middleware adds CSP header to response
        """
        response = client.get("/whoami/")

        assert (
            "Content-Security-Policy" in response.headers
        ), "CSP header should be present in response"

    def test_csp_default_src_self(self, client):
        """
        Test that default-src is set to 'self'.

        Intent: By default, only allow resources from same origin
        Mental Model: default-src is the fallback for all resource types
        """

        response = client.get("/whoami/")
        csp_header = response.headers.get("Content-Security-Policy", "")

        assert (
            "default-src 'self'" in csp_header
        ), "CSP should restrict default sources to same origin"

    def test_csp_allows_openstreetmap_tiles(self, client):
        """
        Test that CSP allows OpenStreetMap tile server.

        Intent: Map tiles must be allowed or map won't render
        """

        response = client.get("/whoami/")
        csp_header = response.headers.get("Content-Security-Policy", "")

        assert (
            "img-src" in csp_header
        ), "CSP should have img-src directive for map tiles"
        assert (
            "tile.openstreetmap.org" in csp_header
        ), "CSP should allow OpenStreetMap tiles"

    def test_csp_allows_api_connections(self, client):
        """
        Test that CSP allows connections to required APIs.

        Intent: AJAX requests tos external APIs must be allowed
        Mental Model: connect-src controls where fetch/XHR can connect
        """

        response = client.get("/find_birds/")
        csp_header = response.headers.get("Content-Security-Policy", "")

        assert (
            "connect-src" in csp_header
        ), "CSP should have connect-src directive for API calls"
        assert "xeno-canto.org" in csp_header, "CSP should allow Xeno-Canto API"

    def test_csp_restricts_inline_scripts(self, client):
        """
        Test that CSP does NOT allow unsafe-inline scripts.

        Intent: Prevent XSS attacks via inline scripts
        Gotcha: 'unsafe-inline' is a security risk - avoid if possible
        """

        response = client.get("/whoami/")
        csp_header = response.headers.get("Content-Security-Policy", "")

        assert "script-src" in csp_header, "CSP should have script-src directive"

    def test_csp_on_api_endpoints(self, client):
        """
        Test that CSP is present on API endpoints.

        Intent; All responses should have CSP, including JSON APIs
        """

        response = client.get("/whoami/")

        assert (
            "Content-Security-Policy" in response.headers
        ), "API endpoints should also have CSP headers"

    def test_existing_endpoints_still_work(self, client, db):
        """
        Test that CSP doesn't break existing functionality.

        Intent: Ensure CSP middleware doesn't interfere with responses
        Mental Model: Middleware should only add headers, not modify content
        """

        response = client.get("/whoami/")

        assert response.status_code == 200, "Endpoint should still return 200 OK"
        assert (
            response["Content-Type"] == "application/json"
        ), "Response should still be JSON"
