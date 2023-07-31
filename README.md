<p align="center">
    <img src="https://github.com/silvanmelchior/IncognitoPilot/blob/main/docs/title.png" alt="logo" style="width: 75%">
</p>

<p align="center"><em>Your local AI code interpreter</em></p>

**Incognito Pilot** combines a large language model with a Python interpreter, so it can run code and execute tasks for you.
It is similar to **ChatGPT Code Interpreter**, but the interpreter runs locally.
This allows you to work with sensitive data without uploading it to the cloud.
To still be able to use powerful models available via API only (like GPT-4), there is an approval mechanism in the UI, which separates your local data from the remote services.

With **Incognito Pilot**, you can:

- analyse data and create visualizations
- convert your files, e.g. a video to a gif
- automate tasks, like renaming all files in a directory

and much more!
It runs on every hardware, so you can for example analyze large datasets on powerful machines.
We also plan to support more models like Llama 2 in the future.

<p align="center">
    <img src="https://github.com/silvanmelchior/IncognitoPilot/blob/main/docs/screenshot.png" alt="screenshot" style="width: 75%"><br>
    <em>Screenshot of Incognito Pilot v1.0.0</em>
</p>

## :package: Installation

1. Install [docker](https://www.docker.com/).
2. Create an empty folder somewhere on your system.
   This will be the working directory to which **Incognito Pilot** has access to.
   The code interpreter can read your files in this folder and store any results.
   In the following, we assume it to be */home/user/ipilot*.
3. Create an [OpenAI account](https://platform.openai.com),
   add a [credit card](https://platform.openai.com/account/billing/payment-methods)
   and create an [API key](https://platform.openai.com/account/api-keys).
4. Now, just run the following command (replace your working directory and API key):

```shell
docker run -i -t \
  -p 3030:3030 -p 3031:3031 \
  -e OPENAI_API_KEY="sk-your-api-key" \
  -v /home/user/ipilot:/mnt/data \
  silvanmelchior/incognito-pilot:latest-slim
```

You can now visit http://localhost:3030 and should see the **Incognito Pilot** interface.

Some final remarks:

- If you don't have docker, you can install **Incognito Pilot** on your system directly, using the development setup (see below).
- You can also run **Incognito Pilot** with the free trial credits of OpenAI, without adding a credit card.
  At the moment, this does not include GPT-4 however, so see below how to change the model to GPT-3.5.

## :rocket: Getting started

In the **Incognito Pilot** interface, you will see a chat interface, with which you can interact with the model.
Let's try it out!

1. **Greetings**: Type "Hi" and see how the model responds to you.
2. **Hello World**: Type "Print a hello world message for me".
   You will see how the *Code* part of the UI shows you a Python snippet.
   As soon as you approve, the code will be executed on your machine (within the docker container).
   You will see the result in the *Result* part of the UI.
   As soon as you approve it, it will be sent back to the model.
   In the case of using an API like here OpenAI's GPT models, this of course also means that this result will be sent to their services.
3. **File Access**: Type "Create a text file with all numbers from 0 to 100".
   After the approval, the model will confirm you the execution.
   Check your working directory now (e.g. */home/user/ipilot*): You should see the file!

Now you should be ready to use **Incognito Pilot** for your own tasks.
One more thing: The version you just used has nearly no packages shipped with the Python interpreter.
This means, things like reading images or Excel files will not work.
To change this, head back to the console and press Ctrl-C to stop the container.
Now re-run the command, but remove the `-slim` suffix from the image.
This will download a much larger version, equipped with [many packages](/docker/requirements_full.txt).

## :gear: Settings

### Change model

To use another model than the default one (GPT-4), set the environment variable `LLM`.
OpenAI's GPT models have the prefix `gpt:`, so to use GPT-3.5 for example (the original ChatGPT), add the following to the docker run command:

```shell
-e LLM="gpt:gpt-3.5-turbo"
```

Please note that GPT-4 is considerably better in this interpreter setup than GPT-3.5.

### Change port

Per default, the UI is served on port 3030 and contacts the interpreter at port 3031.
This can be changed to any ports using the port mapping of docker.
However, the new port for the interpreter also needs to be communicated to the UI, using the environment variable `INTERPRETER_URL`.
For example, to serve the UI on port 8080 and the interpreter on port 8081, run the following:

```shell
docker run -i -t \
  -p 8080:3030 -p 8081:3031 \
  -e OPENAI_API_KEY="sk-your-api-key" \
  -e INTERPRETER_PORT=8081 \
  -v /home/user/ipilot:/mnt/data \
  silvanmelchior/incognito-pilot
```

### Further settings

The following further settings are available

- Per default, the Python interpreter stops after 30 seconds.
  To change this, set the environment variable `INTERPRETER_TIMEOUT`. 
- To automatically start **Incognito Pilot** with docker / at startup, remove the remove `-i -t` from the run command and add `--restart always`.
  Together with a bookmark of the UI URL, you'll have **Incognito Pilot** at your fingertips whenever you need it.

## :toolbox: Own dependencies

Not happy with the pre-installed packages of the full (aka non-slim) version?
Want to add more Python (or Debian) packages to the interpreter?

You can easily containerize your own dependencies with **Incognito Pilot**.
To do so, create a Dockerfile like this:

```dockerfile
FROM silvanmelchior/incognito-pilot:latest-slim
SHELL ["/bin/bash", "-c"]

# uncomment the following line, if you want to install more packages
# RUN apt update && apt install -y some-package

WORKDIR /opt/app

COPY requirements.txt .

RUN source venv_interpreter/bin/activate && \
    pip3 install -r requirements.txt
```

Put your dependencies into a *requirements.txt* file and run the following command:

```shell
docker build --tag incognito-pilot-custom .
```

Then run the container like this:

```shell
docker run -i -t \
  -p 3030:3030 -p 3031:3031 \
  -e OPENAI_API_KEY="sk-your-api-key" \
  -v /home/user/ipilot:/mnt/data \
  incognito-pilot-custom
```

## :house: Architecture

![Architecture Diagram](/docs/architecture.png)

## :wrench: Development

Want to contribute to **Incognito Pilot**?
Or just install it without docker?
Check out the contribution [instruction & guidelines](/CONTRIBUTING.md).
