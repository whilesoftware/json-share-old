# json-share

## initial configuration
1. symlink docker-compose.yml to development
```bash
ln -s docker-compose.yml.development docker-compose.yml
```
2. start the containers
```bash
docker-compose up --build
```
3. configure nginx
```
  # proxy incoming requests to our internal nginx instance
  location /json/ {
    # remove prefix before passing requests on
    # /json/path/to/resource becomes
    # /path/to/resource
    proxy_pass http://localhost:31339/;

    # these are all pretty standard
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;

    # these ensure the final destination is aware of the source ip
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Host $server_name;
    proxy_cache_bypass $http_upgrade;
  }
```

