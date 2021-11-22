#!/bin/bash -x

touch ~/.bashrc
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

git clone https://github.com/tbender4/urlshortener.git
cd urlshortener

nvm install --lts
npm install

sudo cp ./scripts/urlshortener.service /lib/systemd/system
sudo systemctl daemon-reload
sudo systemctl start urlshortener
sudo systemctl enable urlshortener
