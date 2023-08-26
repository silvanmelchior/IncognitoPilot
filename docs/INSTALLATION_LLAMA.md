# :package: Installation (Llama 2)

This section shows how to install **Incognito Pilot** using Llama 2.
Please note that you will only get satisfactory results with the largest model *llama-2-70b-chat*, which needs considerable hardware resources.
And even then, the experience will not be comparable to GPT-4, since Llama 2 was not fine-tuned for this task.

Nevertheless, it's a lot of fun to see what's already possible with open-source models.
At the moment, there are two ways of using **Incognito Pilot** with Llama 2:

- Using a cloud API from [replicate](https://replicate.com/).
  While you don't have the advantage of a fully local setup here, you can try out the 70B model in a quick way without owning powerful hardware.
- Using Hugging Face's [Text Generation Inference](https://github.com/huggingface/text-generation-inference) container,
  which allows you to run llama 2 locally with a simple `docker run` command.

## Replicate

Follow these steps:

1. Install [docker](https://www.docker.com/).
2. Create an empty folder somewhere on your system.
   This will be the working directory to which **Incognito Pilot** has access to.
   The code interpreter can read your files in this folder and store any results.
   In the following, we assume it to be */home/user/ipilot*.
3. Create a [Replicate](https://replicate.com/) account,
   add a [credit card](https://replicate.com/account/billing)
   and copy your [API key](https://replicate.com/account/api-tokens).
4. Now, just run the following command (replace your working directory and API key):

```shell
docker run -i -t \
  -p 3030:80 \
  -e LLM="llama-replicate:replicate/llama-2-70b-chat:2c1608e18606fad2812020dc541930f2d0495ce32eee50074220b87300bc16e1" \
  -e REPLICATE_API_KEY="your-replicate-api-key" \
  -e ALLOWED_HOSTS="localhost:3030" \
  -v /home/user/ipilot:/mnt/data \
  silvanmelchior/incognito-pilot:latest-slim
```

You can of course also choose a [different model](https://replicate.com/blog/all-the-llamas), but the smaller ones are much less suited for this task.

In the console, you should now see a URL.
Open it, and you should see the **Incognito Pilot** interface.

Before you continue, remember:
- Everything you type or every code result you approve is sent to the Replicate API
- Your data stays and is processed locally

Does it work? Great, let's move to the [Getting started](#rocket-getting-started-llama-2) section.

## Text Generation Inference

Follow these steps:

1. Install [docker](https://www.docker.com/).
2. Create an empty folder somewhere on your system.
   This will be the working directory to which **Incognito Pilot** has access to.
   The code interpreter can read your files in this folder and store any results.
   In the following, we assume it to be */home/user/ipilot*.
3. Create a [Hugging Face](https://huggingface.co/) account.
4. Make sure you get access to the [Llama 2 model weights](https://huggingface.co/meta-llama/Llama-2-70b-chat-hf) on Hugging Face.
5. In the *Files and versions* tab, download the following three files (we assume them to be in */home/user/tokenizer*):
   - tokenizer.json
   - tokenizer.model
   - tokenizer_config.json
6. Create an [access token](https://huggingface.co/settings/tokens).

Now, let's first run the *Text Generation Inference* service.
Check out their [Readme](https://github.com/huggingface/text-generation-inference#readme).
I had to run something similar to this:

```shell
docker run \
  --gpus all \
  --shm-size 1g \
  -p 8080:80 \
  -v /home/user/tgi_cache:/data
  -e HUGGING_FACE_HUB_TOKEN=hf_your-huggingface-api-token
  ghcr.io/huggingface/text-generation-inference \
  --model-id "meta-llama/Llama-2-70b-chat-hf"
```

You can of course also choose a different model, but the smaller ones are much less suited for this task.
Once the container shows a success message, you are ready for the next step.

Visit http://localhost:8080/info.
You should see a JSON with model information.
Check out the value for *max_total_tokens*.
It tells you how many tokens fit in the context for this model on your system.
**Incognito Pilot** needs this information to not send too long messages to the service.

Now, just run the following command (replace your directories and max tokens):

```shell
docker run -i -t \
  -p 3030:80 \
  -e LLM="llama-tgi:http://host.docker.internal:8080" \
  -e MAX_TOKENS="your-max-tokens" \
  -e TOKENIZER_PATH="/mnt/tokenizer/tokenizer.model" \
  -v /home/user/tokenizer:/mnt/tokenizer \
  -v /home/user/ipilot:/mnt/data \
  silvanmelchior/incognito-pilot:latest-slim
```

In the console, you should now see a URL.
Open it, and you should see the **Incognito Pilot** interface.

Congrats! You have a fully local setup, everything is running on your own system :partying_face:.

## :rocket: Getting started (Llama 2)

In the **Incognito Pilot** interface, you will see a chat interface, with which you can interact with the model.
Let's try it out!

1. **File Access**: Type "Create a text file with all numbers from 0 to 100".
   You will see how the *Code* part of the UI shows you a Python snippet.
   As soon as you approve, the code will be executed on your machine (within the docker container).
   You will see the result in the *Result* part of the UI.
   As soon as you approve it, it will be sent back to the model.
   In the case of using an API (like Replicate), this of course also means that this result will be sent to their services.
   After the approval, the model will confirm you the execution.
   Check your working directory now (e.g. */home/user/ipilot*): You should see the file!
2. **Math**: Type "What is 1 + 2 * 3 + 4 * 5 + 6 * 7 + 8 * 9?".
   The model will use the Python interpreter to come to the correct result.

Now you should be ready to use **Incognito Pilot** for your own tasks.
One more thing: The version you just used has nearly no packages shipped with the Python interpreter.
This means, things like reading images or Excel files will not work.
To change this, head back to the console and press Ctrl-C to stop the container.
Now re-run the command, but remove the `-slim` suffix from the image.
This will download a much larger version, equipped with [many packages](/docker/requirements_full.txt).

Let's head back to the [Settings](/README.md#gear-settings) section.
