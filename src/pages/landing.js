export class Landing {
  attached() {
    this.initTyping();
  }

  initTyping() {
    // Only run if IntersectionObserver is supported (modern browsers)
    if (!window.IntersectionObserver) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay ? parseInt(entry.target.dataset.delay, 10) : 0;
          setTimeout(() => {
            this.typewrite(entry.target);
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll('.js-typewriter');
    elements.forEach(el => {
      // Store the original text and visually hide it without breaking layout
      el.dataset.text = el.textContent;
      el.textContent = '\u00A0'; // Use non-breaking space initially to keep height
      observer.observe(el);
    });
  }

  typewrite(element) {
    const text = element.dataset.text;
    element.textContent = ''; // clear initial non-breaking space
    element.classList.add('typing-cursor');

    let i = 0;
    const speed = 40; // ms per char

    const type = () => {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      } else {
        // Animation complete, remove cursor after a delay
        setTimeout(() => element.classList.remove('typing-cursor'), 1500);
      }
    };

    type();
  }
}
