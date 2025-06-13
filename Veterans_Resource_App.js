const fixedCategoryOrder = [
  "Food",
  "Rent",
  "Housing",
  "Financial Aid",
  "Medical",
  "Utilities",
  "Employment",
  "Veteran Support"
];

const categoriesWithTypes = new Set(["Food", "Housing", "Medical", "Veteran Support"]);

const typesOfAssistanceMap = {
  Food: [
    "Hot Meals",
    "Meals",
    "Meals On Wheels",
    "Nutrition Support",
    "Soup Kitchen",
    "Food Pantry",
  ],
  Housing: [
    "HUD-VASH",
    "Mortgage",
    "Shelter",
    "Short-term Motel Stays",
    "Homeless Assistance",
  ],
  Medical: [
    "Addiction Recovery",
    "Behavioral Health",
    "Caregiver Support",
    "Dental",
    "Home Care Services",
    "Medical Care",
    "Mental Health",
    "PTSD Therapy",
    "Specialty Care",
  ],
  "Veteran Support": [
    "Disability Services",
    "Assistive Technology For Disabled",
    "Benefits Assistance",
    "Childcare",
    "Clothing",
    "Emergency Assistance",
    "Family Support",
    "Legal Aid",
    "Medicaid",
    "Senior Support",
    "SNAP (Food Stamps)",
    "Support for Disabled Veterans",
    "Transition Services",
    "Transportation Services",
    "VA Claims",
    "Veteran Benefits",
  ],
};

let selectedCategories = [];
let selectedTypes = [];
let hoveredCategoryIndex = null;

let organizations = [];
let filteredOrganizations = [];

const mainCategoriesElem = document.getElementById("mainCategories");
const dropdownContainer = document.getElementById("dropdownContainer");
const resultsContainer = document.getElementById("results");
const searchBar = document.getElementById("searchBar");

function titleCase(str) {
  if (!str) return "";
  return str.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

function renderCategories() {
  mainCategoriesElem.innerHTML = "";
  fixedCategoryOrder.forEach((cat, index) => {
    const btn = document.createElement("button");
    btn.textContent = cat;
    btn.classList.add("category-btn");
    if (selectedCategories.includes(cat)) btn.classList.add("selected");
    btn.dataset.index = index;
    btn.addEventListener("mouseenter", () => {
      if (categoriesWithTypes.has(cat)) {
        showDropdown(index);
      } else {
        hideDropdown();
      }
    });
    btn.addEventListener("mouseleave", () => {
      setTimeout(() => {
        if (hoveredCategoryIndex !== index) hideDropdown();
      }, 200);
    });
    btn.onclick = () => {
      if (selectedCategories.includes(cat)) {
        selectedCategories = selectedCategories.filter((c) => c !== cat);
        if (categoriesWithTypes.has(cat)) {
          selectedTypes = selectedTypes.filter(
            (type) => !typesOfAssistanceMap[cat].includes(type)
          );
        }
      } else {
        selectedCategories.push(cat);
      }
      renderCategories();
      filterOrganizations();
      renderResults();
    };
    mainCategoriesElem.appendChild(btn);
  });
}

function showDropdown(index) {
  const cat = fixedCategoryOrder[index];
  if (!categoriesWithTypes.has(cat)) {
    hideDropdown();
    return;
  }
  hoveredCategoryIndex = index;
  const button = mainCategoriesElem.children[index];
  const rect = button.getBoundingClientRect();

  dropdownContainer.style.position = "absolute";
  dropdownContainer.style.top = rect.bottom + window.scrollY + "px";
  dropdownContainer.style.left = rect.left + window.scrollX + "px";
  dropdownContainer.style.width = rect.width + "px";
  dropdownContainer.style.zIndex = 1000;
  dropdownContainer.innerHTML = "";

  const list = document.createElement("div");
  list.className = "dropdown-list";

  typesOfAssistanceMap[cat].forEach((type) => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = type;
    checkbox.checked = selectedTypes.includes(type);
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        if (!selectedTypes.includes(type)) selectedTypes.push(type);
      } else {
        selectedTypes = selectedTypes.filter((t) => t !== type);
      }
      filterOrganizations();
      renderResults();
    });
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(" " + type));
    list.appendChild(label);
  });

  dropdownContainer.appendChild(list);

  dropdownContainer.onmouseleave = () => {
    hoveredCategoryIndex = null;
    hideDropdown();
  };

  filterOrganizations();
  renderResults();
}

function hideDropdown() {
  dropdownContainer.innerHTML = "";
  hoveredCategoryIndex = null;
}

function filterOrganizations() {
  const term = searchBar.value.trim().toLowerCase();

  filteredOrganizations = organizations.filter((org) => {
    if (selectedCategories.length > 0) {
      const orgCats = org.Categories?.toLowerCase() || "";
      const allCatsMatch = selectedCategories.every((cat) =>
        orgCats.includes(cat.toLowerCase())
      );
      if (!allCatsMatch) return false;
    }

    for (const cat of selectedCategories) {
      if (categoriesWithTypes.has(cat)) {
        const orgTypes = org["Types of Assistance"]?.toLowerCase() || "";
        const matchedTypeInCat = typesOfAssistanceMap[cat].some(
          (type) =>
            selectedTypes.includes(type) &&
            orgTypes.includes(type.toLowerCase())
        );
        if (!matchedTypeInCat) return false;
      }
    }

    if (term) {
      const orgName = org["Organization Name"]?.toLowerCase() || "";
      const orgTypes = org["Types of Assistance"]?.toLowerCase() || "";
      if (!orgName.includes(term) && !orgTypes.includes(term)) return false;
    }

    return true;
  });
}

function renderResults() {
  resultsContainer.innerHTML = "";

  if (filteredOrganizations.length === 0) {
    const noResults = document.createElement("div");
    noResults.textContent = "No matching organizations found.";
    noResults.style.fontWeight = "bold";
    resultsContainer.appendChild(noResults);
    return;
  }

  filteredOrganizations.forEach((org) => {
    const orgDiv = document.createElement("div");
    orgDiv.style.marginBottom = "40px";

    // Organization Name - Title Case, Bold, 16pt, Centered, No label
    const orgName = document.createElement("h2");
    orgName.textContent = titleCase(org["Organization Name"]);
    orgName.style.fontWeight = "bold";
    orgName.style.fontSize = "16pt";
    orgName.style.textAlign = "center";
    orgName.style.marginBottom = "16px"; // 1 row space after org name
    orgDiv.appendChild(orgName);

    // Veteran Resources - Bold Title 12pt, Content Italic 12pt
    if (org["Veteran Resources"]) {
      const vetTitle = document.createElement("div");
      vetTitle.textContent = "Veteran Resources";
      vetTitle.style.fontWeight = "bold";
      vetTitle.style.fontSize = "12pt";
      orgDiv.appendChild(vetTitle);

      const vetContent = document.createElement("div");
      vetContent.textContent = org["Veteran Resources"];
      vetContent.style.fontStyle = "italic";
      vetContent.style.fontSize = "12pt";
      orgDiv.appendChild(vetContent);

      // 1 row space after Veteran Resources content
      orgDiv.appendChild(document.createElement("br"));

      // 2pt Divider RGB(0,33,71)
      const divider1 = document.createElement("div");
      divider1.style.height = "2px";
      divider1.style.backgroundColor = "rgb(0,33,71)";
      divider1.style.marginTop = "16px";
      divider1.style.marginBottom = "32px"; // 2 rows space after divider
      orgDiv.appendChild(divider1);
    }

    // Types of Assistance - Bold Title 12pt + Content 12pt
    if (org["Types of Assistance"]) {
      const typesTitle = document.createElement("div");
      typesTitle.textContent = "Types of Assistance";
      typesTitle.style.fontWeight = "bold";
      typesTitle.style.fontSize = "12pt";
      orgDiv.appendChild(typesTitle);

      const typesContent = document.createElement("div");
      typesContent.textContent = org["Types of Assistance"];
      typesContent.style.fontSize = "12pt";
      orgDiv.appendChild(typesContent);

      // 2 rows space after Types of Assistance content
      orgDiv.appendChild(document.createElement("br"));
      orgDiv.appendChild(document.createElement("br"));

      // 2pt Divider RGB(178,34,52)
      const divider2 = document.createElement("div");
      divider2.style.height = "2px";
      divider2.style.backgroundColor = "rgb(178,34,52)";
      divider2.style.marginBottom = "16px"; // 1 row space after divider
      orgDiv.appendChild(divider2);

      // 1 row space after divider (use <br>)
      orgDiv.appendChild(document.createElement("br"));
    }

    // Helper function to add a field with title and content on one line
    function addField(title, content, clickable = false, urlPrefix = "") {
      if (!content || content.trim() === "" || content === "Not Publicly Available") return;

      const line = document.createElement("div");
      line.style.fontSize = "12pt";
      line.style.marginBottom = "8px"; // 1 row space between fields

      const labelSpan = document.createElement("span");
      labelSpan.style.fontWeight = "bold";
      labelSpan.textContent = `${title} – `;
      line.appendChild(labelSpan);

      if (clickable) {
        const link = document.createElement("a");
        link.href = urlPrefix + content;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = content;
        line.appendChild(link);
      } else {
        const contentSpan = document.createElement("span");
        contentSpan.style.fontWeight = "normal";
        contentSpan.textContent = content;
        line.appendChild(contentSpan);
      }

      orgDiv.appendChild(line);
    }

    // Add all fields as per layout spec, only if content exists
    addField("Website", org["Website"], true, "");
    addField("Email", org["Email"], true, "mailto:");
    addField("Phone", org["Phone"], true, "tel:");
    addField("Contact Name", org["Contact Name"]);
    addField("Contact Title", org["Contact Title"]);
    addField("Contact Email", org["Contact Email"], true, "mailto:");
    addField("Contact Phone", org["Contact Phone"], true, "tel:");

    // 2 rows space after contact fields
    orgDiv.appendChild(document.createElement("br"));
    orgDiv.appendChild(document.createElement("br"));

    addField("Eligibility Requirements", org["Eligibility Requirements"]);
    addField("Application Process", org["Application Process"]);
    addField("Documents Required", org["Documents Required"]);
    addField("Notes", org["Notes"]);

    // 2 rows space after Notes
    orgDiv.appendChild(document.createElement("br"));
    orgDiv.appendChild(document.createElement("br"));

    addField("Distance from 34470 (mi)", org["Distance from 34470 (mi)"]);

    if (org["Address"]) {
      const addrDiv = document.createElement("div");
      addrDiv.style.fontSize = "12pt";
      addrDiv.style.marginBottom = "8px"; // 1 row space

      const labelSpan = document.createElement("span");
      labelSpan.style.fontWeight = "bold";
      labelSpan.textContent = "Address – ";
      addrDiv.appendChild(labelSpan);

      const addrLink = document.createElement("a");
      addrLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(org["Address"])}`;
      addrLink.target = "_blank";
      addrLink.rel = "noopener noreferrer";
      addrLink.textContent = org["Address"];
      addrDiv.appendChild(addrLink);

      orgDiv.appendChild(addrDiv);
    }

    addField("Operating Hours", org["Operating Hours"]);

    // 2 rows space after Operating Hours
    orgDiv.appendChild(document.createElement("br"));
    orgDiv.appendChild(document.createElement("br"));

    // Final 2pt divider at bottom (black)
    const finalDivider = document.createElement("div");
    finalDivider.style.height = "2px";
    finalDivider.style.backgroundColor = "black";
    finalDivider.style.marginBottom = "16px"; // space after final divider
    orgDiv.appendChild(finalDivider);

    resultsContainer.appendChild(orgDiv);
  });
}

async function loadData() {
  try {
    const orgRes = await fetch("Veterans_Community_Resource.json");
    organizations = await orgRes.json();

    renderCategories();
    filterOrganizations();
    renderResults();
  } catch (e) {
    resultsContainer.textContent = "Error loading data.";
  }
}

searchBar.addEventListener("input", () => {
  filterOrganizations();
  renderResults();
});

document.addEventListener("DOMContentLoaded", () => {
  loadData();
});
