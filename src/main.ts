import { getCurrentWindow } from '@tauri-apps/api/window';

let imgEl: HTMLImageElement | null;
let imgDiv: HTMLDivElement | null;

const appWindow = getCurrentWindow();

document
  .getElementById('titlebar-minimize')
  ?.addEventListener('click', () => appWindow.minimize());
document
  .getElementById('titlebar-maximize')
  ?.addEventListener('click', () => appWindow.toggleMaximize());
document
  .getElementById('titlebar-close')
  ?.addEventListener('click', () => appWindow.close());

async function generate_cat() {
  try {
    const response = await fetch("http://127.0.0.1:8000/random_cat");

    if (!response.ok) {
      throw new Error("Failed to fetch cat image");
    }

    const data = await response.json();
    imgDiv = document.querySelector(".image-container")
    console.log(imgDiv)

    if (imgEl && imgDiv) {
      imgEl.src = data.url;
    }
  } catch (error) {
    console.error("Error fetching cat image:", error);
  }
}

async function save_kitty(src: string) {
  console.log(src)

  const res = await fetch("http://localhost:8000/save", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',  // Set the content type to JSON
    },
    body: JSON.stringify({ link: src }),  // Send the src in a JSON object
  });

  if (!res.ok) {
    console.error("Error uploading cat image:", res.statusText);
    return;
  }

  const data = await res.json();
  console.log("Upload result:", data);
}





window.addEventListener("DOMContentLoaded", () => {
  imgEl = document.getElementById("image") as HTMLImageElement;

  const items = document.querySelectorAll(".page") as NodeListOf<HTMLElement>;

  items.forEach((item) => {
      if (!item.classList.contains("back-button")) {
          item.style.opacity = '0';
          item.style.transform = 'translateY(20px)';
          item.style.transition = 'transform 500ms ease, opacity 500ms ease';
      }
  });

  items.forEach((item, index) => {
      setTimeout(() => {
          item.style.opacity = '1';
          item.style.transform = "";
      }, index * 100);
  });

  console.log(imgEl.src)
  console.log(imgEl)
  if (imgEl && imgEl.src === "") {
    generate_cat();
  }

  const fetchButton = document.getElementById("get-cat");

  if (fetchButton) {
    fetchButton.addEventListener("click", (e) => {
      e.preventDefault();
      generate_cat();
    });
  }
});


window.addEventListener("DOMContentLoaded", () => {
  const saveButton = document.getElementById("save-cat");

  if (saveButton) {
    saveButton.addEventListener("click", (e) => {
      e.preventDefault();
      if (imgEl && imgEl.src) {
        save_kitty(imgEl.src);
      }
    });
  }
});

document.getElementById("save-cat")?.addEventListener("click", function () {
  const heartOverlay = document.getElementById("heart-overlay");
  
  if (heartOverlay) {
    heartOverlay.style.display = "block";
    
    heartOverlay.style.animation = "none";
    heartOverlay.offsetHeight;
    heartOverlay.style.animation = "heart-animation 1s ease forwards";
  }
});