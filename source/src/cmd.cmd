apidoc -i res/ -o ../apidoc/res
apidoc -i listeners/ -o ../apidoc/sokect

apidoc -i recarga/ -o ../../apidoc/api/

pscp root@173.192.13.12:/root/.pm2/logs/app-out-0.log  D:\Portable
pscp guamanjuan@173.192.13.12:/root/.pm2/logs/app-out-0.log  D:\Portable

systemctl restart mysqld 
systemctl start mysqld 
systemctl restart httpd
systemctl start httpd 
systemctl stop httpd 

sudo service nginx stop

sudo service nginx restart

chmod -R 777 html/

websocket-bench -a 1 -c 1 -m 1 http://localhost:8080 -g test.js 

paping -p 6379 173.192.13.12 -c 10
paping -p 3306 173.192.13.14 -c 10
paping -p 8080 173.192.13.14 -c 10

paping -p 6379 104.210.157.216 -c 10

yum clean all
yum install cur
nano /etc/yum.repos.d/CentOS-Base.repo
yum repolist all

sudo cp -R 8080 respaldo
pm2 start servidor.js --name ktaxi:8080
sudo rm -rf servidorktaxinodejs/

chmod -rw--- root /min
chmod ugo+rwx /

adduser diegoromero
sudo passwd diegoromero
adduser veronicachimbo
sudo passwd veronicachimbo

CREATE USER 'guamanjuan'@'%' IDENTIFIED BY '49Z$K8xp4HE1xi75';
set password for guamanjuan@'%' = password('49Z$K8xp4HE1xi75');
GRANT ALL PRIVILEGES ON * . * TO 'guamanjuan'@'%';
GRANT SUPER ON * . * TO 'guamanjuan'@'%'; 
GRANT USAGE ON * . * TO 'guamanjuan'@'%';
GRANT GRANT OPTION ON * . * TO 'guamanjuan'@'%';
FLUSH PRIVILEGES;

yum install php-mysqlnd

ps aux | grep minerd

update user set password=PASSWORD("8=U1ok0b&g7M") where user='root';

service redis_6379 status
service redis_6379 start