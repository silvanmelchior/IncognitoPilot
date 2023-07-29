#!/bin/bash

cd /opt/app/ui

if [[ -z "${INTERPRETER_PORT}" ]]; then
  export INTERPRETER_URL="localhost:3031"
else
  export INTERPRETER_URL="localhost:${INTERPRETER_PORT}"
fi

npm run start
