<p align="center">
    <img src="https://github.com/silvanmelchior/IncognitoPilot/blob/main/docs/title.png" alt="logo" style="width: 75%">
</p>

<p align="center"><em>An AI code interpreter for sensitive data, powered by GPT-4 or Llama 2.</em></p>

**Incognito Pilot** combines a Large Language Model (LLM) with a Python interpreter, so it can run code and execute tasks for you.
It is similar to **ChatGPT Code Interpreter**, but the interpreter runs **locally** and it can use open-source models like **Llama 2**.

**Incognito Pilot** allows you to work with **sensitive data** without uploading it to the cloud.
Either you use a local LLM (like Llama 2), or an API (like GPT-4).
For the latter case, there is an **approval mechanism** in the UI, which separates your local data from the remote services.

With **Incognito Pilot**, you can:
- :white_check_mark: analyse data and create visualizations
- :white_check_mark: convert your files, e.g. a video to a gif
- :white_check_mark: **access the internet** to e.g. download data

and much more!

## :bulb: Demo

https://github.com/silvanmelchior/IncognitoPilot/assets/6033305/05b0a874-6f76-4d22-afca-36c11f90b1ff

The video shows Incognito Pilot with GPT-4.
While your conversation and approved code results are sent to OpenAI's API, your **data is kept locally** on your machine.
The interpreter is running locally as well and processes your data right there.
And you can go even further and use Llama 2 to have everything running on your machine.

## :package: Installation (GPT via OpenAI API)

This section shows how to install **Incognito Pilot** using a GPT model via OpenAI's API. For

- **Llama 2**, check [Installation for Llama 2](/docs/INSTALLATION_LLAMA.md) instead, and for
- **GPT on Azure**, check [Installation with Azure](/docs/INSTALLATION_AZURE.md) instead.
- If you don't have docker, you can install **Incognito Pilot** on your system directly, using the development setup (see below).

Follow these steps:

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
  -p 3030:80 \
  -e OPENAI_API_KEY="sk-your-api-key" \
  -e ALLOWED_HOSTS="localhost:3030" \
  -v /home/user/ipilot:/mnt/data \
  silvanmelchior/incognito-pilot:latest-slim
```

In the console, you should now see a URL.
Open it, and you should see the **Incognito Pilot** interface.

It's also possible to run **Incognito Pilot** with the free trial credits of OpenAI, without adding a credit card.
At the moment, this does not include GPT-4 however, so see below how to change the model to GPT-3.5.

## :rocket: Getting started (GPT)

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

Now you should be ready to use **Incognito Pilot** for your own tasks. Just remember:
- Everything you type or every code result you approve is sent to the OpenAI / Azure API
- Your data stays and is processed locally

One more thing: The version you just used has nearly no packages shipped with the Python interpreter.
This means, things like reading images or Excel files will not work.
To change this, head back to the console and press Ctrl-C to stop the container.
Now re-run the command, but remove the `-slim` suffix from the image.
This will download a much larger version, equipped with [many packages](/docker/requirements_full.txt).

### Change model

To use another model than the default one (GPT-4), set the environment variable `LLM`.
OpenAI's GPT models have the prefix `gpt:`, so to use GPT-3.5 for example (the original ChatGPT), add the following to the docker run command:

```shell
-e LLM="gpt:gpt-3.5-turbo"
```

Please note that GPT-4 is considerably better in the interpreter setup than GPT-3.5.

## :gear: Settings

### Change port

To serve the UI at a different port than 3030, you can expose the internal port 80 to a different one, for example 8080.
You should also change the allowed host variable in this case:

```shell
docker run -i -t \
  -p 8080:80 \
  -e ALLOWED_HOSTS="localhost:8080" \
  ... \
  silvanmelchior/incognito-pilot
```

### Authentication

Per default, the authentication token, which is part of the URL you open, is randomly generated at startup.
This means, whenever you restart the container, you need to re-copy the URL.
If you want to prevent this, you can also fix the token to a certain value, by adding the following to the docker run command:

```shell
  -e AUTH_TOKEN="some-secret-token" 
```

Once you opened the URL with the new token, the browser will remember it.
Thus, from now on, you can access **Incognito Pilot** by just opening http://localhost:3030, without having to add a token to the URL.

### Timeout

Per default, the Python interpreter stops after 30 seconds.
To change this, set the environment variable `INTERPRETER_TIMEOUT`.
For 2 minutes for example, add the following to the docker run command:

```shell
-e INTERPRETER_TIMEOUT="120"
```

### Autostart

To automatically start **Incognito Pilot** with docker / at startup, remove the `-i -t` from the run command and add the following:

```shell
--restart always
```

Together with a bookmark of the UI URL, you'll have **Incognito Pilot** at your fingertips whenever you need it.
Alternatively, you can use docker-compose.

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
  ... \
  incognito-pilot-custom
```

## :question: FAQs

### Is it as good as ChatGPT Code Interpreter?

No, it has its limits.
The tradeoff between privacy and capabilities is not an easy one in this case.
For things like images, it is as powerful as ChatGPT code interpreter, because it doesn't need to know about the content of the image to edit it.
But for things like spreadsheets, if ChatGPT doesn't see the content, it has to guess for example the data format from the header, which can go wrong.

However, in certain aspects, it's even better than ChatGPT code interpreter:
The interpreter has internet access, allowing for a bunch of new tasks which were not possible before.
Also, you can run the interpreter on any machine, including very powerful ones, so you can solve much larger tasks than with ChatGPT code interpreter.

### Why not just use ChatGPT to generate the code and run it myself?

You can of course do this. There are quite some advantages of using **Incognito Pilot** however:

- Incognito Pilot can run code in multiple rounds (e.g. first getting the file name of a csv, then the structure, and then analyze the content).
  It can even correct itself, seeing the stack trace of its failed execution.
  You can of course also copy back and forth code and result to achieve all of this manually, but it gets cumbersome quite quickly.
- You have tons of pre-installed dependencies in Incognito Pilot
- The code runs in a sandbox, protecting your computer

### How can it be private if you use public cloud APIs?

Whatever you type and all code results you approve are indeed not private, in the sense that they are sent to the cloud API.
Your data however stays local.
The interpreter runs locally as well, processing your data right where it is.
For certain things, you will have to tell the model something about your data (e.g. the file-name of structure),
but it usually is meta-data which you actively approve in the UI and not the actual data.
At every step in the execution, you can just reject that something is sent to the API.

## :house: Architecture

![Architecture Diagram](/docs/architecture.png)

## :wrench: Development

Want to contribute to **Incognito Pilot**?
Or just install it without docker?
Check out the contribution [instruction & guidelines](/CONTRIBUTING.md).
