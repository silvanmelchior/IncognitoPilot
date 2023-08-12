#!/bin/bash

cd /opt/app
. venv_services/bin/activate
cd services

mkdir -p /mnt/data
export WORKING_DIRECTORY=/mnt/data
export IPYTHON_PATH=/opt/app/venv_interpreter/bin/ipython

uvicorn main_interpreter:app --host 0.0.0.0 --port 8080
