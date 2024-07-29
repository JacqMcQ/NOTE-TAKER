const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to get notes
app.get('/api/notes', (req, res) => {
  fs.readFile('./db/db.json', (err, data) => {
    if (err) {
      console.error('Failed to load notes:', err);
      res.status(500).json({ error: 'Failed to load notes' });
    } else {
      res.json(JSON.parse(data));
    }
  });
});

// API endpoint to save a new note
app.post('/api/notes', express.json(), (req, res) => {
  fs.readFile('./db/db.json', (err, data) => {
    if (err) {
      console.error('Failed to save note:', err);
      res.status(500).json({ error: 'Failed to save note' });
    } else {
      const notes = JSON.parse(data);
      const newNote = req.body;
      notes.push(newNote);
      fs.writeFile('./db/db.json', JSON.stringify(notes), (err) => {
        if (err) {
          console.error('Failed to save note:', err);
          res.status(500).json({ error: 'Failed to save note' });
        } else {
          res.json(newNote);
        }
      });
    }
  });
});

// API endpoint to delete a note
app.delete('/api/notes/:id', (req, res) => {
  fs.readFile('./db/db.json', (err, data) => {
    if (err) {
      console.error('Failed to delete note:', err);
      res.status(500).json({ error: 'Failed to delete note' });
    } else {
      const notes = JSON.parse(data);
      const noteId = req.params.id;
      const updatedNotes = notes.filter(note => note.id !== noteId);
      fs.writeFile('./db/db.json', JSON.stringify(updatedNotes), (err) => {
        if (err) {
          console.error('Failed to delete note:', err);
          res.status(500).json({ error: 'Failed to delete note' });
        } else {
          res.json({ id: noteId });
        }
      });
    }
  });
});

// Serve the main HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'notes.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});