# YouTube Live Stream Manager

This is a Node.js application that converts YouTube live streams into HLS (HTTP Live Streaming) format, allowing you to access them through an M3U8 playlist.

## Features
- Convert YouTube live streams to HLS format using FFmpeg.
- Serve the M3U8 playlist and segments through an Express server.
- Web panel to manage multiple streams and add new ones.
- SQLite database for storing stream metadata.

## Requirements

- **Node.js**: The application is built using Node.js. Ensure you have Node.js (v16.x or higher) installed.
- **FFmpeg**: Used for encoding and segmenting the video stream.
- **SQLite3**: For storing stream data locally.

## Installation

### 1. Clone the repository (or download the files):
Clone the repository to your server or local machine.

```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Run the setup script:
To install the necessary dependencies and set up the environment, run the `setup.sh` script:

```bash
chmod +x setup.sh
./setup.sh
```

This script will:
- Install **Node.js**, **FFmpeg**, and **SQLite3** if not already installed.
- Install project dependencies using `npm`.
- Create the necessary directories (e.g., `output` for HLS segments).
- Set up the SQLite database for storing stream metadata.
- Start the server by running `node app.js`.

### 3. Access the Web Panel:
Once the setup is complete, navigate to your server’s IP address or `localhost` on port `3000`:

```
http://<ipvps>:3000
```

You’ll be able to:
- View and manage active streams.
- Add new YouTube URLs with custom names (namelive).
  
### 4. Stopping the Application:
To stop the application, simply press `Ctrl + C` in your terminal where the server is running.

## Notes

- The **HLS stream** can be accessed via a URL like:
  
  ```
  http://<ipvps>:3000/hls/mtslive/<namelive>.m3u8
  ```

- **Security**: Ensure that you secure the server if running in a production environment (e.g., using HTTPS, setting up authentication).
- **Database**: The SQLite database (`streams.db`) stores stream information, including YouTube URLs, stream names, and playlist names.

## Troubleshooting

- **FFmpeg errors**: Ensure that FFmpeg is installed correctly and that the required codecs are supported.
- **No streams in the database**: If you encounter issues where streams are not being listed, check the database (`streams.db`) for entries and ensure the table is properly created.

## Installation
  ```
  curl -sL https://raw.githubusercontent.com/wayangkulit95/ytl/main/setup.sh -o setup.sh && chmod +x setup.sh && ./setup.sh
  ```
  
## License
This project is licensed under the MIT License.
