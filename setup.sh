#!/bin/bash

# Update and upgrade system
echo "Updating system..."
sudo apt update && sudo apt upgrade -y

# Install dependencies
echo "Installing Node.js, FFmpeg, Git, and Nginx..."
sudo apt install -y curl ffmpeg git nginx sqlite3

# Install Node.js (LTS version 18)
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Create package.json if it doesn't exist
echo "Creating package.json..."
cat <<EOF > package.json
{
  "name": "youtube-live-manager",
  "version": "1.0.0",
  "description": "A Node.js application to manage YouTube live streams and create HLS/DASH streams.",
  "main": "app.js",
  "scripts": {
    "start": "node app.js"
  },
  "dependencies": {
    "express": "^4.18.1",
    "body-parser": "^1.19.0",
    "sqlite3": "^5.0.2",
    "ffmpeg-static": "^4.4.0",
    "ejs": "^3.1.8",
    "child_process": "^1.0.2"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "author": "Your Name",
  "license": "MIT"
}
EOF

# Install application dependencies (from package.json)
echo "Installing Node.js dependencies..."
npm install

# Create SQLite database if not exists
echo "Creating SQLite database..."
touch streams.db

# Create necessary directories for HLS/DASH streaming
echo "Creating directories for HLS streams..."
mkdir -p public/hls

# Start the application using Node.js
echo "Starting the application..."
node app.js &

# Set up Nginx as a reverse proxy (Optional)
echo "Setting up Nginx..."
sudo cp ./nginx-config /etc/nginx/sites-available/youtube-live
sudo ln -s /etc/nginx/sites-available/youtube-live /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Firewall Configuration (allow traffic on port 3000)
echo "Configuring firewall to allow port 3000..."
sudo ufw allow 3000
sudo ufw allow 'Nginx Full'

# Check if everything is set up properly
echo "Setup complete! You can now access your app at http://<your-vps-ip>:3000 or your domain."
