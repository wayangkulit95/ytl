const ffmpeg = require('fluent-ffmpeg');
const express = require('express');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

// Directory to store the HLS segment files
const OUTPUT_DIR = path.join(__dirname, 'output');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

// Initialize SQLite database
const db = new sqlite3.Database('./streams.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Create table to store stream data if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS streams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    namelive TEXT NOT NULL,
    url TEXT NOT NULL,
    playlist TEXT NOT NULL,
    segment_pattern TEXT NOT NULL
  )
`);

// Serve static files from the 'output' directory
app.use(express.static(OUTPUT_DIR));

// Middleware to parse URL-encoded data (for form submission)
app.use(express.urlencoded({ extended: true }));

// Route to display the web panel and active streams
app.get('/', (req, res) => {
  db.all('SELECT * FROM streams', (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Internal Server Error');
    }

    // Generate list of active streams from the database
    let streamListHTML = rows.map((stream) => {
      return `
        <li>
          <a href="/hls/mtslive/${stream.namelive}.m3u8">${stream.namelive} - HLS Stream</a>
          <a href="/stop/${stream.id}" style="color: red;">Stop</a>
        </li>
      `;
    }).join('');

    res.send(`
      <h1>YouTube Live Stream Manager</h1>
      <h2>Active Streams</h2>
      <ul>
        ${streamListHTML}
      </ul>

      <h2>Add New Stream</h2>
      <form action="/add" method="POST">
        <label for="namelive">Stream Name (namelive):</label>
        <input type="text" id="namelive" name="namelive" required>
        <label for="url">YouTube Live URL:</label>
        <input type="text" id="url" name="url" required>
        <button type="submit">Add Stream</button>
      </form>
    `);
  });
});

// Route to handle adding a new stream
app.post('/add', (req, res) => {
  const { namelive, url: youtubeUrl } = req.body;
  
  // Create a unique name for the M3U8 playlist file
  const playlistName = `${namelive}.m3u8`;
  const segmentFilename = path.join(OUTPUT_DIR, `stream_${Date.now()}_%03d.ts`);

  // Insert the new stream into the database
  db.run('INSERT INTO streams (namelive, url, playlist, segment_pattern) VALUES (?, ?, ?, ?)', 
    [namelive, youtubeUrl, playlistName, segmentFilename], function(err) {
      if (err) {
        console.error('Error inserting stream:', err.message);
        return res.status(500).send('Internal Server Error');
      }

      // Start streaming using ffmpeg
      ffmpeg(youtubeUrl)
        .outputOptions([
          '-c:v libx264',
          '-c:a aac',
          '-preset fast',
          '-f hls',
          `-hls_time 10`,
          `-hls_list_size 6`,
          `-hls_wrap 10`,
          `-hls_segment_filename ${segmentFilename}`,
        ])
        .output(path.join(OUTPUT_DIR, playlistName))
        .on('end', () => {
          console.log(`Stream for ${youtubeUrl} finished.`);
        })
        .on('error', (err) => {
          console.error(`Error for ${youtubeUrl}:`, err);
        })
        .run();

      // Redirect back to the main page
      res.redirect('/');
  });
});

// Route to serve M3U8 file for the live stream
app.get('/hls/mtslive/:namelive.m3u8', (req, res) => {
  const namelive = req.params.namelive;

  // Query the database to find the stream details
  db.get('SELECT playlist FROM streams WHERE namelive = ?', [namelive], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Internal Server Error');
    }

    if (!row) {
      return res.status(404).send('Stream not found');
    }

    // Serve the M3U8 file
    res.sendFile(path.join(OUTPUT_DIR, row.playlist));
  });
});

// Route to stop a stream
app.get('/stop/:id', (req, res) => {
  const streamId = req.params.id;
  
  // Get stream details from the database
  db.get('SELECT * FROM streams WHERE id = ?', [streamId], (err, stream) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Internal Server Error');
    }

    if (!stream) {
      return res.status(404).send('Stream not found');
    }

    // Delete the stream's M3U8 playlist and segment files
    const playlistPath = path.join(OUTPUT_DIR, stream.playlist);
    fs.unlinkSync(playlistPath);  // Delete the M3U8 playlist
    fs.readdirSync(OUTPUT_DIR).forEach(file => {
      if (file.startsWith('stream_') && file.endsWith('.ts')) {
        fs.unlinkSync(path.join(OUTPUT_DIR, file));  // Delete the .ts segment files
      }
    });

    // Remove the stream from the database
    db.run('DELETE FROM streams WHERE id = ?', [streamId], (err) => {
      if (err) {
        console.error('Error deleting stream:', err.message);
        return res.status(500).send('Internal Server Error');
      }

      console.log(`Stream with ID ${streamId} has been stopped.`);
      res.redirect('/');
    });
  });
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
