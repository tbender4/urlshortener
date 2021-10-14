URL Shortener

set your port, full domain name (ex: u.sv3.us), and accepted domains to be shortened in `config.json`
put your allowed auth keys in the list in `auth.json`

```
./db/
  my_url1_hash
  my_url2_hash
  my_url3_hash
  ...
```

it's first 7 digits of the md5 hash of a URL. I forgot why I designed it this way.

users access the url by {domain.com}/{hash}
make a post request with {domain.com}/url?url={myurlhere.com} with "Authorization" in the header with a valid auth key.