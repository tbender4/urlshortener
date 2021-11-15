# URL Shortener

Custom URL shortener

## Requirements
- LTS version of nodejs

## Installation
- Set your port, full domain name (ex: u.sv3.us) in `config.json`
- Add your allowed auth keys expected for POST requests in the list found in `auth.json`. Follow auth.json.example for a valid format
- Run `npm install` to install dependencies.
- Fix vulnerabilities using npm audit fix.

## Usage
Database is stored here:
```
./db/
  database.sqlite3
  ...
```
Users access their shortened url by accessing `{domain.com}/{hash}`
SV3 adds to the database by making a POSt request to `{domain.com}/url?url={myurlhere.com}` with "Authorization" key in the header and a valid auth key as its value.

todo:
- make a post request with a custom url with `{domain.com}/url?url={myurlhere.com}&custom={myparam}`. Then the returned url will be /myparam/hash/
- Logging errors
- Logging accessedAt, accessAttempts, eventually accessedBy
- Testing at scale