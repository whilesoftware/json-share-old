# Set nginx base image
FROM nginx

# File Author / Maintainer
MAINTAINER Alan McCosh

# Copy custom configuration file from the current directory
COPY nginx.conf.default /etc/nginx/nginx.conf

# Copy three variants used for upgrades
RUN mkdir -p /src
COPY nginx.conf.default /src/nginx.conf.default
#COPY nginx.conf.web1only /src/nginx.conf.web1only
#COPY nginx.conf.web2only /src/nginx.conf.web2only

