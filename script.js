// ============================================================
// MENU LOADING & FILTERING
// ============================================================

function createSlug(str) {
    return str.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function loadMenu() {
    fetch('menu.txt')
        .then(response => {
            if (!response.ok) throw new Error('Menu file not found');
            return response.text();
        })
        .then(menuText => {
            const { html, categories } = processMenuData(menuText);
            document.getElementById('menu-content').innerHTML = html;
            createCategoryButtons(categories);
            filterCategory('all');
        })
        .catch(error => {
            console.error('Error loading menu:', error);
            document.getElementById('menu-content').innerHTML =
                '<p style="color:white;text-align:center;padding:2rem;">Sorry, the menu could not be loaded.</p>';
        });
}

function processMenuData(menuText) {
    let html = '';
    const lines = menuText.split('\n');
    const categories = [];
    let currentCategory = null;
    let currentSlug = '';
    let itemsHTML = '';

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.includes(':')) {
            if (!currentCategory) continue;

            const colonIndex = trimmed.indexOf(':');
            const name = trimmed.substring(0, colonIndex).trim();
            const price = trimmed.substring(colonIndex + 1).trim();

            itemsHTML += `
                <div class="menu-card">
                    <h3>${name}</h3>
                    <span class="price">${price}</span>
                </div>
            `;
        } else {
            if (currentCategory) {
                html += createCategorySection(currentCategory, currentSlug, itemsHTML);
            }

            currentCategory = trimmed;
            currentSlug = createSlug(trimmed);
            itemsHTML = '';

            categories.push({ name: currentCategory, slug: currentSlug });
        }
    }

    if (currentCategory) {
        html += createCategorySection(currentCategory, currentSlug, itemsHTML);
    }

    return { html, categories };
}

function createCategorySection(categoryName, slug, itemsHTML) {
    return `
        <section class="menu-section" data-category="${slug}" id="cat-${slug}">
            <h2 class="menu-category-title">${categoryName}</h2>
            <div class="menu-grid">
                ${itemsHTML}
            </div>
        </section>
    `;
}

function createCategoryButtons(categories) {
    const container = document.querySelector('.menu-categories');
    const allBtn = container.querySelector('[data-category="all"]');
    
    container.innerHTML = '';
    container.appendChild(allBtn);
    
    allBtn.addEventListener('click', () => filterCategory('all'));
    
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.textContent = cat.name;
        btn.dataset.category = cat.slug;
        btn.addEventListener('click', () => filterCategory(cat.slug));
        container.appendChild(btn);
    });
}

function filterCategory(slug) {
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === slug) {
            btn.classList.add('active');
        }
    });

    document.querySelectorAll('.menu-section').forEach(section => {
        if (slug === 'all' || section.dataset.category === slug) {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });
}

document.addEventListener('DOMContentLoaded', loadMenu);