URL Shortener

```
./db/
  my_url1_hash.json
  my_url2_hash.json
  my_url3_hash.json
  ...
```

it's first 10 digits of the md5 hash of a URL. I forgot why I designed it this way. But it does allow for quick lookup of URLs as a key in a hashmap. Without using a proper sql db.

probably should just whitelist the post requests from sv3.io/sv3.us/etc domains's IP addrs (lazy method of not doing proper auth)
