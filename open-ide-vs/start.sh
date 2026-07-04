#!/bin/bash

# Hook server primero
node /hook_server.js &

# code-server sin auth en puerto 8080
exec code-server --bind-addr 0.0.0.0:8080 --auth none /home/coder
