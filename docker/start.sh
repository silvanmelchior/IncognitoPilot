#!/bin/bash

/opt/app/start_interpreter.sh &
/opt/app/start_llm.sh &

nginx -g "daemon off;"
