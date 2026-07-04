#!/bin/bash
BUCKET="microvm-bucket"

zip -r bootcamp-lab.zip Dockerfile start.sh hook_server.js README.md ejercicio/

aws s3 cp bootcamp-lab.zip s3://${BUCKET}/bootcamp-lab.zip

