const initAirportAutocomplete = ({
  input,
  list,
  onSelect,
  onClear,
  onInput
}) => {
  let debounceTimer = null;

  const filterAirports = (query) => {
    const normalized = query.toLowerCase();
    return AIRPORTS.filter(a =>
      (a.name && a.name.toLowerCase().includes(normalized)) ||
      (a.icao && a.icao.toLowerCase().includes(normalized)) ||
      (a.faa && a.faa.toLowerCase().includes(normalized))
    ).slice(0, 15);
  };

  const renderAirportList = (airports) => {
    list.innerHTML = "";
    airports.forEach(ap => {
      const div = document.createElement("div");
      div.className = "autocomplete-item";
      div.textContent = `${ap.icao ? ap.icao + " / " : ""}${ap.faa} - ${ap.name}`;
      div.addEventListener("click", () => {
        if (onSelect) {
          onSelect(ap, div.textContent);
        }
        list.hidden = true;
      });
      list.appendChild(div);
    });
    list.hidden = airports.length === 0;
  };

  input.addEventListener("input", () => {
    if (onClear) {
      onClear();
    }
    if (onInput) {
      onInput();
    }
    const query = input.value.trim();
    if (query.length < 1) {
      list.hidden = true;
      return;
    }
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      renderAirportList(filterAirports(query));
    }, 200);
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".autocomplete-container")) {
      list.hidden = true;
    }
  });
};

window.initAirportAutocomplete = initAirportAutocomplete;
