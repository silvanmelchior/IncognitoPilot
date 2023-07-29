import os
import sys
from pathlib import Path
from typing import Optional
import tempfile
import time
import queue
import subprocess
import threading


class IPythonInterpreter:
    _END_MESSAGE = "__ INTERPRETER END OF EXECUTION __"
    _INTERPRETER_PROMPT = ">>> "
    _LAST_VAR = "_INTERPRETER_last_val"

    def __init__(
        self,
        *,
        working_dir: Path = None,
        ipython_path: Path = None,
        timeout: int = None,
        deactivate_venv: bool = False,
    ):
        self._working_dir = working_dir
        if ipython_path is None:
            self._ipython_path = Path(sys.executable).parent / "ipython.exe"
        else:
            self._ipython_path = ipython_path
        self._timeout = timeout
        self._deactivate_venv = deactivate_venv
        self._running = False
        self._start()

    def __del__(self):
        self.stop()

    def _get_env(self):
        env = os.environ.copy()
        if self._deactivate_venv:
            if "VIRTUAL_ENV" in env:
                del env["VIRTUAL_ENV"]
            if "_OLD_VIRTUAL_PROMPT" in env:
                env["PROMPT"] = "_OLD_VIRTUAL_PROMPT"
                del env["_OLD_VIRTUAL_PROMPT"]
            if "_OLD_VIRTUAL_PYTHONHOME" in env:
                env["PYTHONHOME"] = "_OLD_VIRTUAL_PYTHONHOME"
                del env["_OLD_VIRTUAL_PYTHONHOME"]
            if "_OLD_VIRTUAL_PATH" in env:
                env["PATH"] = "_OLD_VIRTUAL_PATH"
                del env["_OLD_VIRTUAL_PATH"]
        return env

    def _start(self):
        env = self._get_env()
        self._process = subprocess.Popen(
            [str(self._ipython_path), "--classic"],
            text=True,
            cwd=self._working_dir,
            env=env,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        self._p_stdin = self._process.stdin

        self._stop_threads = False

        self._q_stdout = queue.Queue()
        self._t_stdout = threading.Thread(
            target=self._reader_thread,
            args=(self._process.stdout, self._q_stdout),
            daemon=True,
        )
        self._t_stdout.start()

        self._q_stderr = queue.Queue()
        self._t_stderr = threading.Thread(
            target=self._reader_thread,
            args=(self._process.stderr, self._q_stderr),
            daemon=True,
        )
        self._t_stderr.start()

        self._wait_till_started()
        self._running = True

    def stop(self):
        if self._running:
            self._process.kill()
            self._stop_threads = True
            self._t_stdout.join()
            self._t_stderr.join()
            self._running = False

    def _reader_thread(self, pipe, q):
        while not self._stop_threads:
            q.put(pipe.readline())

    def _read_stdout(self, timeout: Optional[int]) -> Optional[str]:
        start = time.time()
        stdout = ""
        while True:
            try:
                line = self._q_stdout.get(timeout=timeout)
            except queue.Empty:
                line = None
            if timeout is not None and time.time() - start > timeout:
                line = None

            if line is None:
                return None

            if self._END_MESSAGE in line:
                break
            stdout += line

        return stdout[len(self._INTERPRETER_PROMPT) :]

    def _read_stderr(self) -> str:
        stderr = ""
        while not self._q_stderr.empty():
            stderr += self._q_stderr.get()
        return stderr

    def _write_stdin(self, text: str):
        self._p_stdin.write(text)
        self._p_stdin.flush()

    def _wait_till_started(self):
        self._write_stdin(f"'{self._END_MESSAGE}'\n")
        self._read_stdout(timeout=10)

    def _create_script(self, script: str) -> Path:
        lines = script.splitlines()
        if len(lines) > 0:
            is_eval = True
            try:
                compile(lines[-1], "<stdin>", "eval")
            except SyntaxError:
                is_eval = False
            if is_eval:
                lines[-1] = f"{self._LAST_VAR} = ({lines[-1]})"
                lines.append(f"if {self._LAST_VAR} is not None:")
                lines.append(f"    print({self._LAST_VAR})")

        script = "\n".join(lines) + "\n"
        with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
            f.write(script)

        return Path(f.name)

    def _run_script(self, script_path: Path):
        self._write_stdin(f"%run -i {script_path}\n'{self._END_MESSAGE}'\n")

    def _fetch_result(self) -> Optional[str]:
        stdout = self._read_stdout(timeout=self._timeout)
        if stdout is None:
            self.stop()
            self._start()
            return None

        stderr = self._read_stderr()
        return stdout + stderr

    def run_cell(self, script: str) -> Optional[str]:
        """Run the whole cell and return the last result.
        Returns None if the interpreter timed out."""
        script_path = self._create_script(script)
        self._run_script(script_path)
        result = self._fetch_result()
        script_path.unlink()
        return result
