FROM python:3.9-slim

# Create a group and user to run our app
ARG APP_USER=appuser
RUN groupadd -r ${APP_USER} && useradd --no-log-init -r -g ${APP_USER} ${APP_USER}

RUN set -ex \
    && RUN_DEPS=" \
    gcc \
    libmariadb-dev-compat \
    libmariadb-dev \
    " \
    && seq 1 8 | xargs -I{} mkdir -p /usr/share/man/man{} \
    && apt-get update && apt-get install -y --no-install-recommends $RUN_DEPS \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY requirements.txt ./

RUN /usr/local/bin/python -m pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install psycopg2-binary

RUN chown -R ${APP_USER}:${APP_USER} /usr/src/app
USER ${APP_USER}:${APP_USER}

ENV PYTHONUNBUFFERED 1
ENV PYTHONPATH="${PYTHONPATH}:/usr/lib/python3/dist-packages/"

EXPOSE 8000
EXPOSE 3000-3999:3000-3999
EXPOSE 3000-3999:3000-3999/udp

COPY . .
