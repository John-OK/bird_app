import json
import logging
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

logger = logging.getLogger(__name__)


@csrf_exempt
@require_http_methods(["POST"])
def csp_violation_report(request):
    """
    Endpoint to receive CSP violation reports from browsers.

    When a browser blocks a resource due to CSP policy, it sends
    a JSON report to this endpoint for logging and monitoring.

    CSP Report Format:
    {
        "csp-report": {
            "document-uri": "http://example.com/page",
            "violated-directive": "script-src 'self'",
            "blocked-uri": "http://evilcom/malicious.js",
            "original-policy": "default-src 'self'; ..."
        }
    }
    """
    try:
        # Parse the CSP report
        report_data = json.loads(request.body)
        csp_report = report_data.get("csp-report", {})

        # Log the violation
        logger.warning(
            "CSP Violation detected",
            extra={
                "document_uri": csp_report.get("document-uri"),
                "violated_directive": csp_report.get("violated-directive"),
                "blocked-uri": csp_report.get("blocked-uri"),
                "source_file": csp_report.get("source-file"),
                "line_number": csp_report.get("line-number"),
            },
        )

        # Return 204 No Content (standard for CSP reports)
        return JsonResponse({}, status=204)

    except json.JSONDecodeError:
        logger.error("Invalid JSON in CSP report")
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        logger.error(f"Error processing CSP report: {e}")
        return JsonResponse({"error": "Server error"}, status=500)
