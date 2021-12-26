# table-caching-proxy
ProxyTableCDN is a fast, scalable and extensible HTTP/1.1 and HTTP/2 compliant caching proxy server. It use proxy table (origin's list as file) built on nodejs

# Installation

```shell
sudo apt install curl apt-transport-https ca-certificates curl gnupg2 software-properties-common -y
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/debian $(lsb_release -cs) stable"
sudo apt update
sudo apt install docker-ce zip -y
sudo docker run hello-world

```
```shell
PROXY_TABLE_REGISTRY=proxy-registry.json node app.js
```
