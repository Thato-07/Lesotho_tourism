/* Discover Lesotho - interactive features */
document.addEventListener('DOMContentLoaded', () => {
  initRegistrationForm();
  initGallery();
});

/* ---------- Feature 1: registration form validation ---------- */
function localDateString() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function initRegistrationForm() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  const rules = {
    fullname: v => /^[A-Za-z' .-]{3,}$/.test(v.trim()) && v.trim().includes(' ') || 'Enter your first and last name (letters only).',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || 'Enter a valid email, e.g. name@example.com.',
    phone: v => /^(\+266|0)?\s?[256]\d{3}\s?\d{4}$/.test(v.trim()) || 'Enter a valid Lesotho number, e.g. +266 5812 3456.',
    destination: v => v !== '' || 'Please choose a destination.',
    travelDate: v => (v !== '' && v >= localDateString()) || 'Choose a travel date that is today or later.',
    password: v => /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(v) || 'Use at least 8 characters with a letter and a number.',
    confirm: v => v === form.password.value && v !== '' || 'Passwords do not match.',
    terms: () => form.terms.checked || 'You must accept the terms to register.'
  };

  const show = (field, result) => {
    const ok = result === true;
    field.classList.toggle('is-invalid', !ok);
    field.classList.toggle('is-valid', ok);
    const box = document.getElementById(field.id + 'Error');
    if (box) box.textContent = ok ? '' : result;
    return ok;
  };

  const checkGender = () => {
    const ok = form.querySelector('input[name="gender"]:checked') !== null;
    document.getElementById('genderError').textContent = ok ? '' : 'Please select an option.';
    return ok;
  };

  const dateField = form.elements.travelDate;
  if (dateField) dateField.min = localDateString();

  Object.keys(rules).forEach(name => {
    const f = form.elements[name];
    f.addEventListener('blur', () => show(f, rules[name](f.type === 'checkbox' ? '' : f.value)));
    f.addEventListener('input', () => { if (f.classList.contains('is-invalid')) show(f, rules[name](f.value)); });
  });

  form.elements.confirm.addEventListener('input', () => {
    if (form.elements.confirm.value) show(form.elements.confirm, rules.confirm(form.elements.confirm.value));
  });
  form.elements.password.addEventListener('input', () => {
    if (form.elements.confirm.value) show(form.elements.confirm, rules.confirm(form.elements.confirm.value));
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = checkGender();
    const dateField = form.elements.travelDate;
  if (dateField) dateField.min = localDateString();

  Object.keys(rules).forEach(name => {
      const f = form.elements[name];
      if (!show(f, rules[name](f.type === 'checkbox' ? '' : f.value))) valid = false;
    });
    const alertBox = document.getElementById('formAlert');
    if (valid) {
      const first = form.fullname.value.trim().split(' ')[0];
      alertBox.className = 'alert alert-success mt-3';
      alertBox.textContent = `Thank you, ${first}! Your registration for ${form.destination.value} is received. (Demo only: no data is sent or stored.)`;
      form.reset();
      form.querySelectorAll('.is-valid').forEach(el => el.classList.remove('is-valid'));
    } else {
      alertBox.className = 'alert alert-danger mt-3';
      alertBox.textContent = 'Please fix the highlighted fields and try again.';
      const bad = form.querySelector('.is-invalid');
      if (bad) bad.focus();
    }
  });
}

/* ---------- Feature 2: gallery lightbox (select, preview, next/previous) ---------- */
function initGallery() {
  const items = [...document.querySelectorAll('[data-gallery]')];
  const modalEl = document.getElementById('galleryModal');
  if (!items.length || !modalEl) return;

  const modal = new bootstrap.Modal(modalEl);
  const img = document.getElementById('gImg');
  const cap = document.getElementById('gCap');
  const count = document.getElementById('gCount');
  const thumbs = document.getElementById('gThumbs');
  let current = 0;

  thumbs.innerHTML = items.map((b, i) =>
    `<img class="thumb" src="${b.dataset.src}" alt="Thumbnail ${i + 1}: ${b.dataset.title}" data-i="${i}" tabindex="0">`).join('');

  const show = i => {
    current = (i + items.length) % items.length;
    const b = items[current];
    img.src = b.dataset.src;
    img.alt = b.dataset.alt;
    cap.textContent = b.dataset.title;
    count.textContent = `${current + 1} / ${items.length}`;
    thumbs.querySelectorAll('.thumb').forEach((t, n) => t.classList.toggle('on', n === current));
  };

  items.forEach((b, i) => b.addEventListener('click', () => { show(i); modal.show(); }));
  document.getElementById('gPrev').addEventListener('click', () => show(current - 1));
  document.getElementById('gNext').addEventListener('click', () => show(current + 1));
  thumbs.addEventListener('click', e => { if (e.target.dataset.i !== undefined) show(+e.target.dataset.i); });
  thumbs.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.dataset.i !== undefined) { e.preventDefault(); show(+e.target.dataset.i); } });
  modalEl.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') show(current + 1);
    if (e.key === 'ArrowLeft') show(current - 1);
  });
}
