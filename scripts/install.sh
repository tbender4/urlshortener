#!/bin/bash -x

sudo apt install -y python nginx
# ubuntu 20 removed python2, python2 necessary for npm sqlite3 4.2.0. 
# npm sqlite3 4.2.0 used to due to sqlite3 5.0.2 having a security warning

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

sudo unlink /etc/nginx/sites-enabled/default
sudo cp ./scripts/urlshortener.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/reverse-proxy.conf /etc/nginx/sites-enabled/reverse-proxy.conf
sudo service nginx restart