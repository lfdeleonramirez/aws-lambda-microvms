FROM codercom/code-server:latest

USER root

# Instalar Node.js (para hook server) y Python con pytest
RUN apt-get update && apt-get install -y \
    nodejs \
    python3 python3-pip \
    && rm -rf /var/lib/apt/lists/* \
    && pip3 install pytest --break-system-packages

# Instalar extensión de Python para code-server
RUN code-server --install-extension ms-python.python

# Config sin auth
RUN mkdir -p /root/.config/code-server && \
    echo "bind-addr: 0.0.0.0:8080" > /root/.config/code-server/config.yaml && \
    echo "auth: none" >> /root/.config/code-server/config.yaml && \
    echo "cert: false" >> /root/.config/code-server/config.yaml

# Copiar ejercicio al workspace
COPY ejercicio/ /home/coder/workspace/
RUN chown -R coder:coder /home/coder/workspace

COPY hook_server.js /hook_server.js
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 8080 8081

CMD ["/start.sh"]
