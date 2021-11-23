# URL Shortener

Custom URL shortener

## Requirements
- nvm 
- nodejs 16 LTS 
- Ubuntu 20.04 LTS

## Installation
- Make user `tbender` with sudoers
- Be in your home directory. Download and install everything with `curl -o- https://raw.githubusercontent.com/tbender4/urlshortener/main/scripts/install.sh | bash`
  - Please install **only once**. Have not handling running it more than once.
- Set your port, full domain name/IP address (ex: survey.sv3.us) in `config.json`
- Add your allowed auth keys expected for POST requests in the list found in `auth.json`. Follow auth.json.example for a valid format

## Usage
- `sudo systemctl stop urlshortener` - Stop the service
- `sudo systemctl start urlshortener` - Start the service
- `./scripts/update.sh` -update and restart the app

Users access their shortened url by accessing `http://{domain.com}/{hash}`.

SV3 adds to the database by making a POST request to `{domain.com}/url?url={myurlhere.com}` with "Authorization" key in the header and a valid auth key as its value.

### Database
Database is stored in `./db/database.sqlite3`


### ENV Variables
**All env variables are optional.**
Authentication can be disabled by adding HEROKU=1 as a ENV variable

| variable | purpose                                                           |
|----------|-------------------------------------------------------------------|   
| PROXY    | adds Reverse Proxy setting, disables port no. in the response URL |
| HEROKU   | disables Authentication keys, disables port no. in the response URL    |
| PORT     | Override port no. in config.json                                  |   
| DOMAIN   | Override domain name in config.json.                              |   

## TODO
- make a post request with a custom url with `{domain.com}/url?url={myurlhere.com}&custom={myparam}`. Then the returned url will be /myparam/hash/
- Logging errors
- Logging accessedAt, accessAttempts, eventually accessedBy

## Finished
- [x] Testing at scale
- [x] Running as a systemd service
- [x] Installation and Update scripts
