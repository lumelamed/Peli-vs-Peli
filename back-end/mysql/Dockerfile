# Elige la imagen de MySQL
FROM mysql:5.7.15

# Autora
MAINTAINER Lucila Melamed

# Setea variables de entorno
ENV MYSQL_DATABASE=competencias \
    MYSQL_ROOT_PASSWORD=egresados2013

# Indica que apenas se ejecute mysql va a correr este archivo que llena de datos la BD
ADD script-completo.sql /docker-entrypoint-initdb.d

# Indica el puerto por default de mysql
EXPOSE 3306
