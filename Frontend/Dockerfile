# Use the official Nginx image
FROM nginx:alpine

# Remove the default Nginx configuration file
RUN rm /etc/nginx/conf.d/default.conf

# Copy your custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy your frontend static files into the Nginx web root
COPY . /usr/share/nginx/html

# Expose port 80 (default HTTP port for Nginx)
EXPOSE 80

# Command to start Nginx (default for nginx image)
CMD ["nginx", "-g", "daemon off;"]