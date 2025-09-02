function getDefaultDatePickerConfig() {
  return {
    dateFormat: "d/m/Y",
    defaultDate: "today",
    minDate: "today",
    locale: flatpickr.l10ns.de,
    allowInput: false,
    disableMobile: true,
    onChange: (selectedDates, dateStr, instance) => {
      handlePastDate(selectedDates, instance);
    }
  };
}

function handlePastDate(selectedDates, instance) {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  if (selectedDates.length > 0 && selectedDates[0] < currentDate) {
    instance.setDate("today", true);
    alert("Das ausgewählte Datum liegt in der Vergangenheit. Bitte wählen Sie ein aktuelles Datum.");
  }
}

function openDatePicker(inputId) {
  const dateInput = document.getElementById(inputId);
  if (!dateInput) return;
  dateInput.setAttribute("readonly", "readonly");
  if (dateInput._flatpickr) {
    dateInput._flatpickr.isOpen ? dateInput._flatpickr.close() : dateInput._flatpickr.open();
  } else {
    flatpickr(dateInput, getDefaultDatePickerConfig());
    dateInput._flatpickr.open();
  }
}

function openDatePickerAddTask(inputId) {
  const dateInput = document.getElementById(inputId);
  if (!dateInput) return;
  dateInput.setAttribute("readonly", "readonly");
  flatpickr(dateInput, getDefaultDatePickerConfig());
  dateInput.focus();
}

function setPriority(priority) {
  let allButtons = document.querySelectorAll('.priority-button-urgent, .priority-button-medium, .priority-button-low');
  let selectedButton = document.querySelector(`.priority-button-${priority}[onclick="setPriority('${priority}')"]`);
  if (selectedButton.classList.contains('active')) {
    selectedButton.classList.remove('active');
  } else {
    allButtons.forEach(button => button.classList.remove('active'));
    selectedButton.classList.add('active');
  }
}


