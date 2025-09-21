const swiper = new Swiper(".mySwiper", {
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
});

const addCardBtn = document.getElementById("add-card");
const addTextBtn = document.getElementById("add-text");
const textTools = document.getElementById("text-tools");
const cardContainer = document.getElementById("card-container");

let selectedTextBox = null;

function setSelectedTextBox(textBox) {
  if (selectedTextBox && selectedTextBox !== textBox) {
    selectedTextBox.classList.remove("selected");
  }
  selectedTextBox = textBox;
  if (textBox) {
    textBox.classList.add("selected");
    textTools.style.display = "block";
  } else {
    textTools.style.display = "none";
  }
}

function makeDraggable(element, container) {
  let isDragging = false;
  let offsetX, offsetY;

  const onMouseDown = (e) => {
    // Prevent dragging when editing text
    if (e.target.isContentEditable) {
      isDragging = true;
      offsetX = e.offsetX;
      offsetY = e.offsetY;
      // Add listeners for move and up events
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    }
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault(); // Prevent text selection while dragging

    const rect = container.getBoundingClientRect();
    let x = e.clientX - rect.left - offsetX;
    let y = e.clientY - rect.top - offsetY;

    // Constrain the element within the container
    x = Math.max(0, Math.min(x, rect.width - element.offsetWidth));
    y = Math.max(0, Math.min(y, rect.height - element.offsetHeight));

    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    element.style.transform = "none"; // Override initial centering
  };

  const onMouseUp = () => {
    isDragging = false;
    // Clean up listeners
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  element.addEventListener("mousedown", onMouseDown);
}

function createTextBox() {
  const textBox = document.createElement("div");
  textBox.classList.add("editable-text");
  textBox.contentEditable = "true";
  textBox.textContent = "New Text";
  return textBox;
}

// --- Event Listeners ---

addCardBtn.addEventListener("click", () => {
  const newSlide = document.createElement("div");
  newSlide.classList.add("swiper-slide", "card");
  newSlide.innerHTML = `<div class="card-content"></div>`;
  cardContainer.appendChild(newSlide);
  swiper.update();
  swiper.slideTo(swiper.slides.length - 1);
});

addTextBtn.addEventListener("click", () => {
  const activeSlide = swiper.slides[swiper.activeIndex];
  const cardContent = activeSlide.querySelector(".card-content");
  const textBox = createTextBox();

  cardContent.appendChild(textBox);
  makeDraggable(textBox, cardContent);
  setSelectedTextBox(textBox); // Select the new text box immediately
});

// Handle text box selection and deselection
document.addEventListener("click", (e) => {
  const clickedTextBox = e.target.closest(".editable-text");
  const isToolsPanel = e.target.closest("#text-tools");
  setSelectedTextBox(clickedTextBox);
  // If click is outside a textbox and not on the tools panel, hide tools
  if (!clickedTextBox && !isToolsPanel) {
    setSelectedTextBox(null);
  }
});

// Text Editing Tool Listeners
textTools.addEventListener("input", (e) => {
  if (!selectedTextBox) return;
  const { id, value } = e.target;
  switch (id) {
    case "color-picker":
      selectedTextBox.style.color = value;
      break;
    case "font-size":
      selectedTextBox.style.fontSize = `${value}px`;
      break;
  }
});

textTools.addEventListener("change", (e) => {
  if (!selectedTextBox) return;
  const { id, value } = e.target;
  switch (id) {
    case "font-select":
      selectedTextBox.style.fontFamily = value;
      break;
    case "align-select":
      selectedTextBox.style.textAlign = value;
      break;
  }
});

// Initialize first text box
document.querySelectorAll(".editable-text").forEach((box) => {
  const cardContent = box.closest(".card-content");
  if (cardContent) {
    makeDraggable(box, cardContent);
  }
});
