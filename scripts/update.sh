#!/bin/bash -x

# expect script with current directory in urlshortener/scripts
sudo systemctl stop urlshortener
cd /home/tbender/urlshortener/
git pull
npm update
sudo systemctl start urlshortener
