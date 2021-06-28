// * Book Model

class Book {
  constructor(title, author, year, isComplete) {
    this.id = Date.now();
    this.title = title;
    this.author = author;
    this.year = parseInt(year);
    this.isComplete = isComplete;
  }
}

// * Local Storage

const getBooks = () => JSON.parse(localStorage.getItem('books'));

const addBook = (book) => {
  let books = getBooks();
  if (!books) {
    books = [book];
  } else {
    books.push(book);
  }
  localStorage.setItem('books', JSON.stringify(books));
};

const getBooksRead = () => {
  const books = getBooks();
  if (!books) return [];
  return books.filter((book) => book.isComplete);
};

const getBooksUnread = () => {
  const books = getBooks();
  if (!books) return [];
  return books.filter((book) => !book.isComplete);
};

const switchBookshelf = (id) => {
  const books = getBooks();
  if (books) {
    const bookTargetIndex = books.findIndex((book) => book.id === id);
    if (bookTargetIndex > -1) {
      const temp = [...books];
      temp[bookTargetIndex].isComplete = !temp[bookTargetIndex].isComplete;
      localStorage.setItem('books', JSON.stringify(temp));
    }
  }
};

const removeBook = (id) => {
  const books = getBooks();
  if (books) {
    const bookTargetIndex = books.findIndex((book) => book.id === id);
    if (bookTargetIndex > -1) {
      const temp = [...books];
      temp.splice(bookTargetIndex, 1);
      localStorage.setItem('books', JSON.stringify(temp));
    }
  }
};

const getBook = (id) => {
  const books = getBooks();
  if (books) {
    const bookTarget = books.find((book) => book.id === id);
    return bookTarget || null;
  }
};

const editBook = (id, title, author, year, isComplete) => {
  const books = getBooks();
  if (books) {
    const bookTargetIndex = books.findIndex((book) => book.id === parseInt(id));
    if (bookTargetIndex > -1) {
      const temp = [...books];
      temp[bookTargetIndex].title = title;
      temp[bookTargetIndex].author = author;
      temp[bookTargetIndex].year = year;
      temp[bookTargetIndex].isComplete = isComplete;
      localStorage.setItem('books', JSON.stringify(temp));
    }
  }
};

// * Bookshelf

const [unreadBookshelf, readBookshelf] = [
  ...document.querySelectorAll('.bookshelf'),
];

const buttons = [
  // {
  //   bookId: Date.now(),  // not unique, because every book has 3 buttons
  //   element: button,
  //   type: 'read' || 'unread',
  // }
];

function buttonSwitchListener(e) {
  const bookId = parseInt(e.target.getAttribute('data-book-id'));
  switchBookshelf(bookId);
  load('read');
  load('unread');
}

function buttonEditListener(e) {
  const bookId = parseInt(e.target.getAttribute('data-book-id'));
  const book = getBook(bookId);
  setForm(bookId, book.title, book.author, book.year, book.isComplete);
}

function buttonDeleteListener(e) {
  const bookId = parseInt(e.target.getAttribute('data-book-id'));

  const willDeleteButtons = buttons
    .filter((object) => object.bookId === bookId)
    .map((object) => object.element);

  for (let button of willDeleteButtons) {
    if (button.classList[0].toLowerCase() === 'btn-switch') {
      button.removeEventListener('click', buttonSwitchListener);
    } else if (button.classList[0].toLowerCase() === 'btn-edit') {
      button.removeEventListener('click', buttonEditListener);
    } else if (button.classList[0].toLowerCase() === 'btn-delete') {
      button.removeEventListener('click', buttonDeleteListener);
    }
  }

  removeBook(bookId);

  load('read');
  load('unread');
}

// type = 'read' || 'unread'
function removeButtonListeners(type) {
  const filteredButtons = buttons
    .filter((object) => object.type.toLowerCase() === type.toLowerCase())
    .map((object) => object.element);

  for (let button of filteredButtons) {
    const buttonClassList = [...button.classList];
    if (buttonClassList[0].toLowerCase() === 'btn-switch') {
      button.removeEventListener('click', buttonSwitchListener);
    } else if (buttonClassList[0].toLowerCase() === 'btn-edit') {
      button.removeEventListener('click', buttonEditListener);
    } else if (buttonClassList[0].toLowerCase() === 'btn-delete') {
      button.removeEventListener('click', buttonDeleteListener);
    }
  }
}

// type = 'read' || 'unread'
function load(type, searchInput) {
  removeButtonListeners(type);

  let books = type.toLowerCase() === 'read' ? getBooksRead() : getBooksUnread();
  if (searchInput)
    books = books.filter((book) =>
      book.title.toLowerCase().includes(searchInput.toLowerCase()),
    );

  let listOfBooksString = '';

  if (Array.isArray(books) && books.length > 0) {
    for (const book of books) {
      listOfBooksString += `<div class="book ${type}">
          <div class="book-title">${book.title}</div>
          <div class="book-author">Penulis: ${book.author}</div>
          <div class="book-year">Tahun: ${book.year}</div>
          <div class="book-options">
            <div class="button-wrapper">
              <button data-book-id="${book.id}" class="btn-switch bg-success text-white">Pindah</button>
            </div>
            <div class="button-wrapper">
              <button data-book-id="${book.id}" class="btn-edit bg-warning text-dark">Edit</button>
            </div>
            <div class="button-wrapper">
              <button data-book-id="${book.id}" class="btn-delete bg-danger text-white">Hapus</button>
            </div>
          </div>
        </div>`;
    }

    if (type.toLowerCase() === 'read') {
      readBookshelf.innerHTML = listOfBooksString;
    } else {
      unreadBookshelf.innerHTML = listOfBooksString;
    }

    const buttonsSwitch = document.querySelectorAll(
      `.book.${type} button.btn-switch`,
    );
    for (let button of buttonsSwitch) {
      button.addEventListener('click', buttonSwitchListener);
      const bookId = parseInt(button.getAttribute('data-book-id'));
      buttons.push({ bookId, element: button, type });
    }

    const buttonsEdit = document.querySelectorAll(
      `.book.${type} button.btn-edit`,
    );
    for (let button of buttonsEdit) {
      button.addEventListener('click', buttonEditListener);
      const bookId = parseInt(button.getAttribute('data-book-id'));
      buttons.push({ bookId, element: button, type });
    }

    const buttonsDelete = document.querySelectorAll(
      `.book.${type} button.btn-delete`,
    );
    for (let button of buttonsDelete) {
      button.addEventListener('click', buttonDeleteListener);
      const bookId = parseInt(button.getAttribute('data-book-id'));
      buttons.push({ bookId, element: button, type });
    }
  } else {
    if (type.toLowerCase() === 'read') {
      readBookshelf.innerHTML =
        '<div style="width:100%; height:100%; display:flex; justify-content:center; align-items:center; font-size:0.85em; color:rgb(100,100,100);">Tidak ada buku di rak ini.</div>';
    } else {
      unreadBookshelf.innerHTML =
        '<div style="width:100%; height:100%; display:flex; justify-content:center; align-items:center; font-size:0.85em; color:rgb(100,100,100);">Tidak ada buku di rak ini.</div>';
    }
  }
}

load('unread');
load('read');

// * Form

const formElement = document.querySelector('form');

const bookIdElement = document.querySelector('input[name="bookId"]');
const titleElement = document.querySelector('#title');
const authorElement = document.querySelector('#author');
const yearElement = document.querySelector('#year');
const isCompleteElement = document.querySelector('#isComplete');

const formTitleElement = document.querySelector('#form-title');
const buttonSubmit = document.querySelector('button[type="submit"]');

function clearForm() {
  bookIdElement.value = null;
  titleElement.value = null;
  authorElement.value = null;
  yearElement.value = null;
  isCompleteElement.checked = false;

  formTitleElement.innerText = 'Masukkan Buku Baru';
  buttonSubmit.innerText = 'Simpan Buku';
  buttonSubmit.classList.remove('bg-warning', 'text-dark');
  buttonSubmit.classList.add('bg-primary', 'text-white');
}

function setForm(bookId, title, author, year, isComplete) {
  bookIdElement.value = bookId;
  titleElement.value = title;
  authorElement.value = author;
  yearElement.value = year;
  isCompleteElement.checked = isComplete;

  formTitleElement.innerText = 'Edit Data Buku';
  buttonSubmit.innerText = 'Edit';
  buttonSubmit.classList.remove('bg-primary', 'text-white');
  buttonSubmit.classList.add('bg-warning', 'text-dark');
}

formElement.addEventListener('submit', (e) => {
  e.preventDefault();
  const [bookId, title, author, year, isComplete] = [...e.target];

  if (bookId.value === '') {
    const newBook = new Book(
      title.value,
      author.value,
      year.value,
      isComplete.checked,
    );

    addBook(newBook);

    if (isComplete.checked) {
      load('read');
    } else {
      load('unread');
    }
  } else {
    editBook(
      bookId.value,
      title.value,
      author.value,
      year.value,
      isComplete.checked,
    );

    load('unread');
    load('read');
  }

  clearForm();
});

// * Search

const searchElement = document.querySelector('#search');

searchElement.addEventListener('input', function (e) {
  const input = e.target.value;
  load('unread', input);
  load('read', input);
});
