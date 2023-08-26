#!/bin/bash

/opt/app/start_services.sh &

nginx -g "daemon off;"
