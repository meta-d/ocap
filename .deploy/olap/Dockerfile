ARG OLAP_VERSION
ARG REDIS_HOST
ARG REDIS_PORT
ARG REDIS_PASSWORD
ARG REDIS_DATABASE

# ==================================================== Stage ==========================================================#
FROM maven:3.8-openjdk-11 AS build

WORKDIR /app

# COPY .deploy/olap/settings.xml /usr/share/maven/ref/
COPY packages/olap/pom.xml ./pom.xml
RUN mvn -B -s /usr/share/maven/ref/settings.xml dependency:resolve

COPY packages/olap/src ./src
RUN mvn -B -s /usr/share/maven/ref/settings.xml clean install

# ==================================================== Stage ==========================================================#
FROM adoptopenjdk:11-jre-hotspot AS webapp

WORKDIR /app

COPY --from=build /app/target/olap-0.0.1-SNAPSHOT.jar /app/app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
