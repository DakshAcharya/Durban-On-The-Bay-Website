// Function to show/hide sections
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show the selected section
    document.getElementById(sectionId).classList.add('active');
}

// Function to convert text to URL-friendly slug
function createSlug(str) {
    return str.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Function to load menu from text file
function loadMenu() {
    fetch('menu.txt')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            const result = processMenuData(data);
            document.getElementById('menu-items').innerHTML = result.html;
            createCategoryButtons(result.categories);
            // Initialize with all items visible
            filterCategory('all');
        })
        .catch(error => {
            console.error('Error loading menu:', error);
            document.getElementById('menu-items').innerHTML = `
                <div class="menu-category">
                    <h3>Error Loading Menu</h3>
                    <div class="items-grid">
                        <div class="menu-item">
                            <div class="item-name">Please make sure menu.txt exists in the same directory</div>
                            <div class="item-price">--</div>
                        </div>
                    </div>
                </div>
            `;
        });
}

// Function to process menu data and return HTML and categories
function processMenuData(menuText) {
    let html = '';
    const lines = menuText.split('\n');
    const categories = [];
    let currentCategory = null;
    let currentCategorySlug = '';
    let currentItemsHTML = '';
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip empty lines
        if (!line) continue;
        
        // Check if line contains a colon (item) or not (category)
        if (line.includes(':')) {
            // This is an item line
            if (currentCategory) {
                const [name, price] = line.split(':');
                const itemName = name.trim();
                const itemPrice = price.trim();
                
                currentItemsHTML += `
                    <div class="menu-item">
                        <div class="item-name">${itemName}</div>
                        <div class="item-price">${itemPrice}</div>
                    </div>
                `;
            }
        } else {
            // This is a category line - save previous category if exists
            if (currentCategory) {
                // Close the previous category
                html += createCategoryHTML(currentCategory, currentCategorySlug, currentItemsHTML);
            }
            
            // Start new category
            currentCategory = line;
            currentCategorySlug = createSlug(line);
            currentItemsHTML = '';
            
            // Add to categories array for buttons
            categories.push({
                name: currentCategory,
                slug: currentCategorySlug
            });
        }
    }
    
    // Don't forget the last category
    if (currentCategory) {
        html += createCategoryHTML(currentCategory, currentCategorySlug, currentItemsHTML);
    }
    
    return { html, categories };
}

// Helper function to create category HTML
function createCategoryHTML(categoryName, categorySlug, itemsHTML) {
    return `
        <div class="menu-category" data-category="${categorySlug}" id="cat-${categorySlug}">
            <h3>${categoryName}</h3>
            <div class="items-grid">
                ${itemsHTML}
            </div>
        </div>
    `;
}

// Function to create category buttons from the loaded categories
function createCategoryButtons(categories) {
    const categoriesContainer = document.querySelector('.menu-categories');
    
    // Clear existing buttons except "All Items"
    const allButton = categoriesContainer.querySelector('.category-btn[onclick="filterCategory(\'all\')"]');
    categoriesContainer.innerHTML = '';
    categoriesContainer.appendChild(allButton);
    
    // Create a button for each category
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'category-btn';
        button.textContent = category.name;
        button.setAttribute('onclick', `filterCategory('${category.slug}')`);
        button.setAttribute('data-category', category.slug);
        categoriesContainer.appendChild(button);
    });
}

// Function to filter menu categories
function filterCategory(categorySlug) {
    // Update active category button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Find and activate the clicked button
    if (categorySlug === 'all') {
        document.querySelector('.category-btn[onclick="filterCategory(\'all\')"]').classList.add('active');
    } else {
        // Find button with matching data-category attribute
        const clickedButton = document.querySelector(`.category-btn[data-category="${categorySlug}"]`);
        if (clickedButton) {
            clickedButton.classList.add('active');
        }
    }
    
    // Filter menu categories
    const menuCategories = document.querySelectorAll('.menu-category');
    menuCategories.forEach(cat => {
        if (categorySlug === 'all') {
            cat.style.display = 'block';
        } else {
            const catSlug = cat.getAttribute('data-category');
            if (catSlug === categorySlug) {
                cat.style.display = 'block';
            } else {
                cat.style.display = 'none';
            }
        }
    });
}

// Load menu when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Load the menu
    loadMenu();
    
    // Set home as active section by default
    showSection('home');
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const targetSection = href.substring(1);
                showSection(targetSection);
                
                // Update URL without page reload
                history.pushState(null, null, href);
            }
        });
    });
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', function() {
        const hash = window.location.hash.substring(1) || 'home';
        showSection(hash);
    });
});

// Handle initial hash if present
window.addEventListener('load', function() {
    const hash = window.location.hash.substring(1);
    if (hash) {
        showSection(hash);
    }
});