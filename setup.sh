#!/bin/bash

# Exit on error
set -e

# Display a message
echo "Starting setup..."

# 1. Update and install dependencies
echo "Updating system packages..."
sudo apt update -y
sudo apt upgrade -y

# Install Node.js if not already installed
echo "Checking if Node.js is installed..."
if ! command -v node &> /dev/null
then
    echo "Node.js not found, installing..."
    # Install Node.js from the NodeSource repository (LTS version)
    curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo "Node.js is already installed."
fi

# Install SQLite3 if not already installed
echo "Checking if SQLite3 is installed..."
if ! command -v sqlite3 &> /dev/null
then
    echo "SQLite3 not found, installing..."
    sudo apt install -y sqlite3
else
    echo "SQLite3 is already installed."
fi

# Install FFmpeg if not already installed
echo "Checking if FFmpeg is installed..."
if ! command -v ffmpeg &> /dev/null
then
    echo "FFmpeg not found, installing..."
    sudo apt install -y ffmpeg
else
    echo "FFmpeg is already installed."
fi

# 3. Create 'output' directory for HLS files if it doesn't exist
echo "Creating 'output' directory for HLS files..."
mkdir -p output

# 4. Set up SQLite database and tables
echo "Setting up SQLite database..."
sqlite3 streams.db "CREATE TABLE IF NOT EXISTS streams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  namelive TEXT NOT NULL,
  url TEXT NOT NULL,
  playlist TEXT NOT NULL,
  segment_pattern TEXT NOT NULL
);"

# 5. Ensure necessary file permissions
echo "Ensuring correct file permissions..."
chmod -R 755 .
chmod -R 777 output

# 6. Start the app
echo "Starting the app..."
node app.js

# Display message with next steps
echo "Setup completed successfully!"
echo "The application is now running. To stop the app, use the following command:"
echo "  - To stop the app: Ctrl + C"
