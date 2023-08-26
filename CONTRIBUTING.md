# Contribution Instruction & Guidelines

Hello there! Any kind of contribution to **Incognito Pilot** is most welcome!

- If you have a question, please use GitHub
  [discussions](https://github.com/silvanmelchior/IncognitoPilot/discussions).
- If you found a bug or have a feature request, please use GitHub
  [issues](https://github.com/silvanmelchior/IncognitoPilot/issues).
- If you fixed a bug or implemented a new feature, please do a pull request. If it
  is a larger change or addition, it would be great to first discuss it through an
  [issue](https://github.com/silvanmelchior/IncognitoPilot/issues).

## Development Setup

Warning: If you run **Incognito Pilot** on your own system, the Python interpreter will have full access to all your files!
Always be careful when approving any code!

Prerequisites:

- Cloned repository
- Installed [python](https://www.python.org/)
- Installed [poetry](https://python-poetry.org/)
- Installed [node.js](https://nodejs.org/)

Also have a look at the overall [architecture](/docs/architecture.png) first.

### Services

First, create a venv somewhere on your system, where ipython will run your code:

```shell
cd /home/user  # the venv can be located anywhere
python -m venv venv_interpreter
source venv_interpreter/bin/activate
pip install ipython
pip install ...  # install whatever packages you like
```

Now open a terminal in the *services* folder and run the following:

```shell
poetry install
poetry shell

export IPYTHON_PATH="/home/user/venv_interpreter/bin/ipython"
export WORKING_DIRECTORY="/home/user/ipilot"
export ALLOWED_HOSTS="localhost:3000"
export ENABLE_CORS="TRUE"
export OPENAI_API_KEY=sk-your-api-key

uvicorn main:app --reload
```

If you want to use something else than OpenAI, adjust the env-variables as explained in the [Readme](/README.md).

### UI

Open a terminal in the *ui* folder and run the following:

```shell
npm install
export NEXT_PUBLIC_SERVICES_URL="http://localhost:8000"
npm run dev
```

You should now be able to access the UI on the following URL: http://localhost:3000.

## Tools

When you contribute code, please use **black** for interpreter- and **prettier** for ui-formatting.
There are also some first tests on the interpreter side, but there is a lot of room for improvement.

## Branching & Release Strategy

The default branch is called main.
It contains the latest features, which would be ready for deployment.
It is not possible to push to it directly.
Instead, for every feature, a branch should be created, which will then be merged back into main with a pull request.

At some point, a new version can be released.
To do so, the version number should be entered in the *VERSION* file.
A release with corresponding release notes can then be generated on GitHub.
This also automatically triggers a deployment to docker hub.

Semantic versioning is used for releases.
If the version number contains a `b` (e.g. `1.0.0b1`), a `nightly` image will be released, otherwise the image will be tagged as `latest`. 
