FROM cvs/server

ARG POSTGRES
ENV POSTGRES ${POSTGRES}
ARG BACKEND_PORT
ENV BACKEND_PORT ${BACKEND_PORT}
ARG DEBUG
ENV DEBUG ${DEBUG:-0}


WORKDIR /usr/src/cvs
RUN python setup.py install

WORKDIR /usr/src/videoroom
COPY  . .
RUN python setup.py install

CMD python -m videoroom.backend

EXPOSE ${BACKEND_PORT}