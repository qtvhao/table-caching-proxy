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
sudo docker run -ti --rm -v ${HOME}:/root -v $(pwd):/git alpine/git clone https://github.com/qtvhao/table-caching-proxy.git app-repo
cp -r app-repo app
cd app
```
```shell
sudo docker run -d \
  -p 80:80 \
  --name proxy \
  --restart always \
  -v ${HOME}/app:/usr/src/app \
  -w /usr/src/app node \
  sh -c "yarn install;PROXY_TABLE_REGISTRY= node app.js"
```
