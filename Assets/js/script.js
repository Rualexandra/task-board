$(document).ready(function () {
  // Retrieve tasks and nextId from localStorage
  let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
  let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

  // Todo: create a function to generate a unique task id
  function generateTaskId() {
    return nextId++;
  }

  // Todo: create a function to create a task card
  function createTaskCard(task) {
    let colorClass = "";
    let deadlineDate = dayjs(task.deadline);
    let currentDate = dayjs();
    let cardClasses = "card mb-3 task-card ";
    if (deadlineDate.isBefore(currentDate, "day")) {
      // Task is overdue
      cardClasses += "card-danger";
    } else if (deadlineDate.diff(currentDate, "day") <= 2) {
      // Task is nearing the deadline
      cardClasses += "card-warning";
    }

    return `
      <div class="${cardClasses}" id="task-${task.id}">
          <div class="card-body">
              <h5 class="card-title">${task.title}</h5>
              <p class="card-text">${task.description}</p>
              <p class="card-text"><small class="text-muted">Deadline: ${task.deadline}</small></p>
              <button type="button" class="btn btn-danger delete-task" data-id="${task.id}">Delete</button>
          </div>
      </div>
    `;
  }

  // Todo: create a function to render the task list and make cards draggable
  function renderTaskList() {
    $(".lane").each(function () {
      let status = $(this).attr("id");
      let tasks = taskList.filter((task) => task.status === status);
      $(this).find(".lane-cards").empty();
      tasks.forEach((task) => {
        $(this).find(".lane-cards").append(createTaskCard(task));
      });
    });
    $(".delete-task").click(handleDeleteTask);
  }

  // Todo: create a function to handle adding a new task
  function handleAddTask(event) {
    event.preventDefault();
    let title = $("#task-title").val();
    let description = $("#task-description").val();
    let deadline = $("#datepicker").val();
    let status = "to-do"; // Assuming the default status is "To Do"
    let task = { id: generateTaskId(), title, description, deadline, status };
    taskList.push(task);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    localStorage.setItem("nextId", JSON.stringify(nextId));
    renderTaskList();
    $("#formModal").modal("hide");
    $("#task-title").val("");
    $("#task-description").val("");
    $("#datepicker").val("");
  }

  // Todo: create a function to handle deleting a task
  function handleDeleteTask(event) {
    let taskId = parseInt($(this).data("id"));
    taskList = taskList.filter((task) => task.id !== taskId);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
  }

  // Todo: create a function to handle dropping a task into a new status lane
  function handleDrop(event, ui) {}

  // Render the task list when the page loads
  renderTaskList();

  // Make lanes droppable and initialize datepicker
  $(".lane-cards").sortable({
    connectWith: ".lane-cards",
    update: function (event, ui) {
      let taskId = parseInt(ui.item.attr("id").replace("task-", ""));
      let newStatus = ui.item.parent().parent().attr("id");
      let taskIndex = taskList.findIndex((task) => task.id === taskId);
      taskList[taskIndex].status = newStatus;
      localStorage.setItem("tasks", JSON.stringify(taskList));

      // Remove color class from task card when moved to "Done" section
      if (newStatus === "done") {
        ui.item.removeClass("card-danger card-warning");
      }
    },
  });
  $("#datepicker").datepicker({
    dateFormat: "yy-mm-dd", // Set the date format as needed
  });

  // Add event listener for adding a new task
  $("#add-task-form").submit(handleAddTask);
});
