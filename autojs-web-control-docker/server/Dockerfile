FROM node:14 

COPY . /server
WORKDIR /server


RUN  npm config set registry=https://registry.npm.taobao.org 
RUN  npm install 
# RUN  npm run build

CMD ["npm","run","start"]