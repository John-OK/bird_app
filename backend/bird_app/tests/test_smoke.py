from django.contrib.auth import get_user_model


def test_smoke():
    assert True


def test_db_smoke(db):
    User = get_user_model()
    assert User.objects.count() == 0
