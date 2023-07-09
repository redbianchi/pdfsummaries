
# Use the official Node.js image as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy the application files into the working directory
COPY . /app/
# package*.json ./

# Install the application dependencies
RUN npm install 
# express axios multer pdf-parse fs path

# Define the entry point for the container
CMD ["node", "/app/index.js"]

# Expose the port
EXPOSE 3000