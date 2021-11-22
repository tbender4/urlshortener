#!/bin/bash

# expect script with cd in urlshortener/scripts
cd ../
# kill systemd service
git pull
npm update
# restart systemd service
sudo systemctl restart urlshortener
