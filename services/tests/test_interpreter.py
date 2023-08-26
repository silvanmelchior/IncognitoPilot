from pathlib import Path

from services.interpreter import IPythonInterpreter


def test_print():
    interpreter = IPythonInterpreter()
    result = interpreter.run_cell("print('Hello World')")
    assert result == "Hello World\n"


def test_empty():
    interpreter = IPythonInterpreter()
    result = interpreter.run_cell("a = 3")
    assert result == ""


def test_multiline():
    interpreter = IPythonInterpreter()
    result = interpreter.run_cell("print('line 1')\nprint('line 2')\n")
    assert result == "line 1\nline 2\n"


def test_statement():
    interpreter = IPythonInterpreter()
    result = interpreter.run_cell("1")
    assert result == "1\n"


def test_multi_statement():
    interpreter = IPythonInterpreter()
    result = interpreter.run_cell("1\n2")
    assert result == "2\n"


def test_script():
    interpreter = IPythonInterpreter()
    result = interpreter.run_cell("for i in range(5):\n    print(i)\n")
    assert result == "0\n1\n2\n3\n4\n"


def test_import():
    interpreter = IPythonInterpreter()
    result = interpreter.run_cell("from fastapi import FastAPI\nFastAPI()")
    assert "FastAPI object" in result


def test_deactivate():
    interpreter = IPythonInterpreter()
    result = interpreter.run_cell("import os\nos.environ['VIRTUAL_ENV']")
    assert "KeyError" not in result

    interpreter = IPythonInterpreter(deactivate_venv=True)
    result = interpreter.run_cell("import os\nos.environ['VIRTUAL_ENV']")
    assert "KeyError" in result


def test_session():
    interpreter = IPythonInterpreter()
    interpreter.run_cell("a = 1")
    result = interpreter.run_cell("print(a)\n")
    assert result == "1\n"

    interpreter = IPythonInterpreter()
    result = interpreter.run_cell("print(a)\n")
    assert "NameError" in result


def test_timeout():
    interpreter = IPythonInterpreter(timeout=1)
    result = interpreter.run_cell("import time\ntime.sleep(2)\n")
    assert result is None


def test_timeout_output():
    interpreter = IPythonInterpreter(timeout=1)
    result = interpreter.run_cell(
        "import time\nfor i in range(30):\n" "    print(i)\n    time.sleep(0.1)\n"
    )
    assert result is None


def test_timeout_reset():
    interpreter = IPythonInterpreter(timeout=1)
    interpreter.run_cell("a = 1")
    result = interpreter.run_cell("print(a)\n")
    assert result == "1\n"

    result = interpreter.run_cell("import time\ntime.sleep(2)\n")
    assert result is None

    result = interpreter.run_cell("print(a)\n")
    assert "NameError" in result


def test_working_dir(tmpdir):
    interpreter = IPythonInterpreter(working_dir=Path(tmpdir))
    result = interpreter.run_cell("import os\nprint(os.getcwd())\n")
    assert result == f"{tmpdir}\n"
