import { createOptimizedPicture } from '../../scripts/aem.js';

// Function to fetch card data from query-index.json and filter by template
async function fetchCardsData() {
  try {
    const response = await fetch(`/query-index.json`);
    const data = await response.json();

    // Filter data to only include cards where template is 'magazine'
    const filteredData = data.data.filter(card => card.template === 'magazine');

    // Check the current URL
    const currentPath = window.location.pathname;

    // If the path is not '/magazine', limit the result to the first 4 items
    if (currentPath !== '/magazine') {
      return filteredData.slice(0, 4); // Return only the first 4 items
    }

    // Otherwise, return all data for the '/magazine' URL
    return filteredData;
  } catch (error) {
    console.error('Error fetching card data:', error);
    return [];
  }
}

export default async function decorate(block) {
  const ul = document.createElement('ul');

  // Fetch and filter card data
  const cardData = await fetchCardsData();

  if (cardData.length) {
    cardData.forEach((card) => {
      // Create the <li> element
      const li = document.createElement('li');

      // Create an anchor <a> element and set the href to card.path
      const anchor = document.createElement('a');
      anchor.href = card.path;
      anchor.className = 'cards-card-link'; // Add any class if needed for styling

      // Make the anchor tag target "_blank" to open the link in a new tab (optional)
      // anchor.target = '_blank';

      // Create the card image
      const pictureWrapper = document.createElement('div');
      pictureWrapper.className = 'cards-card-image';

      // Construct the full image URL
      const fullImageUrl = `https://example.com${card.image}`; // Replace with your actual domain

      const picture = createOptimizedPicture(fullImageUrl, card.imageAlt, false, [{ width: '750' }]);
      pictureWrapper.append(picture);
      anchor.append(pictureWrapper); // Append picture to the anchor tag

      // Create the card body
      const bodyWrapper = document.createElement('div');
      bodyWrapper.className = 'cards-card-body';

      // Add title
      const title = document.createElement('h3');
      title.textContent = card.title;
      bodyWrapper.append(title);

      // Add description
      const description = document.createElement('p');
      description.textContent = card.description;
      bodyWrapper.append(description);

      // Add button if exists
      if (card.buttonLink && card.buttonText) {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';

        const button = document.createElement('a');
        button.href = card.buttonLink;
        button.textContent = card.buttonText;
        button.className = 'button';

        buttonContainer.append(button);
        bodyWrapper.append(buttonContainer);
      }

      anchor.append(bodyWrapper); // Append the card body to the anchor tag
      li.append(anchor); // Append the anchor to the <li>
      ul.append(li); // Append the <li> to the <ul>
    });

  } else {
    // No filtered cards found
    const noResults = document.createElement('p');
    noResults.textContent = 'No magazine templates found.';
    block.append(noResults);
  }

  // If the block has existing child elements, transform them into cards as fallback
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-card-image';
      } else {
        div.className = 'cards-card-body';
      }
    });
    ul.append(li);
  });

  // Enhance images for lazy loading and optimized display
  ul.querySelectorAll('picture > img').forEach((img) =>
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]))
  );

  // Ensure card images are clickable by wrapping them in the button links
  ul.querySelectorAll('.cards-card-body .button-container a').forEach((a, index) => {
    const picture = ul.querySelectorAll('picture')[index];
    if (picture) {
      const link = a.cloneNode(true);
      link.textContent = '';
      picture.parentNode.insertBefore(link, picture);
      link.appendChild(picture);
    }
  });

  // Add a specific class to the second paragraph in card bodies, if applicable
  ul.querySelectorAll('.cards-card-body').forEach((container) => {
    const paragraphs = container.querySelectorAll('p');
    if (paragraphs.length >= 2) {
      paragraphs[1].classList.add('card-paragraph'); // Adds 'card-paragraph' class to the second <p>
    }
  });

  // Clear and append the final list of cards to the block
  block.textContent = '';
  block.append(ul);
}
