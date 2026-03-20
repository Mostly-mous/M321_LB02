#Dockerfile for frontend
FROM nginx:alpine

COPY index.html style.css client.js usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
