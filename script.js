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
const addImageBtn = document.getElementById("add-image");
const imageUpload = document.getElementById("image-upload");
const boldBtn = document.getElementById("bold-btn");
const italicBtn = document.getElementById("italic-btn");
const deleteCardBtn = document.getElementById("delete-card");
const deleteTextBtn = document.getElementById("delete-text-btn");
const cardContainer = document.getElementById("card-container");
const deleteImageBtn = document.getElementById("delete-image-btn");

let selectedTextBox = null;

function rgbToHex(rgb) {
  if (!rgb || !rgb.startsWith("rgb")) {
    return rgb; // Return original value if not in rgb format
  }
  // Turn "rgb(r, g, b)" into [r, g, b]
  let [r, g, b] = rgb.match(/\d+/g).map(Number);

  const toHex = (c) => ("0" + c.toString(16)).slice(-2);

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function setSelectedTextBox(textBox) {
  if (selectedTextBox && selectedTextBox !== textBox) {
    selectedTextBox.classList.remove("selected");
  }
  selectedTextBox = textBox;
  if (textBox) {
    textBox.classList.add("selected");
    textTools.style.display = "block";
    // Update tools to reflect the selected text box's style
    const styles = window.getComputedStyle(textBox);
    boldBtn.classList.toggle(
      "toggled",
      styles.fontWeight === "700" || styles.fontWeight === "bold"
    );
    italicBtn.classList.toggle("toggled", styles.fontStyle === "italic");
    document.getElementById("color-picker").value = rgbToHex(styles.color);
    document.getElementById("font-size").value = parseInt(styles.fontSize, 10);
    document.getElementById("font-select").value = styles.fontFamily;
    document.getElementById("align-select").value = styles.textAlign;
  } else {
    textTools.style.display = "none";
    // Clear toggled state when nothing is selected
    boldBtn.classList.remove("toggled");
    italicBtn.classList.remove("toggled");
  }
}

function makeDraggable(element, container) {
  let isDragging = false;
  let offsetX, offsetY;

  const onMouseDown = (e) => {
    // Only start dragging if the element is not being edited (i.e., does not have focus)
    // This allows the user to click into the text box to edit it without dragging.
    // A second click-and-hold will initiate the drag.
    isDragging = true;
    offsetX = e.offsetX;
    offsetY = e.offsetY;
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
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

// --- State Management ---

function saveState() {
  const cardsData = [];
  document.querySelectorAll(".swiper-slide").forEach((slide) => {
    const cardContent = slide.querySelector(".card-content");
    const textBoxesData = [];

    cardContent.querySelectorAll(".editable-text").forEach((box) => {
      textBoxesData.push({
        content: box.innerHTML,
        left: box.style.left,
        top: box.style.top,
        color: box.style.color,
        fontSize: box.style.fontSize,
        fontFamily: box.style.fontFamily,
        fontWeight: box.style.fontWeight,
        fontStyle: box.style.fontStyle,
        textAlign: box.style.textAlign,
      });
    });

    cardsData.push({
      backgroundImage: cardContent.style.backgroundImage,
      textBoxes: textBoxesData,
    });
  });

  localStorage.setItem("cardCreatorState", JSON.stringify(cardsData));
}

function loadState() {
  const savedState = localStorage.getItem("cardCreatorState");
  if (!savedState) return;

  const cardsData = JSON.parse(savedState);
  if (!cardsData || cardsData.length === 0) return;

  // Clear default card
  cardContainer.innerHTML = "";

  cardsData.forEach((cardData) => {
    const newSlide = document.createElement("div");
    newSlide.classList.add("swiper-slide", "card");
    newSlide.innerHTML = `<div class="card-content"></div>`;
    const cardContent = newSlide.querySelector(".card-content");
    cardContent.style.backgroundImage = cardData.backgroundImage;

    cardData.textBoxes.forEach((boxData) => {
      const textBox = createTextBox();
      textBox.innerHTML = boxData.content;
      Object.assign(textBox.style, boxData); // Apply all saved styles
      cardContent.appendChild(textBox);
      makeDraggable(textBox, cardContent);
    });

    cardContainer.appendChild(newSlide);
  });

  swiper.update();
}

// --- Event Listeners ---

addCardBtn.addEventListener("click", () => {
  const newSlide = document.createElement("div");
  newSlide.classList.add("swiper-slide", "card");
  newSlide.innerHTML = `<div class="card-content"></div>`;
  cardContainer.appendChild(newSlide);
  swiper.update();
  swiper.slideTo(swiper.slides.length - 1);
  saveState();
});

deleteCardBtn.addEventListener("click", () => {
  // Prevent deleting the last card to avoid an empty state
  if (swiper.slides.length > 1) {
    swiper.removeSlide(swiper.activeIndex);
  } else {
    alert("You cannot delete the last card.");
  }
  saveState();
});

addTextBtn.addEventListener("click", () => {
  const activeSlide = swiper.slides[swiper.activeIndex];
  const cardContent = activeSlide.querySelector(".card-content");
  const textBox = createTextBox();

  cardContent.appendChild(textBox);
  makeDraggable(textBox, cardContent);
  setSelectedTextBox(textBox); // Select the new text box immediately
  saveState();
});

addImageBtn.addEventListener("click", () => {
  imageUpload.click(); // Trigger the hidden file input
});

imageUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const activeSlide = swiper.slides[swiper.activeIndex];
    const cardContent = activeSlide.querySelector(".card-content");
    cardContent.style.backgroundImage = `url(${event.target.result})`;
    saveState();
  };
  reader.readAsDataURL(file);
  e.target.value = ""; // Reset file input
});

// Save state on drag end and text input
document.addEventListener("mouseup", () => setTimeout(saveState, 0));
document.addEventListener("keyup", () => setTimeout(saveState, 0));

// Handle text box selection and deselection
document.addEventListener("click", (e) => {
  const clickedTextBox = e.target.closest(".editable-text");
  const isToolsPanel = e.target.closest("#text-tools");

  // If the click is on a text box, select it.
  if (clickedTextBox) {
    setSelectedTextBox(clickedTextBox);
    return;
  }

  // If the click is outside the text box and the tools panel, deselect.
  if (!isToolsPanel) {
    setSelectedTextBox(null);
  }
});

// Bold and Italic button listeners
boldBtn.addEventListener("click", () => {
  if (!selectedTextBox) return;
  const isBold = selectedTextBox.style.fontWeight === "bold";
  selectedTextBox.style.fontWeight = isBold ? "normal" : "bold";
  boldBtn.classList.toggle("toggled", !isBold);
});

italicBtn.addEventListener("click", () => {
  if (!selectedTextBox) return;
  const isItalic = selectedTextBox.style.fontStyle === "italic";
  selectedTextBox.style.fontStyle = isItalic ? "normal" : "italic";
  italicBtn.classList.toggle("toggled", !isItalic);
});

deleteTextBtn.addEventListener("click", () => {
  if (selectedTextBox) {
    selectedTextBox.remove();
    setSelectedTextBox(null); // Deselect and hide tools
    saveState();
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
    case "font-select":
      selectedTextBox.style.fontFamily = value;
      break;
    case "align-select":
      selectedTextBox.style.textAlign = value;
      break;
  }
  saveState();
});

// --- Initialization ---

function initialize() {
  loadState();
  // Make any pre-existing text boxes (from initial HTML or loaded state) draggable
  document.querySelectorAll(".editable-text").forEach((box) => {
    const cardContent = box.closest(".card-content");
    if (cardContent) makeDraggable(box, cardContent);
  });
}

initialize();
