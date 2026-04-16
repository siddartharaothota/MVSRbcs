## To login
* mysql -u <username> -p


* mysql -u <username> -h localhost -p
* mysql -u <username> -h <your-mac-ip> -p

## To start and stop
* brew services start mysql
* brew services stop mysql
* brew services restart mysql

## To create new user
* CREATE USER 'siddu'@'%' IDENTIFIED BY '1234';
* GRANT ALL PRIVILEGES ON *.* TO 'siddu'@'%';
* FLUSH PRIVILEGES;

## queries
* use <databaseName>;
* show databases;
* show tables;
* select * from <tableName>;
* ALTER TABLE <tableName> ADD <newColumnName> VARCHAR(100);