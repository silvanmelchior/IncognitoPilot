FROM silvanmelchior/interpreter-venv-slim:0.1.0
SHELL ["/bin/bash", "-c"]

RUN apt update && apt install -y nodejs npm

WORKDIR /opt/app

COPY interpreter interpreter
RUN python3 -m venv venv_backend && \
    source venv_backend/bin/activate && \
    pip3 install ./interpreter

COPY ui ui
ARG NEXT_PUBLIC_INTERPRETER_URL="localhost:3031"
RUN cd ui && \
    npm install && \
    npm run build && \
    cd ..

COPY docker/start* .
CMD ["/opt/app/start.sh"]
