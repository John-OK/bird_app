class CSPMiddleware:
    """
    Middleware to add Content Security Protocol headers to all responses.

    CSP helps prevent XSS attacks by controlling which resources
    the browser is allowed to load.
    """

    def __init__(self, get_response):
        """
        One-time configuration when Django starts.

        Args:
            get_response: The next middleware or view in the chain
        """
        self.get_response = get_response

    def __call__(self, request):
        """
        Called on every request.

        Args:
            request: The HTTP request object

        Returns:
            response: The HTTP response with CSP header added
        """
        response = self.get_response(request)

        csp_policy = self._build_csp_policy()

        response["Content-Security-Policy"] = csp_policy

        return response

    def _build_csp_policy(self):
        """
        Build the CSP policy string.

        Returns:
            str: CSP policy with all directives
        """
        directives = {
            "default-src": ["'self'"],
            # Note: May need 'unsafe-inline' for React dev mode
            "script-src": ["'self'"],
            "style-src": ["'self'"],
            "img-src": [
                "'self'",
                "https://tile.openstreetmap.org",
                "https://*.tile.thunderforest.com",
                "data",
            ],
            "connect-src": [
                "'self'",
                "https://xeno-canto.org",
                "https://www.iplocate.io",
                "https://api.ipgeolocation.io",
                "https://ip-intelligence.abstractapi.com",
            ],
            "font-src": ["'self'"],
            "frame-src": ["'none"],
            "object-src": ["'none'"],
            "base-uri": ["'self'"],
            "form-action": ["'self'"],
            "report-uri": ["/csp-violation-report/"],
        }

        policy_parts = []
        for directive, sources in directives.items():
            sources_str = " ".join(sources)
            policy_parts.append(f"{directive} {sources_str}")

        return "; ".join(policy_parts)
