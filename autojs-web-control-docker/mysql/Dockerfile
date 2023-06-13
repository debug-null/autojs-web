FROM mysql

LABEL OG=felord.cn
ENV MYSQL_ROOT_PASSWORD=root
ENV MYSQL_DATABASE=cloud_auto

COPY utf8mb4.cnf /etc/mysql/conf.d/utf8mb4.cnf
COPY . /docker-entrypoint-initdb.d