URL Shortener

set your port, full domain name (ex: u.sv3.us), and accepted domains to be shortened in `config.json`
put your allowed auth keys in the list in `auth.json`. Follow auth.json.example for a valid format
run `npm install` while in this directory to install dependencies

main branch db is just text files
```
./db/
  my_url1_hash
  my_url2_hash
  my_url3_hash
  ...
```
staging branch is moving to sqlite3. for now it's in memory. eventually it'll be saved in the same `/db/` folder

Design:
it's first 7 digits of the sha1 hash of a URL. I forgot why I designed it this way.

users access the url by `{domain.com}/{hash}`
make a post request with `{domain.com}/url?url={myurlhere.com}` with "Authorization" in the header with a valid auth key.

todo:
- make a post request with a custom url with `{domain.com}/url?url={myurlhere.com}&custom={myparam}`. Then the returned url will be /myparam/hash/
- finish db changes 
