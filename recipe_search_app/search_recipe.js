const apiURL = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
const indianAPI = "https://www.themealdb.com/api/json/v1/1/filter.php?a=Indian";

let allRecipes = [];

// -------------------- PAGE LOAD --------------------
window.onload = async () => {
  const start = performance.now();

  await loadIndianRecipes(); // Load Indian dishes first
  await loadRandomRecipes(); // Load random dishes
  showTodaySpecial();        // Display one random "special"
  displayRecipes(allRecipes); // Render all

  attachSearchListeners();

  const end = performance.now();
  console.log(`✅ Page loaded in ${(end - start).toFixed(2)} ms`);
};

// -------------------- LOAD INDIAN RECIPES --------------------
async function loadIndianRecipes() {
  try {
    const res = await fetch(indianAPI);
    const data = await res.json();
    if (!data.meals) return;

    // Take only first 50 Indian dishes to avoid lag
    const limited = data.meals.slice(0, 50);

    // Fetch full details in parallel
    const fetches = limited.map(meal => fetch(apiURL + meal.strMeal));
    const responses = await Promise.all(fetches);
    const jsons = await Promise.all(responses.map(r => r.json()));

    jsons.forEach(j => {
      if (j.meals) allRecipes.push(j.meals[0]);
    });

  } catch (err) {
    console.error("Error loading Indian recipes:", err);
  }
}

// -------------------- LOAD RANDOM MIXED RECIPES --------------------
async function loadRandomRecipes() {
  const letters = "abcdefghijklmnopqrstuvwxyz".split("");
  const randomLetters = letters.sort(() => 0.5 - Math.random()).slice(0, 10); // only 2 random sets

  try {
    const fetches = randomLetters.map(letter => fetch(apiURL + letter));
    const responses = await Promise.all(fetches);
    const jsons = await Promise.all(responses.map(r => r.json()));

    jsons.forEach(data => {
      if (data.meals) allRecipes.push(...data.meals.slice(0, 5)); // take only few from each
    });
  } catch (err) {
    console.error("Error loading random recipes:", err);
  }
}
let visibleCount = 12;
function displayRecipes(list) {
  const recipeList = document.getElementById("recipeList");
  recipeList.innerHTML = "";

  list.slice(0, visibleCount).forEach((meal) => {
    // your card code here...
  });

  if (list.length > visibleCount) {
    const btn = document.createElement("button");
    btn.textContent = "Load More";
    btn.classList.add("load-more");
    btn.onclick = () => {
      visibleCount += 12;
      displayRecipes(list);
    };
    recipeList.appendChild(btn);
  }
}

// -------------------- SEARCH --------------------
function attachSearchListeners() {
  const searchInput = document.getElementById("searchInput");
  const todaySpecialSection = document.getElementById("todaySpecial");
  const recipeList = document.getElementById("recipeList");

  const searchButton = document.querySelector(".search-area button");
  searchButton.id = "searchBtn"; // ensure ID

  async function handleSearch() {
    const query = searchInput.value.trim();
    if (query.length === 0) {
      todaySpecialSection.style.display = "block";
      displayRecipes(allRecipes);
      return;
    }
    todaySpecialSection.style.display = "none";
    await liveSearch(query);
  }

  searchButton.addEventListener("click", handleSearch);
  searchInput.addEventListener("keyup", async (e) => {
    if (e.key === "Enter") handleSearch();
    else if (searchInput.value.trim().length === 0) {
      todaySpecialSection.style.display = "block";
      displayRecipes(allRecipes);
    }
  });
}

// -------------------- LIVE SEARCH --------------------
async function liveSearch(query) {
  try {
    const res = await fetch(apiURL + query);
    const data = await res.json();

    if (!data.meals) {
      displayRecipes([]);
    } else {
      displayRecipes(data.meals);
    }
  } catch (err) {
    console.error("Search error:", err);
    displayRecipes([]);
  }
}

// -------------------- DISPLAY RECIPES --------------------
function displayRecipes(list) {
  const recipeList = document.getElementById("recipeList");
  recipeList.innerHTML = "";

  if (!list || list.length === 0) {
    recipeList.innerHTML = `<p style="text-align:center;font-size:18px;">❌ Recipe not available</p>`;
    return;
  }

  const fragment = document.createDocumentFragment();

  list.forEach((meal) => {
    const card = document.createElement("div");
    card.classList.add("recipe-card");

    card.innerHTML = `
      <div class="img-container">
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" loading="lazy">
        <div class="overlay">
          <h3>${meal.strMeal}</h3>
          <p><b>Category:</b> ${meal.strCategory || "N/A"}</p>
          <p><b>Area:</b> ${meal.strArea || "N/A"}</p>
          <p><b>Ingredients:</b> ${getIngredients(meal)}</p>
          <p><b>Instructions:</b> ${meal.strInstructions?.substring(0, 200) || "N/A"}...</p>
        </div>
      </div>
      <div class="recipe-footer">
        <div class="recipe-name">${meal.strMeal}</div>
        <div class="options">
          <select onchange="addToFavorites(this, '${meal.strMeal}')">
            <option selected disabled>Options</option>
            <option>Add to Favorites</option>
          </select>
        </div>
      </div>
    `;

    // Toggle overlay on click
    card.addEventListener("click", (e) => {
      if (e.target.tagName === "SELECT") return; // skip dropdown clicks
      const isActive = card.classList.contains("active");
      document.querySelectorAll(".recipe-card.active").forEach(c => c.classList.remove("active"));
      if (!isActive) card.classList.add("active");
    });

    fragment.appendChild(card);
  });

  recipeList.appendChild(fragment);
}

// -------------------- GET INGREDIENTS --------------------
function getIngredients(meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim() !== "") {
      ingredients.push(`${ingredient} (${measure || ""})`);
    }
  }
  return ingredients.slice(0, 6).join(", "); // show only first 6 for speed
}

// -------------------- ADD TO FAVORITES --------------------
function addToFavorites(select, name) {
  if (select.value === "Add to Favorites") {
    const list = document.getElementById("favoriteList");
    if (list.children[0].textContent === "No favorites yet") list.innerHTML = "";

    if (!Array.from(list.children).find((li) => li.textContent === name)) {
      const li = document.createElement("li");
      li.textContent = name;
      list.appendChild(li);
      alert(`✅ ${name} added to favorites!`);
    }
    select.value = "Options";
  }
}

// -------------------- TODAY'S SPECIAL --------------------
function showTodaySpecial() {
  const special = document.getElementById("todaySpecial");
  if (allRecipes.length === 0) return;

  const recipe = allRecipes[Math.floor(Math.random() * allRecipes.length)];
  special.innerHTML = `
    <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
    <div class="overlay">
      <h3>${recipe.strMeal}</h3>
      <p>${recipe.strInstructions?.substring(0, 180) || ""}...</p>
    </div>
  `;
}
// -------------------- MENU INFORMATION --------------------
document.getElementById("homeLink").addEventListener("click", () => {
  showInfoSection(`
    <h2>🏠 Welcome to भूक मंत्र - Recipe Haven</h2>
    <p>This website helps you explore a world of delicious recipes! 🍛</p>
    <ul>
      <li>🔍 Use the search bar to find recipes instantly.</li>
      <li>⭐ Add your favorite recipes to the sidebar.</li>
      <li>🌟 Check “Today’s Special” for a surprise dish every day.</li>
    </ul>
  `);
});

document.getElementById("aboutLink").addEventListener("click", () => {
  showInfoSection(`
    <h2>ℹ️ About Us</h2>
    <p><b>भूक मंत्र - Recipe Haven</b> is your one-stop hub for exploring Indian and global recipes. 
    Our mission is to make cooking fun, easy, and flavorful for everyone — whether you're a beginner or a pro chef.</p>
    <p>We fetch recipes from trusted sources and display them beautifully so you can cook confidently at home.</p>
  `);
});

document.getElementById("contactLink").addEventListener("click", () => {
  showInfoSection(`
    <h2>📞 Contact Us</h2>
    <p>We’d love to hear from you! Reach us through:</p>
    <ul>
      <li>Email: <a href="mailto:support@bhoookmantra.com">support@bhoookmantra.com</a></li>
      <li>Instagram: <a href="#">@bhoookmantra_recipes</a></li>
      <li>Facebook: <a href="#">facebook.com/bhoookmantra</a></li>
    </ul>
  `);
});

document.getElementById("helpLink").addEventListener("click", () => {
  showInfoSection(`
    <h2>❓ Need Help?</h2>
    <p>Here’s how you can use this website efficiently:</p>
    <ul>
      <li>Use the <b>Search</b> bar to look for any dish you like.</li>
      <li>Click on a recipe card to view ingredients and instructions.</li>
      <li>Save your favorites by choosing <b>Add to Favorites</b>.</li>
      <li>Click <b>Today’s Special</b> to view a randomly chosen featured recipe.</li>
    </ul>
    <p>If something isn’t working, refresh the page or check your internet connection.</p>
  `);
});

function showInfoSection(content) {
  const infoSection = document.getElementById("infoSection");
  infoSection.innerHTML = content;
  infoSection.scrollIntoView({ behavior: "smooth" });
}

// -------------------- LANGUAGE TRANSLATION --------------------

