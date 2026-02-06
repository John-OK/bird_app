from rest_framework.test import APIClient
from bird_app import views


def test_find_birds_post_uses_request_coords_when_provided(monkeypatch):
    client = APIClient()
    expected_coords = [10.0, 20.0]
    called = {}

    def stub_get_bird_data(request, user_coords, bird_name, search_type=None):
        called["user_coords"] = user_coords
        return {"ok": True}

    monkeypatch.setattr(views, "get_bird_data", stub_get_bird_data)

    response = client.post(
        "/find_birds/",
        {
            "coords": expected_coords,
            "term": "Cooper's Hawk",
            "search_type": "common",
        },
        format="json",
    )

    assert response.status_code == 200
    assert called["user_coords"] == expected_coords


def test_find_birds_post_uses_views_global_user_coords_when_not_provided(monkeypatch):
    client = APIClient()
    expected_coords = views.user_coords
    called = {}

    def stub_get_bird_data(request, user_coords, bird_name, search_type=None):
        called["user_coords"] = user_coords
        return {"ok": True}

    monkeypatch.setattr(views, "get_bird_data", stub_get_bird_data)

    response = client.post(
        "/find_birds/",
        {
            "term": "Cooper's Hawk",
            "search_type": "common",
        },
        format="json",
    )

    assert response.status_code == 200
    assert called["user_coords"] == expected_coords


def test_find_birds_post_returns_400_when_coords_is_empty_list():
    client = APIClient()

    response = client.post(
        "/find_birds/",
        {
            "coords": [],
            "term": "Cooper's Hawk",
            "search_type": "common",
        },
        format="json",
    )

    assert response.status_code == 400
    assert "error" in response.json()


def test_find_birds_post_returns_400_when_coords_wrong_length():
    client = APIClient()

    response = client.post(
        "/find_birds/",
        {
            "coords": [10.0],
            "term": "Cooper's Hawk",
            "search_type": "common",
        },
        format="json",
    )

    assert response.status_code == 400
    assert "error" in response.json()


def test_find_birds_post_returns_400_when_coords_wrong_type():
    client = APIClient()

    response = client.post(
        "/find_birds/",
        {
            "coords": ["x", "y"],
            "term": "Cooper's Hawk",
            "search_type": "common",
        },
        format="json",
    )

    assert response.status_code == 400
    assert "error" in response.json()


def test_find_birds_post_returns_400_when_coords_not_a_list():
    client = APIClient()

    response = client.post(
        "/find_birds/",
        {
            "coords": "10.0, 20.0",
            "term": "Cooper's Hawk",
            "search_type": "common",
        },
        format="json",
    )

    assert response.status_code == 400
    assert "error" in response.json()
