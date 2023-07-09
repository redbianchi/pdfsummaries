bashCopy code
# Use the official Node.js image as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /my-express-server

# Copy the application files into the working directory
COPY COPY package*.json ./

# Install the application dependencies
RUN npm install express axios multer pdf-parse fs path

# Define the entry point for the container
CMD ["node", "index.js"]