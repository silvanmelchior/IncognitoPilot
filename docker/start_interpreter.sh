#!/bin/bash

cd /opt/app
. venv_backend/bin/activate
cd interpreter

mkdir -p /mnt/data
export WORKING_DIRECTORY=/mnt/data
export IPYTHON_PATH=/opt/app/venv_interpreter/bin/ipython

uvicorn main:app --host 0.0.0.0 --port 3031
