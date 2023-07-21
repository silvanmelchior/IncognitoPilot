import time
import queue
import subprocess
import threading


# TODO: type hings
# TODO: once have error, do not continue execution
# TODO: refactor run_cmd
class PythonInterpreter:
    _END_MESSAGE = "__ INTERPRETER END OF EXECUTION __"
    _TIMEOUT = 30

    def __init__(self, python_path, working_dir):
        self._python_path = python_path
        self._working_dir = working_dir
        self._start_python()

    def _start_python(self):
        self._process = subprocess.Popen([self._python_path, "-i", "-q"],
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

    def _send_cmd(self, cmd):
        if not cmd.endswith("\n"):
            cmd += "\n"
        cmd += f"'{self._END_MESSAGE}'\n"
        self._p_stdin.write(cmd)
        self._p_stdin.flush()

    def run_cmd(self, cmd):
        self._send_cmd(cmd)

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

        return stdout, stderr
