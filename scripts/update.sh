#!/bin/bash

# expect script with current directory in urlshortener/scripts
sudo systemctl stop urlshortener
cd /home/tbender/urlshortener/
# kill systemd service
git pull
npm update
# restart systemd service
sudo systemctl start urlshortener
