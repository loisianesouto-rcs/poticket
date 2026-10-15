/**
 * POTicket - Módulo Universal de Acessibilidade (WCAG 2.1 AA)
 * Funciona em 100% das telas da aplicação
 */
const AccessibilityManager = {
  state: {
    fontSize: 'normal', // normal, large, xlarge
    highContrast: false,
    dyslexiaMode: false,
    screenReaderActive: false
  },

  init() {
    this.loadPreferences();
    this.bindEvents();
    this.applyState();
  },

  loadPreferences() {
    try {
      const saved = localStorage.getItem('poticket_a11y');
      if (saved) {
        this.state = { ...this.state, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Erro ao carregar preferências de acessibilidade', e);
    }
  },

  savePreferences() {
    try {
      localStorage.setItem('poticket_a11y', JSON.stringify(this.state));
    } catch (e) {
      console.warn('Erro ao salvar preferências de acessibilidade', e);
    }
  },

  applyState() {
    const body = document.body;
    
    // Tamanho de Fonte
    body.classList.remove('font-large', 'font-xlarge');
    if (this.state.fontSize === 'large') body.classList.add('font-large');
    if (this.state.fontSize === 'xlarge') body.classList.add('font-xlarge');

    // Alto Contraste
    if (this.state.highContrast) {
      body.classList.add('high-contrast');
    } else {
      body.classList.remove('high-contrast');
    }

    // Modo Dislexia
    if (this.state.dyslexiaMode) {
      body.classList.add('dyslexia-mode');
    } else {
      body.classList.remove('dyslexia-mode');
    }

    this.savePreferences();
  },

  toggleDrawer(show) {
    const drawer = document.getElementById('accessibilityDrawer');
    const overlay = document.getElementById('accessibilityOverlay');
    if (!drawer) return;

    if (show !== undefined) {
      drawer.classList.toggle('open', show);
      if (overlay) overlay.style.display = show ? 'block' : 'none';
    } else {
      const isOpen = drawer.classList.contains('open');
      drawer.classList.toggle('open', !isOpen);
      if (overlay) overlay.style.display = !isOpen ? 'block' : 'none';
    }
  },

  increaseFont() {
    if (this.state.fontSize === 'normal') this.state.fontSize = 'large';
    else if (this.state.fontSize === 'large') this.state.fontSize = 'xlarge';
    this.applyState();
  },

  decreaseFont() {
    if (this.state.fontSize === 'xlarge') this.state.fontSize = 'large';
    else if (this.state.fontSize === 'large') this.state.fontSize = 'normal';
    this.applyState();
  },

  toggleHighContrast() {
    this.state.highContrast = !this.state.highContrast;
    this.applyState();
  },

  toggleDyslexia() {
    this.state.dyslexiaMode = !this.state.dyslexiaMode;
    this.applyState();
  },

  readCurrentScreen() {
    if (!('speechSynthesis' in window)) {
      alert('Síntese de voz não suportada pelo seu navegador.');
      return;
    }

    window.speechSynthesis.cancel();
    const activeView = document.querySelector('.view-panel:not([style*="display: none"])');
    const textToRead = activeView ? activeView.innerText : document.body.innerText;

    const utterance = new SpeechSynthesisUtterance(textToRead.slice(0, 1000));
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  },

  bindEvents() {
    // Tecla de atalho Alt + A para acessibilidade rápida
    window.addEventListener('keydown', (e) => {
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        this.toggleDrawer();
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  AccessibilityManager.init();
});
