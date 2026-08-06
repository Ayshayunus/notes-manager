const overlay = document.getElementById("overlay");
const addModal = document.getElementById("addModal");
const editModal = document.getElementById("editModal");
const deleteModal = document.getElementById("deleteModal");

const addNoteBtn = document.querySelector(".add-btn");
const saveBtn = document.getElementById("saveBtn");
const updateBtn = document.getElementById("updateBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const closeButtons = document.querySelectorAll(".close-btn");

let notes = [];
let currentId = null;

function saveNotes() {
  localStorage.setItem("notes", JSON.stringify(notes));
}

function loadNotes() {

  showLoading();

  setTimeout(() => {

    const storedNotes = localStorage.getItem("notes");

    if (storedNotes) {
      notes = JSON.parse(storedNotes);
    } else {
      notes = [
        {
          id: 1,
          title: "Project Meeting",
          description: "Discuss the new frontend requirements and project timeline.",
          priority: "high",
          date: "4 Aug 2025, 10:30 AM"
        },
        {
          id: 2,
          title: "Shopping List",
          description: "Buy groceries: Milk, Bread, Eggs, Fruits.",
          priority: "low",
          date: "3 Aug 2025, 6:45 PM"
        },
        {
          id: 3,
          title: "Learning Goals",
          description: "Learn React in depth and build real-world projects.",
          priority: "medium",
          date: "2 Aug 2025, 9:15 AM"
        }
      ];

      saveNotes();
    }

    renderNotes();
    hideLoading();
  }, 1000);

}

function renderNotes() {
  const grid = document.querySelector(".notes-grid");

  grid.innerHTML = "";

  notes.forEach(note => {

    const card = document.createElement("div");

    card.className = "note-card";

    card.dataset.id = note.id;

    card.innerHTML = `
      <div class="note-header">
        <span class="note-title">${note.title}</span>
        <span class="badge badge-${note.priority}">
          ${note.priority.charAt(0).toUpperCase() + note.priority.slice(1)}
        </span>
      </div>

      <div class="note-desc">
        ${note.description}
      </div>

      <div class="note-footer">
        <span>${note.date}</span>

        <div class="note-update">
          <img src="images/edit.png">
          <img src="images/trash-red.png">
        </div>
      </div>
    `;

    grid.appendChild(card);
    addCardListeners(card);

  });

  filterNotes(activeFilter);
}

let currentCard = null;
let activeFilter = "all";

function openModal(modal) {
  overlay.classList.add("show");
  modal.classList.add("show");
}

function closeModal() {
  overlay.classList.remove("show");
  addModal.classList.remove("show");
  editModal.classList.remove("show");
  deleteModal.classList.remove("show");
}

closeButtons.forEach(button => {
  button.addEventListener("click", closeModal);
});

addNoteBtn.addEventListener("click", () => {
  document.getElementById("addTitle").value = "";
  document.getElementById("addDesc").value = "";
  document.getElementById("addPriority").value = "";
  openModal(addModal);
});

saveBtn.addEventListener("click", () => {

  const title = document.getElementById("addTitle").value.trim();
  const desc = document.getElementById("addDesc").value.trim();
  const priority = document.getElementById("addPriority").value;

  const addError = document.getElementById("addError");

  if (!title || !desc || !priority) {
    addError.textContent = "⚠ Please fill in all required fields.";
    addError.style.display = "block";

    setTimeout(() => {
      addError.style.display = "none";
    }, 3000);

    return;
  }

  addError.style.display = "none";

  const dateTime = new Date().toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  notes.push({
    id: Date.now(),
    title,
    description: desc,
    priority,
    date: dateTime
  });

  saveNotes();
  renderNotes();
  closeModal();

});


function addCardListeners(card) {
  const editIcon = card.querySelector(".note-update img:first-child");
  const deleteIcon = card.querySelector(".note-update img:last-child");

  editIcon.addEventListener("click", () => {
    currentId = Number(card.dataset.id);

    document.getElementById("editTitle").value =
      card.querySelector(".note-title").innerText;

    document.getElementById("editDesc").value =
      card.querySelector(".note-desc").innerText;

    const badge = card.querySelector(".badge");

    if (badge.classList.contains("badge-high")) {
      document.getElementById("editPriority").value = "high";
    } else if (badge.classList.contains("badge-medium")) {
      document.getElementById("editPriority").value = "medium";
    } else {
      document.getElementById("editPriority").value = "low";
    }

    openModal(editModal);
  });

  deleteIcon.addEventListener("click", () => {
    currentId = Number(card.dataset.id);
    openModal(deleteModal);
  });
}

document.querySelectorAll(".note-card").forEach(addCardListeners);

updateBtn.addEventListener("click", () => {

  const note = notes.find(n => n.id === currentId);

  if (!note) return;

  note.title = document.getElementById("editTitle").value.trim();
  note.description = document.getElementById("editDesc").value.trim();
  note.priority = document.getElementById("editPriority").value;

  saveNotes();
  renderNotes();
  closeModal();

});

confirmDeleteBtn.addEventListener("click", () => {
  notes = notes.filter(note => note.id !== currentId);

  saveNotes();
  renderNotes();
  closeModal();
});

const menuItems = document.querySelectorAll(".menu-item");

menuItems.forEach(item => {
  item.addEventListener("click", function () {
    menuItems.forEach(menu => menu.classList.remove("active"));

    this.classList.add("active");
    activeFilter = this.dataset.filter;

    filterNotes(activeFilter);
  });
});

function filterNotes(filter) {
  document.querySelectorAll(".note-card").forEach(card => {
    if (filter === "all") {
      card.style.display = "block";
    } else {
      const matches = card
        .querySelector(".badge")
        .classList.contains(`badge-${filter}`);

      card.style.display = matches ? "block" : "none";
    }
  });
}

const searchBar = document.querySelector(".search-bar");

searchBar.addEventListener("input", () => {
  const searchText = searchBar.value.toLowerCase();

  document.querySelectorAll(".note-card").forEach(card => {
    const title = card.querySelector(".note-title").innerText.toLowerCase();

    card.style.display = title.includes(searchText) ? "block" : "none";
  });
});

const menuBtn = document.getElementById("menuBtn");
const sidebar = document.querySelector(".sidebar");

menuBtn.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  menuBtn.classList.toggle("active");
});

menuItems.forEach(item => {
  item.addEventListener("click", () => {
    sidebar.classList.remove("open");
    menuBtn.classList.remove("active");
  });
});

const loading = document.getElementById("loading");

function showLoading() {
  loading.style.display = "flex";
}

function hideLoading() {
  loading.style.display = "none";
}

loadNotes();