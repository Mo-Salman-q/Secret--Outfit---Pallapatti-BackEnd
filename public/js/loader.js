// Loader Controller
class LoaderManager {
  constructor() {
    this.loader = document.getElementById('loaderOverlay');
    this.hideDelay = 500; // ms before hiding loader
  }

  show() {
    if (this.loader) {
      this.loader.classList.remove('hide');
    }
  }

  hide() {
    if (this.loader) {
      setTimeout(() => {
        this.loader.classList.add('hide');
      }, this.hideDelay);
    }
  }

  setDelay(ms) {
    this.hideDelay = ms;
  }
}

// Initialize loader
const loaderManager = new LoaderManager();

// Show loader on page load
window.addEventListener('load', () => {
  loaderManager.hide();
});

// Hide loader immediately when page is restored from BFCache (back/forward)
window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    loaderManager.setDelay(0);
    loaderManager.hide();
  }
});

// Show loader before navigation
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href]');
  if (link && !link.target && link.hostname === window.location.hostname) {
    loaderManager.show();
  }
});

// API Promise helper with loader
async function fetchWithLoader(url, options = {}) {
  loaderManager.show();
  try {
    const response = await fetch(url, options);
    return response;
  } finally {
    loaderManager.hide();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LoaderManager, loaderManager, fetchWithLoader };
}
