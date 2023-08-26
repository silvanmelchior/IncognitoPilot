# :package: Installation (GPT via Azure)

This section shows how to install **Incognito Pilot** using a GPT model via Azure.
Follow these steps:

1. Install [docker](https://www.docker.com/).
2. Create an empty folder somewhere on your system.
   This will be the working directory to which **Incognito Pilot** has access to.
   The code interpreter can read your files in this folder and store any results.
   In the following, we assume it to be */home/user/ipilot*.
3. Login to Azure portal and create an [Azure OpenAI Service](https://azure.microsoft.com/en-us/products/ai-services/openai-service-b).
4. You will see the access key and endpoint, which we will use later.
5. Open Azure OpenAI Studio and deploy a model.
6. Now, just run the following command (replace your working directory, model-name and API information):

```shell
docker run -i -t \
  -p 3030:80 \
  -e LLM="gpt-azure:your-deployment-name" \
  -e AZURE_API_KEY="your-azure-openai-api-key" \
  -e AZURE_API_BASE="https://your-azure-openai-service-name.openai.azure.com/" \
  -e ALLOWED_HOSTS="localhost:3030" \
  -v /home/user/ipilot:/mnt/data \
  silvanmelchior/incognito-pilot:latest-slim
```

In the console, you should now see a URL.
Open it, and you should see the **Incognito Pilot** interface.

Make sure you have access to a model which is capable of function calling, otherwise you will get an error similar to "unknown argument 'function'".

Let's head back to the [Getting Started](/README.md#rocket-getting-started-gpt) section.
