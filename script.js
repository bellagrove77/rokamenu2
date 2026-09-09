(() => {
  const allCards = window.CARDS || [];
  let filtered = [...allCards];
  let index = 0;

  const $ = (id) => document.getElementById(id);
  const flashcard = $('flashcard');
  const categorySelect = $('categorySelect');
  const searchInput = $('searchInput');

  function categories() {
    return ['All categories', ...new Set(allCards.map(c => c.category))];
  }

  function setupCategories() {
    categorySelect.innerHTML = categories().map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  }

  function escapeHtml(value = '') {
    return String(value).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  }

  function applyFilters() {
    const category = categorySelect.value;
    const q = searchInput.value.trim().toLowerCase();
    filtered = allCards.filter(card => {
      const categoryMatch = category === 'All categories' || card.category === category;
      const haystack = [card.name, card.category, ...(card.ingredients || []), ...(card.flavors || [])].join(' ').toLowerCase();
      return categoryMatch && (!q || haystack.includes(q));
    });
    index = 0;
    flashcard.classList.remove('flipped');
    render();
  }

  function renderList(id, items) {
    const el = $(id);
    el.innerHTML = (items || []).map(item => `<li>${escapeHtml(item)}</li>`).join('');
  }

  function render() {
    if (!filtered.length) {
      $('counter').textContent = '0 / 0';
      $('categoryLabel').textContent = '';
      $('foodName').textContent = 'No matching cards';
      $('foodImage').removeAttribute('src');
      $('foodImage').alt = '';
      $('frontCategory').textContent = 'Search';
      $('backFoodName').textContent = 'No matching cards';
      $('backCategory').textContent = 'Search';
      renderList('ingredientList', ['Try another search or category.']);
      $('garnishSection').hidden = true;
      $('flavorSection').hidden = true;
      $('comparisonSection').hidden = true;
      $('sellingSection').hidden = true;
      return;
    }

    if (index >= filtered.length) index = 0;
    if (index < 0) index = filtered.length - 1;
    const card = filtered[index];

    $('counter').textContent = `${index + 1} / ${filtered.length}`;
    $('categoryLabel').textContent = card.category;
    $('frontCategory').textContent = card.category;
    $('backCategory').textContent = card.category;
    $('foodName').textContent = card.name;
    $('backFoodName').textContent = card.name;

    const img = $('foodImage');
    img.src = card.image;
    img.alt = `${card.name} from the Roka Hula training guide`;
    img.onerror = () => {
      img.onerror = null;
      img.alt = `Photo unavailable for ${card.name}`;
      img.style.opacity = '.25';
    };
    img.onload = () => { img.style.opacity = '1'; };

    renderList('ingredientList', card.ingredients);
    renderList('garnishList', card.garnishes);
    $('garnishSection').hidden = !(card.garnishes && card.garnishes.length);

    const flavorSection = $('flavorSection');
    flavorSection.hidden = !(card.flavors && card.flavors.length);
    $('flavorTags').innerHTML = (card.flavors || []).map(f => `<span class="tag">${escapeHtml(f)}</span>`).join('');

    $('comparisonSection').hidden = !card.comparison;
    $('comparisonText').textContent = card.comparison || '';

    const selling = (card.description || '').trim();
    $('sellingSection').hidden = !selling;
    $('sellingText').textContent = selling;
  }

  function flip() { if (filtered.length) flashcard.classList.toggle('flipped'); }
  function next() { if (!filtered.length) return; index = (index + 1) % filtered.length; flashcard.classList.remove('flipped'); render(); }
  function prev() { if (!filtered.length) return; index = (index - 1 + filtered.length) % filtered.length; flashcard.classList.remove('flipped'); render(); }
  function randomCard() {
    if (!filtered.length) return;
    if (filtered.length === 1) return render();
    let nextIndex;
    do { nextIndex = Math.floor(Math.random() * filtered.length); } while (nextIndex === index);
    index = nextIndex;
    flashcard.classList.remove('flipped');
    render();
  }
  function shuffleCards() {
    for (let i = filtered.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
    }
    index = 0;
    flashcard.classList.remove('flipped');
    render();
  }

  flashcard.addEventListener('click', flip);
  flashcard.addEventListener('keydown', e => { if (e.key === 'Enter') flip(); });
  $('flipBtn').addEventListener('click', flip);
  $('nextBtn').addEventListener('click', next);
  $('prevBtn').addEventListener('click', prev);
  $('randomBtn').addEventListener('click', randomCard);
  $('shuffleBtn').addEventListener('click', shuffleCards);
  categorySelect.addEventListener('change', applyFilters);
  searchInput.addEventListener('input', applyFilters);

  document.addEventListener('keydown', e => {
    if (document.activeElement === searchInput || document.activeElement === categorySelect) return;
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
    if (e.code === 'Space') { e.preventDefault(); flip(); }
  });

  setupCategories();
  render();
})();
