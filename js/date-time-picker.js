const initDateTimePickers = (scheduleRecalc) => {
  const schedule = typeof scheduleRecalc === "function" ? scheduleRecalc : () => {};
  const pickerConfigs = [
    {
      displayInput: document.getElementById("arrival-display"),
      valueInput: document.getElementById("arrival-datetime"),
      popover: document.getElementById("arrival-popover")
    },
    {
      displayInput: document.getElementById("departure-display"),
      valueInput: document.getElementById("departure-datetime"),
      popover: document.getElementById("departure-popover")
    }
  ];

  const pickerInstances = [];

  function closeAllPickers(exceptPopover) {
    pickerInstances.forEach(picker => picker.close(exceptPopover));
  }

  function initDateTimePicker({displayInput, valueInput, popover}) {
    const calendarView = popover.querySelector(".calendar-view");
    const timeView = popover.querySelector(".time-view");
    const calendarGrid = popover.querySelector(".calendar-grid");
    const monthLabel = popover.querySelector(".month-label");
    const prevBtn = popover.querySelector(".prev");
    const nextBtn = popover.querySelector(".next");
    const timeGrid = popover.querySelector(".time-grid");
    const timeHeader = popover.querySelector(".time-header");
    const backBtn = popover.querySelector(".back-btn");
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    let viewDate = new Date();
    let selectedDate = null;
    let selectedTime = null;

    function formatTime12(timeValue) {
      const [hourStr, minuteStr] = timeValue.split(":");
      const hour = Number(hourStr);
      const period = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      return `${displayHour}:${minuteStr} ${period}`;
    }

    function formatDisplay(date, time) {
      const dateText = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
      return `${dateText} ${formatTime12(time)}`;
    }

    function formatIso(date, time) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}T${time}`;
    }

    function showCalendar() {
      calendarView.hidden = false;
      timeView.hidden = true;
    }

    function showTime() {
      calendarView.hidden = true;
      timeView.hidden = false;
    }

    function renderCalendar() {
      calendarGrid.innerHTML = "";
      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();
      monthLabel.textContent = `${monthNames[month]} ${year}`;
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const today = new Date();

      for (let i = 0; i < firstDay; i += 1) {
        const empty = document.createElement("div");
        empty.className = "empty";
        calendarGrid.appendChild(empty);
      }

      for (let day = 1; day <= daysInMonth; day += 1) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "day-btn";
        btn.textContent = String(day);
        const isToday =
          today.getFullYear() === year &&
          today.getMonth() === month &&
          today.getDate() === day;
        if (isToday) {
          btn.classList.add("today");
        }
        if (
          selectedDate &&
          selectedDate.getFullYear() === year &&
          selectedDate.getMonth() === month &&
          selectedDate.getDate() === day
        ) {
          btn.classList.add("selected");
        }
        btn.addEventListener("click", () => {
          selectedDate = new Date(year, month, day);
          timeHeader.textContent = `Select time for ${selectedDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
          })}`;
          showTime();
        });
        calendarGrid.appendChild(btn);
      }
    }

    function buildTimeGrid() {
      timeGrid.innerHTML = "";
      for (let hour = 0; hour < 24; hour += 1) {
        for (let minute = 0; minute < 60; minute += 30) {
          const hourStr = String(hour).padStart(2, "0");
          const minuteStr = String(minute).padStart(2, "0");
          const timeValue = `${hourStr}:${minuteStr}`;
          const timeLabel = formatTime12(timeValue);
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "time-btn";
          btn.textContent = timeLabel;
          btn.addEventListener("click", () => {
            if (!selectedDate) {
              return;
            }
            selectedTime = timeValue;
            valueInput.value = formatIso(selectedDate, selectedTime);
            displayInput.value = formatDisplay(selectedDate, selectedTime);
            displayInput.setCustomValidity("");
            schedule();
            closePopover();
          });
          timeGrid.appendChild(btn);
        }
      }
    }

    function syncFromValue() {
      if (!valueInput.value) {
        return;
      }
      const parsed = new Date(valueInput.value);
      if (Number.isNaN(parsed.getTime())) {
        return;
      }
      selectedDate = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
      selectedTime = `${String(parsed.getHours()).padStart(2, "0")}:${String(parsed.getMinutes()).padStart(2, "0")}`;
      displayInput.value = formatDisplay(selectedDate, selectedTime);
      viewDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    }

    function openPopover() {
      closeAllPickers(popover);
      syncFromValue();
      showCalendar();
      renderCalendar();
      popover.hidden = false;
      displayInput.setAttribute("aria-expanded", "true");
    }

    function closePopover(targetPopover) {
      if (targetPopover && targetPopover === popover) {
        return;
      }
      popover.hidden = true;
      displayInput.setAttribute("aria-expanded", "false");
    }

    displayInput.addEventListener("click", event => {
      event.stopPropagation();
      openPopover();
    });
    popover.addEventListener("click", event => event.stopPropagation());
    prevBtn.addEventListener("click", () => {
      viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
      renderCalendar();
    });
    nextBtn.addEventListener("click", () => {
      viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
      renderCalendar();
    });
    backBtn.addEventListener("click", () => {
      showCalendar();
      renderCalendar();
    });

    buildTimeGrid();

    return {
      close: closePopover
    };
  }

  pickerConfigs.forEach(config => {
    if (!config.displayInput || !config.valueInput || !config.popover) {
      return;
    }
    pickerInstances.push(initDateTimePicker(config));
  });

  document.addEventListener("click", event => {
    const pickerRoot = event.target.closest(".datetime-picker");
    const clickedPopover = pickerRoot ? pickerRoot.querySelector(".datetime-popover") : null;
    if (!pickerRoot) {
      closeAllPickers();
      return;
    }
    closeAllPickers(clickedPopover);
  });
};

window.initDateTimePickers = initDateTimePickers;
