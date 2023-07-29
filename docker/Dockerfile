ARG INTERPRETER_IMAGE
FROM $INTERPRETER_IMAGE
SHELL ["/bin/bash", "-c"]

RUN apt update && apt install -y nodejs npm

WORKDIR /opt/app

COPY interpreter interpreter
RUN python3 -m venv venv_backend && \
    source venv_backend/bin/activate && \
    pip3 install ./interpreter

COPY ui ui
RUN cd ui && \
    npm install && \
    npm run build && \
    cd ..

COPY VERSION VERSION
COPY docker/start* .
RUN chmod 755 start*
CMD ["/opt/app/start.sh"]
