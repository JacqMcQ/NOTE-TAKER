document.addEventListener('DOMContentLoaded', () => {
  let noteForm;
  let noteTitle;
  let noteText;
  let saveNoteBtn;
  let newNoteBtn;
  let clearBtn;
  let noteList;

  // Show an element
  const show = (elem) => {
    elem.style.display = 'inline';
  };

  // Hide an element
  const hide = (elem) => {
    elem.style.display = 'none';
  };

  // Active note is used to keep track of the note in the textarea
  let activeNote = {};

  // Fetch all notes
  const getNotes = () =>
    fetch('/api/notes', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

  // Save a new note
  const saveNote = (note) =>
    fetch('/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(note),
    });

  // Delete a note
  const deleteNote = (id) =>
    fetch(`/api/notes/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

  // Render the currently active note
  const renderActiveNote = () => {
    hide(saveNoteBtn);
    hide(clearBtn);

    if (activeNote.id) {
      show(newNoteBtn);
      noteTitle.setAttribute('readonly', true);
      noteText.setAttribute('readonly', true);
      noteTitle.value = activeNote.title;
      noteText.value = activeNote.text;
    } else {
      show(clearBtn); // Ensure the clear button is shown when creating a new note
      noteTitle.removeAttribute('readonly');
      noteText.removeAttribute('readonly');
      noteTitle.value = '';
      noteText.value = '';
    }
  };

  // Handle saving a note
  const handleNoteSave = () => {
    const newNote = {
      title: noteTitle.value,
      text: noteText.value,
    };
    saveNote(newNote).then(() => {
      getAndRenderNotes();
      renderActiveNote();
    }).catch((error) => console.error('Error saving note:', error));
  };

  // Handle deleting a note
  const handleNoteDelete = (e) => {
    e.stopPropagation();
    const note = e.target;
    const noteId = JSON.parse(note.parentElement.getAttribute('data-note')).id;

    if (activeNote.id === noteId) {
      activeNote = {};
    }

    deleteNote(noteId).then(() => {
      getAndRenderNotes();
      renderActiveNote();
    }).catch((error) => console.error('Error deleting note:', error));
  };

  // Handle viewing a note
  const handleNoteView = (e) => {
    e.preventDefault();
    activeNote = JSON.parse(e.target.parentElement.getAttribute('data-note'));
    renderActiveNote();
  };

  // Handle creating a new note
  const handleNewNoteView = (e) => {
    activeNote = {};
    show(clearBtn);  // Ensure the clear button is visible when creating a new note
    renderActiveNote();
  };

  // Handle rendering buttons based on form input
  const handleRenderBtns = () => {
    if (noteTitle.value.trim() && noteText.value.trim()) {
      show(saveNoteBtn);
    } else {
      hide(saveNoteBtn);
    }
  };

  // Render the list of notes
  const renderNoteList = async (notes) => {
    try {
      const jsonNotes = await notes.json();
      console.log('Notes received:', jsonNotes); // Log the received data

      // Ensure jsonNotes is an array
      if (!Array.isArray(jsonNotes)) {
        throw new Error('Notes data is not an array');
      }

      if (window.location.pathname === '/notes') {
        noteList[0].innerHTML = ''; // Clear existing notes
      }

      let noteListItems = [];

      // Create list item HTML element
      const createLi = (text, delBtn = true) => {
        const liEl = document.createElement('li');
        liEl.classList.add('list-group-item');

        const spanEl = document.createElement('span');
        spanEl.classList.add('list-item-title');
        spanEl.innerText = text;
        spanEl.addEventListener('click', handleNoteView);

        liEl.append(spanEl);

        if (delBtn) {
          const delBtnEl = document.createElement('i');
          delBtnEl.classList.add(
            'fas',
            'fa-trash-alt',
            'float-right',
            'text-danger',
            'delete-note'
          );
          delBtnEl.addEventListener('click', handleNoteDelete);

          liEl.append(delBtnEl);
        }

        return liEl;
      };

      if (jsonNotes.length === 0) {
        noteListItems.push(createLi('No saved Notes', false));
      }

      jsonNotes.forEach((note) => {
        const li = createLi(note.title);
        li.dataset.note = JSON.stringify(note);

        noteListItems.push(li);
      });

      if (window.location.pathname === '/notes') {
        noteListItems.forEach((note) => noteList[0].append(note));
      }
    } catch (error) {
      console.error('Error rendering note list:', error);
    }
  };

  const getAndRenderNotes = () => getNotes().then(renderNoteList).catch((error) => console.error('Error fetching notes:', error));

  if (window.location.pathname === '/notes') {
    noteForm = document.querySelector('.note-form');
    noteTitle = document.querySelector('.note-title');
    noteText = document.querySelector('.note-textarea');
    saveNoteBtn = document.querySelector('.save-note');
    newNoteBtn = document.querySelector('.new-note');
    clearBtn = document.querySelector('.clear-btn');
    noteList = document.querySelectorAll('.list-container .list-group');

    // Initially hide the "Save Note" button
    hide(saveNoteBtn);

    if (saveNoteBtn) saveNoteBtn.addEventListener('click', handleNoteSave);
    if (newNoteBtn) newNoteBtn.addEventListener('click', handleNewNoteView);
    if (clearBtn) clearBtn.addEventListener('click', () => {
      noteTitle.value = '';
      noteText.value = '';
      renderActiveNote();
    });
    if (noteForm) noteForm.addEventListener('input', handleRenderBtns);

    renderActiveNote();
  }

  // Fetch and render notes initially
  getAndRenderNotes();
});
