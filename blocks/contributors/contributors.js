import { createOptimizedPicture } from '../../scripts/aem.js';

export default async function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'writer-list-image';
      else div.className = 'writer-list-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));

  // Add classes to <a> tags based on their title attribute
  ul.querySelectorAll('p > a').forEach((aLink) => {
    const writerTitle = aLink.getAttribute('title');
    if (writerTitle) {
      const className = `${writerTitle.toLowerCase().replace(/\s+/g, '-')}-link`;
      aLink.classList.add(className);
    }
  });

  block.textContent = '';
  block.append(ul);
}