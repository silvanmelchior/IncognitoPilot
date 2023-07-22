from pathlib import Path
from typing import Optional
import tempfile
import time
import queue
import subprocess
import threading


class IPythonInterpreter:
    _END_MESSAGE = "__ INTERPRETER END OF EXECUTION __"
    _LAST_VAR = "_INTERPRETER_last_val"
    _TIMEOUT = 30

    def __init__(self, ipython_path: Path, working_dir: Path):
        self._ipython_path = ipython_path
        self._working_dir = working_dir
        self._start_python()

    def _start_python(self):
        self._process = subprocess.Popen([str(self._ipython_path), "--classic"],
                                         text=True,
                                         cwd=self._working_dir,
                                         stdin=subprocess.PIPE,
                                         stdout=subprocess.PIPE,
                                         stderr=subprocess.PIPE)
        self._p_stdin = self._process.stdin

        self._stop_threads = False

        self._q_stdout = queue.Queue()
        self._t_stdout = threading.Thread(target=self._reader_thread,
                                          args=(self._process.stdout, self._q_stdout),
                                          daemon=True)
        self._t_stdout.start()
        self._drain_queue(self._q_stdout)

        self._q_stderr = queue.Queue()
        self._t_stderr = threading.Thread(target=self._reader_thread,
                                          args=(self._process.stderr, self._q_stderr),
                                          daemon=True)
        self._t_stderr.start()

    def _kill_python(self):
        self._process.kill()
        self._stop_threads = True
        self._t_stdout.join()
        self._t_stderr.join()

    def _reader_thread(self, pipe, q):
        while not self._stop_threads:
            q.put(pipe.readline())

    @staticmethod
    def _drain_queue(q: queue.Queue, timeout: float = 1.0):
        try:
            while True:
                q.get(timeout=timeout)
        except queue.Empty:
            pass

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
        self._p_stdin.write(f"%run -i {script_path}\n'{self._END_MESSAGE}'\n")
        self._p_stdin.flush()

    def _fetch_result(self) -> Optional[str]:
        start = time.time()
        stdout = ""
        while True:
            try:
                line = self._q_stdout.get(timeout=self._TIMEOUT)
            except queue.Empty:
                line = None
            if time.time() - start > self._TIMEOUT:
                line = None

            if line is None:
                self._kill_python()
                self._start_python()
                return None

            if self._END_MESSAGE in line:
                break
            stdout += line

        stderr = ""
        while not self._q_stderr.empty():
            stderr += self._q_stderr.get()

        return stdout + stderr

    def run_cell(self, script: str) -> Optional[str]:
        """Run the whole cell and return the last result.
        Returns None if the interpreter timed out."""
        script_path = self._create_script(script)
        self._run_script(script_path)
        result = self._fetch_result()
        script_path.unlink()
        return result
