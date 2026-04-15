const tasks = [];
let currentColumn = "";
let editingTaskId = null;
let nextTaskId = 1;

const taskCounter = document.getElementById("taskCounter");
const priorityFilter = document.getElementById("priorityFilter");

const todoList = document.getElementById("todoList");
const inprogressList = document.getElementById("inprogressList");
const doneList = document.getElementById("doneList");

const taskModal = document.getElementById("taskModal");
const modalTitle = document.getElementById("modalTitle");

const taskTitleInput = document.getElementById("taskTitle");
const taskDescriptionInput = document.getElementById("taskDescription");
const taskPriorityInput = document.getElementById("taskPriority");
const taskDueDateInput = document.getElementById("taskDueDate");

const saveTaskBtn = document.getElementById("saveTaskBtn");
const cancelTaskBtn = document.getElementById("cancelTaskBtn");
const clearDoneBtn = document.getElementById("clearDoneBtn");

const addTaskButtons = document.querySelectorAll(".add-task-btn");

function openModal() {
  taskModal.classList.remove("hidden");
}

function closeModal() {
  taskModal.classList.add("hidden");
}

function clearModalFields() {
  taskTitleInput.value = "";
  taskDescriptionInput.value = "";
  taskPriorityInput.value = "low";
  taskDueDateInput.value = "";
}

function updateTaskCounter() {
  taskCounter.textContent = "Total Tasks: " + tasks.length;
}

function createTaskCard(task) {
  const li = document.createElement("li");
  li.classList.add("task-card");
  li.setAttribute("data-id", task.id);
  li.setAttribute("data-priority", task.priority);

  const title = document.createElement("span");
  title.classList.add("task-title");
  title.setAttribute("data-id", task.id);
  title.textContent = task.title;

  const description = document.createElement("p");
  description.classList.add("task-description");
  description.textContent = task.description;

  const priority = document.createElement("span");
  priority.classList.add("task-priority");
  priority.textContent = "Priority: " + task.priority;

  const dueDate = document.createElement("span");
  dueDate.classList.add("task-due");
  dueDate.textContent = "Due: " + task.dueDate;

  const buttonWrapper = document.createElement("div");
  buttonWrapper.classList.add("task-actions");

  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.setAttribute("data-action", "edit");
  editBtn.setAttribute("data-id", task.id);

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.setAttribute("data-action", "delete");
  deleteBtn.setAttribute("data-id", task.id);

  buttonWrapper.appendChild(editBtn);
  buttonWrapper.appendChild(deleteBtn);

  li.appendChild(title);
  li.appendChild(description);
  li.appendChild(priority);
  li.appendChild(dueDate);
  li.appendChild(buttonWrapper);

  return li;
}

function addTask(columnId, taskObj) {
  const card = createTaskCard(taskObj);

  if (columnId === "todo") {
    todoList.appendChild(card);
  } else if (columnId === "inprogress") {
    inprogressList.appendChild(card);
  } else if (columnId === "done") {
    doneList.appendChild(card);
  }

  updateTaskCounter();
}

function deleteTask(taskId, cardElement) {
  const taskIndex = tasks.findIndex(function(task) {
    return task.id === taskId;
  });

  if (taskIndex === -1) return;

  tasks.splice(taskIndex, 1);

  if (cardElement) {
    cardElement.classList.add("fade-out");

    setTimeout(function() {
      cardElement.remove();
      updateTaskCounter();
    }, 300);
  } else {
    updateTaskCounter();
  }
}

function editTask(taskId) {
  const task = tasks.find(function(t) {
    return t.id === taskId;
  });

  if (!task) return;

  editingTaskId = taskId;
  currentColumn = task.column;

  taskTitleInput.value = task.title;
  taskDescriptionInput.value = task.description;
  taskPriorityInput.value = task.priority;
  taskDueDateInput.value = task.dueDate;

  modalTitle.textContent = "Edit Task";
  openModal();
}

function updateTask(taskId, updatedData) {
  const task = tasks.find(function(t) {
    return t.id === taskId;
  });

  if (!task) return;

  task.title = updatedData.title;
  task.description = updatedData.description;
  task.priority = updatedData.priority;
  task.dueDate = updatedData.dueDate;

  const oldCard = document.querySelector('.task-card[data-id="' + taskId + '"]');
  const newCard = createTaskCard(task);

  if (oldCard) {
    oldCard.replaceWith(newCard);
  }
}

function handleTaskAction(event) {
  const action = event.target.getAttribute("data-action");
  const id = event.target.getAttribute("data-id");

  if (!action || !id) return;

  const taskId = parseInt(id, 10);
  const card = event.target.closest(".task-card");

  if (action === "delete") {
    deleteTask(taskId, card);
  } else if (action === "edit") {
    editTask(taskId);
  }
}

function handleInlineEdit(event) {
  if (!event.target.classList.contains("task-title")) return;

  const titleElement = event.target;
  const taskId = parseInt(titleElement.getAttribute("data-id"), 10);

  const task = tasks.find(function(t) {
    return t.id === taskId;
  });

  if (!task) return;

  const input = document.createElement("input");
  input.type = "text";
  input.value = task.title;
  input.classList.add("inline-edit-input");

  titleElement.replaceWith(input);

  setTimeout(function() {
    input.focus();
    input.select();
  }, 0);

  let alreadySaved = false;

  function saveInlineEdit() {
    if (alreadySaved) return;
    alreadySaved = true;

    const newTitle = input.value.trim();

    if (newTitle !== "") {
      task.title = newTitle;
    }

    const newTitleElement = document.createElement("span");
    newTitleElement.classList.add("task-title");
    newTitleElement.setAttribute("data-id", task.id);
    newTitleElement.textContent = task.title;

    input.replaceWith(newTitleElement);
  }

  input.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
      saveInlineEdit();
    }
  });

  input.addEventListener("blur", function() {
    saveInlineEdit();
  });
}

addTaskButtons.forEach(function(button) {
  button.addEventListener("click", function() {
    currentColumn = button.getAttribute("data-column");
    editingTaskId = null;
    modalTitle.textContent = "Add Task";
    clearModalFields();
    openModal();
  });
});

cancelTaskBtn.addEventListener("click", function() {
  closeModal();
  clearModalFields();
  editingTaskId = null;
});

saveTaskBtn.addEventListener("click", function() {
  const title = taskTitleInput.value.trim();
  const description = taskDescriptionInput.value.trim();
  const priority = taskPriorityInput.value;
  const dueDate = taskDueDateInput.value;

  if (title === "") {
    alert("Title is required!");
    return;
  }

  if (editingTaskId !== null) {
    updateTask(editingTaskId, {
      title: title,
      description: description,
      priority: priority,
      dueDate: dueDate
    });
  } else {
    const newTask = {
      id: nextTaskId++,
      title: title,
      description: description,
      priority: priority,
      dueDate: dueDate,
      column: currentColumn
    };

    tasks.push(newTask);
    addTask(currentColumn, newTask);
  }

  closeModal();
  clearModalFields();
  editingTaskId = null;
});

priorityFilter.addEventListener("change", function() {
  const selected = this.value;
  const allCards = document.querySelectorAll(".task-card");

  allCards.forEach(function(card) {
    const cardPriority = card.getAttribute("data-priority");

    if (selected === "all") {
      card.classList.remove("is-hidden");
    } else {
      if (cardPriority === selected) {
        card.classList.remove("is-hidden");
      } else {
        card.classList.add("is-hidden");
      }
    }
  });
});

clearDoneBtn.addEventListener("click", function() {
  const doneCards = doneList.querySelectorAll(".task-card");

  doneCards.forEach(function(card, index) {
    setTimeout(function() {
      const id = parseInt(card.getAttribute("data-id"), 10);
      deleteTask(id, card);
    }, index * 100);
  });
});

todoList.addEventListener("click", handleTaskAction);
inprogressList.addEventListener("click", handleTaskAction);
doneList.addEventListener("click", handleTaskAction);

todoList.addEventListener("dblclick", handleInlineEdit);
inprogressList.addEventListener("dblclick", handleInlineEdit);
doneList.addEventListener("dblclick", handleInlineEdit);

updateTaskCounter();

