import { getCurrentWindow } from '@tauri-apps/api/window';

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


async function loadSavedCats() {
    try {
        const response = await fetch("http://localhost:8000/get_saved");

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const data = await response.json();
        console.log(data);

        // Directly iterate over the returned data
        if (Array.isArray(data)) {
            const container = document.getElementById("cats-container");

            // Clear any existing content in the container
            if (container) {
                container.innerHTML = "";

                data.forEach(function (cat: any) {
                    console.log(cat.link)
                    const catDiv = document.createElement("div");
                    catDiv.classList.add("cat-item");

                    catDiv.innerHTML = `
                        <img class="saved-cat" src="${cat.image_path}"/>
                    `;

                    container.appendChild(catDiv);
                });
            } else {
                console.error("Container element not found");
            }
        } else {
            console.log("Data is not an array");
        }
    } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
    }
}

window.addEventListener('DOMContentLoaded', loadSavedCats);

document.addEventListener("DOMContentLoaded", () => {
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


    const catView = document.querySelector(".cat-view") as HTMLElement;
    const imgCat = document.querySelector(".cat-img") as HTMLImageElement;
    const delButton = document.querySelector(".delete-button") as HTMLButtonElement;

    let catItem: HTMLDivElement | null;
    let img: HTMLImageElement | null;

    console.log(catView)
    console.log(imgCat)

    document.addEventListener('click', function(event) {
        const clickedElement = event.target as HTMLElement;
        catItem = clickedElement.closest('.cat-item');
    
        if (catItem) {
            console.log(catItem);
            img = catItem.querySelector('img');
            if (img) {
                console.log('Image found:', img.src);
                show_kitty(img.src);
            } else {
                console.log('No image here :(');
            }
        }
    });

    async function show_kitty(src: string) {
        if (catView && imgCat) {
            catView.style.transition = 'opacity 300ms ease';
            catView.style.opacity = "1.0";
            catView.style.pointerEvents = "auto";
        
    
            imgCat.src = src;
            imgCat.style.transition = "scale 300ms ease"
            imgCat.style.scale = "1.0"
    
        } else {
            console.log("Something went wrong T^T")
        }
    }
    
    async function hide_kitty() {
        if (catView && imgCat) {
            catView.style.transition = 'opacity 300ms ease';
            catView.style.opacity = "0.0";
            catView.style.pointerEvents = "none";
    
            imgCat.style.scale = "0.8"
    
        } else {
            console.log("Something went wrong T^T")
        }
    }

    async function delete_cat(element: HTMLDivElement, src: string) {
        await hide_kitty();
        element.remove();
    
        const response = await fetch("http://localhost:8000/delete", {
            method: "POST",
            headers: {
            'Content-Type': 'application/json', 
            },
            body: JSON.stringify({ link: src }),
        })

        if (!response.ok) {
            console.error("Error uploading cat image:", response.statusText);
            return;
          }
        
        const data = await response.json();
        console.log("result:", data);
    }


    delButton.addEventListener("click", (e) => {
        e.preventDefault();
        if (catItem && img && img.src) {
            delete_cat(catItem, img.src);
        }
    })
    
    catView.addEventListener("click", (e) => {
        e.preventDefault();
        hide_kitty();
    })
});

