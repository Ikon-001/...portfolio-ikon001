// ── entrance animations ──
gsap.to('.page-title', {
  opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 0.2
});

gsap.to('.contact-lead', {
  opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.4
});

gsap.to('.contact-form-wrap', {
  opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.5
});

gsap.to('.contact-links', {
  opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.6
});

// ── form send (mailto fallback) ──
const sendBtn = document.getElementById('send-btn');
const formNote = document.getElementById('form-note');

sendBtn.addEventListener('click', () => {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  if (!name || !email || !message) {
    formNote.textContent = 'Please fill in all fields.';
    formNote.style.color = '#D85A30';
    return;
  }

  const mailto = `mailto:ikongiddy411@gmail.com?subject=Message from ${encodeURIComponent(name)}&body=${encodeURIComponent(message)}%0A%0AFrom: ${encodeURIComponent(email)}`;
  window.location.href = mailto;

  formNote.textContent = 'Opening your email client...';
  formNote.style.color = 'var(--accent)';
});

// close nav when a link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
  });
});
