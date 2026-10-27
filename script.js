let projectsData = [];
let currentProjectIndex = 0; // Śledzi, który projekt jest otwarty

async function loadProjects() {
  try {
    const response = await fetch('projects.json');
    projectsData = await response.json();
    renderSlider(projectsData);
  } catch (error) {
    console.error("Błąd podczas ładowania projektów:", error);
  }
}

function renderSlider(projects) {
  const slider = document.getElementById('projects-slider');
  slider.innerHTML = ''; 

  projects.forEach((project, index) => {
    const card = document.createElement('div');
    card.className = 'slider-card';
    card.innerHTML = `
      <img src="${project.image}" alt="${project.title}">
      <h3>${project.title}</h3>
    `;
    
    // Przekazujemy INDEKS projektu zamiast samych danych
    card.addEventListener('click', () => openModal(index));
    slider.appendChild(card);
  });
}

// Logika slidera na stronie głównej (bez zmian)
document.getElementById('next-btn').addEventListener('click', () => {
  const slider = document.getElementById('projects-slider');
  const cardWidth = slider.querySelector('.slider-card').offsetWidth + 20;
  slider.scrollBy({ left: cardWidth, behavior: 'smooth' });
});
document.getElementById('prev-btn').addEventListener('click', () => {
  const slider = document.getElementById('projects-slider');
  const cardWidth = slider.querySelector('.slider-card').offsetWidth + 20;
  slider.scrollBy({ left: -cardWidth, behavior: 'smooth' });
});

/* --- NOWA LOGIKA MODALA --- */
const modal = document.getElementById('project-modal');
const modalBody = document.getElementById('modal-body');
const modalTitle = document.getElementById('modal-title');
const homeBtn = document.querySelector('.home-btn');

function openModal(index) {
  currentProjectIndex = index;
  const project = projectsData[index];
  
  modalTitle.innerText = project.title;

  // Funkcja pomocnicza do generowania bloków z obrazkami
  const generateSectionHTML = (sections) => {
    if (!sections) return '';
    return sections.map(block => `
      <div class="content-block ${block.imagePosition === 'left' ? 'row-reverse' : ''}">
        <div class="content-text">
          <ul>
            ${block.items.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
        ${block.image ? `
          <div class="content-image">
            <img src="${block.image}" alt="${block.title || 'Project image'}" class="clickable-image" loading="lazy">
          </div>
        ` : ''}
      </div>
    `).join('');
  };

  const keySolutionsHTML = generateSectionHTML(project.keySolutions);
  const gameplayHTML = generateSectionHTML(project.gameplay);

  // Generowanie bloków kodu / obrazków
  const codeBlocksHTML = project.codeBlocks.map(block => {
    const isReverse = block.imagePosition === 'left' ? 'row-reverse' : '';
    const hasText = block.title || block.description;
    const centerClass = !hasText ? 'center-content' : '';
    
    let visualContent = '';
    
    if (block.image) {
      // TUTAJ DODANO KLASĘ: class="clickable-image"
      visualContent = `
        <div class="code-window image-window">
          <img src="${block.image}" alt="${block.title || 'Project image'}" class="clickable-image" loading="lazy">
        </div>
      `;
    } 
    else if (block.code) {
      visualContent = `
        <div class="code-window">
          <div class="mac-window">
            <div class="mac-header">
              <div class="mac-dot red"></div>
              <div class="mac-dot yellow"></div>
              <div class="mac-dot green"></div>
            </div>
            <pre><code>${escapeHTML(block.code)}</code></pre>
          </div>
        </div>
      `;
    }

    // Generujemy blok tekstowy tylko, jeśli jest tekst
    let textContent = '';
    if (hasText) {
      textContent = `
        <div class="code-desc">
          ${block.title ? `<h3>${block.title}</h3>` : ''}
          ${block.description ? `<p>${block.description}</p>` : ''}
        </div>
      `;
    }

    return `
      <div class="code-section ${isReverse} ${centerClass}">
        ${textContent}
        ${visualContent}
      </div>
    `;
  }).join('');

  // Składanie całości HTML
  modalBody.innerHTML = `
    <div class="project-meta">
      <div class="project-info">
        <div class="project-technologies">
          <strong>Technologies:</strong> ${project.technologies}
        </div>
        <a href="${project.platformLink}" target="_blank" rel="noopener noreferrer" class="project-link-btn">
          Check out the project ↗
        </a>
      </div>
    </div>
    
    <h2>Description</h2>
    <p>${project.description}</p>

    ${project.gameplayVideoId ? `
      <div class="gameplay-video">
        <iframe
          src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(project.gameplayVideoId)}"
          title="${project.title} - Gameplay"
          loading="lazy" allowfullscreen>
        </iframe>
      </div>
    ` : project.gameplayImage ? `
      <div class="gameplay-image">
        <img src="${project.gameplayImage}" alt="${project.title} - Gameplay" class="clickable-image" loading="lazy">
      </div>
    ` : ''}

    ${project.role ? `
      <h2>My Role</h2>
      <p>${project.role}</p>
    ` : ''}
    
    ${project.keySolutions && project.keySolutions.length > 0 ? `
      <h2>Key Technical Solutions</h2>
      ${keySolutionsHTML}
    ` : ''}

    ${project.gameplay && project.gameplay.length > 0 ? `
      <h2>Gameplay</h2>
      ${gameplayHTML}
    ` : ''}

    ${project.codeBlocks && project.codeBlocks.length > 0 ? `
      <hr style="border-color: #334155; margin: 40px 0;">
      ${codeBlocksHTML}
    ` : ''}
  `;
  
  modal.classList.add('show');
  modalBody.scrollTop = 0; 
}

// Obsługa dolnych strzałek w Modalu
document.getElementById('modal-next-btn').addEventListener('click', () => {
  let nextIndex = currentProjectIndex + 1;
  // Jeśli to był ostatni projekt, wróć do pierwszego (zapętlenie)
  if (nextIndex >= projectsData.length) nextIndex = 0; 
  openModal(nextIndex);
});

document.getElementById('modal-prev-btn').addEventListener('click', () => {
  let prevIndex = currentProjectIndex - 1;
  // Jeśli to był pierwszy projekt, idź do ostatniego (zapętlenie)
  if (prevIndex < 0) prevIndex = projectsData.length - 1;
  openModal(prevIndex);
});

// Zamknij okienko po kliknięciu ikonki domku
homeBtn.addEventListener('click', () => {
  modal.classList.remove('show');
});

function escapeHTML(str) {
  if(!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

loadProjects();

/* --- LIGHTBOX LOGIKA --- */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.querySelector('.lightbox-close');

// Ponieważ obrazki tworzymy dynamicznie, nasłuchujemy kliknięć na całym ciele modala
modalBody.addEventListener('click', (e) => {
  if (e.target.classList.contains('clickable-image')) {
    lightboxImg.src = e.target.src;
    lightbox.classList.add('show');
  }
});

// Zamykanie lightboxa po kliknięciu w "X"
lightboxClose.addEventListener('click', () => {
  lightbox.classList.remove('show');
});

// Zamykanie po kliknięciu w tło (poza zdjęciem)
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) {
    lightbox.classList.remove('show');
  }
});

// Zamykanie klawiszem "Escape"
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && lightbox.classList.contains('show')) {
    lightbox.classList.remove('show');
  }
});