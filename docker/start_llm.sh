#!/bin/bash

cd /opt/app
. venv_services/bin/activate
cd services

uvicorn main_llm:app --host 0.0.0.0 --port 8081
