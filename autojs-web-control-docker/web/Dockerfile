FROM node:14 as web-builder

COPY . /web

WORKDIR /web
RUN npm config set registry=https://registry.npm.taobao.org
RUN npm install
RUN npm run build:prod

# production environment
FROM nginx:1.16.0-alpine

RUN rm -v /etc/nginx/conf.d/default.conf
ADD default.conf /etc/nginx/conf.d/
COPY --from=web-builder /web/dist /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]

