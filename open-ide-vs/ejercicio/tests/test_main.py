from main import suma, es_palindromo, fibonacci


def test_suma():
    assert suma(2, 3) == 5
    assert suma(-1, 1) == 0


def test_palindromo():
    assert es_palindromo("ana") == True
    assert es_palindromo("hola") == False


def test_fibonacci():
    assert fibonacci(5) == [0, 1, 1, 2, 3]
    assert fibonacci(1) == [0]
