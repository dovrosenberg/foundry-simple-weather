#!/bin/bash

sleep 1
# Set permissions.
mkdir -p /foundry/fvtt /foundry/data
chown 1000:100 -R /foundry
chmod 776 -R /foundry
chmod +x /foundry/
# Run.
echo "INFO ! Starting FoundryVTT Server"
echo " "

su foundry -c 'node /foundry/fvtt/resources/app/main.js --dataPath=/foundry/data --ignore-gpu-blacklist'
exit
