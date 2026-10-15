/**
 * POTICKET - CORE APPLICATION LOGIC
 * Senior Full Stack PWA Implementation
 * Otimizações de UX, Responsividade, Scroll-Snap e Acessibilidade
 */

const App = {
  state: {
    user: null,
    activeView: 'home',
    events: [],
    selectedEvent: null,
    selectedBatch: null,
    ticketQty: 1,
    orders: [],
    myTickets: [],
    loginCpf: '',
    registrationData: {},
    selectedCity: 'all',
    selectedCategory: 'all',
    searchQuery: ''
  },

  initialEvents: [
    {
      id: 1,
      title: 'Forró Caju 2026',
      category: 'festas',
      categoryName: 'Festas',
      icon: '🎉',
      city: 'Aracaju',
      state: 'SE',
      date: '12 Jun 2026',
      time: '20:00',
      venue: 'Praça de Eventos Hilton Lopes',
      price: 90.0,
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
      featured: true,
      description: 'A maior festa junina do Nordeste com mais de 30 atrações nacionais, praça de alimentação e segurança completa.',
      pixKey: 'forrocaju@poticket.com.br',
      batches: [
        { id: 101, name: 'Pista - 1º Lote', price: 90.0, qty: 150 },
        { id: 102, name: 'Camarote Open Bar', price: 210.0, qty: 50 }
      ]
    },
    {
      id: 2,
      title: 'Nordeste Tech Summit',
      category: 'congressos',
      categoryName: 'Congressos',
      icon: '🎤',
      city: 'Fortaleza',
      state: 'CE',
      date: '05 Ago 2026',
      time: '09:00',
      venue: 'Centro de Eventos do Ceará',
      price: 680.0,
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
      featured: true,
      description: 'Congresso líder de tecnologia, inovação e inteligência artificial reunindo grandes líderes do Brasil.',
      pixKey: 'techsummit@poticket.com.br',
      batches: [
        { id: 201, name: 'Passe Geral', price: 680.0, qty: 300 },
        { id: 202, name: 'VIP + Workshops', price: 850.0, qty: 80 }
      ]
    },
    {
      id: 5,
      title: 'Corrida das Dunas',
      category: 'corridas',
      categoryName: 'Corridas',
      icon: '🏃',
      city: 'Natal',
      state: 'RN',
      date: '19 Jul 2026',
      time: '06:00',
      venue: 'Parque das Dunas',
      price: 150.0,
      image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&auto=format&fit=crop&q=80',
      featured: true,
      description: 'Circuito desafiador pelas famosas dunas potiguares com percursos de 5k, 10k e 15k.',
      pixKey: 'dunas@poticket.com.br',
      batches: [
        { id: 501, name: 'Inscrição Geral', price: 150.0, qty: 400 }
      ]
    },
    {
      id: 3,
      title: 'Micareta de Feira',
      category: 'shows',
      categoryName: 'Shows',
      icon: '🎵',
      city: 'Feira de Santana',
      state: 'BA',
      date: '10 Out 2026',
      time: '18:00',
      venue: 'Circuito Maneca Ferreira',
      price: 320.0,
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
      featured: false,
      description: 'O maior carnaval fora de época do interior da Bahia com grandes trios e blocos consagrados.',
      pixKey: 'micareta@poticket.com.br',
      batches: [
        { id: 301, name: 'Abadá Pista', price: 320.0, qty: 200 },
        { id: 302, name: 'Camarote Prime', price: 580.0, qty: 40 }
      ]
    },
    {
      id: 4,
      title: 'Maratona do Sol',
      category: 'corridas',
      categoryName: 'Corridas',
      icon: '🏃',
      city: 'Fortaleza',
      state: 'CE',
      date: '28 Set 2026',
      time: '05:30',
      venue: 'Aterro da Praia de Iracema',
      price: 200.0,
      image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&auto=format&fit=crop&q=80',
      featured: false,
      description: 'Corrida rústica com distâncias de 5km, 10km, 21km e 42km com vista panorâmica do litoral cearense.',
      pixKey: 'maratona@poticket.com.br',
      batches: [
        { id: 401, name: 'Kit Básico', price: 120.0, qty: 500 },
        { id: 402, name: 'Kit Premium', price: 200.0, qty: 300 }
      ]
    },
    {
      id: 6,
      title: 'Congresso de Cultura',
      category: 'congressos',
      categoryName: 'Congressos',
      icon: '🎤',
      city: 'Recife',
      state: 'PE',
      date: '22 Nov 2026',
      time: '14:00',
      venue: 'Centro de Convenções de Pernambuco',
      price: 480.0,
      image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&auto=format&fit=crop&q=80',
      featured: false,
      description: 'Encontro internacional sobre patrimônio histórico, arte popular e economia criativa no Nordeste.',
      pixKey: 'cultura@poticket.com.br',
      batches: [
        { id: 601, name: 'Ingresso Completo', price: 480.0, qty: 250 }
      ]
    }
  ],

  init() {
    this.loadStorage();
    this.initPWA();
    this.bindEvents();
    this.renderCatalog();
    
    setTimeout(() => {
      const splash = document.getElementById('splashScreen');
      if (splash) {
        splash.style.opacity = '0';
        setTimeout(() => splash.remove(), 450);
      }
    }, 1400);
  },

  loadStorage() {
    try {
      const savedUser = localStorage.getItem('poticket_user');
      if (savedUser) this.state.user = JSON.parse(savedUser);

      const savedEvents = localStorage.getItem('poticket_events');
      if (savedEvents) {
        const parsed = JSON.parse(savedEvents);
        if (parsed.length < this.initialEvents.length) {
          this.state.events = this.initialEvents;
          this.saveStorage();
        } else {
          this.state.events = parsed;
        }
      } else {
        this.state.events = this.initialEvents;
      }

      const savedTickets = localStorage.getItem('poticket_tickets');
      if (savedTickets) this.state.myTickets = JSON.parse(savedTickets);
    } catch (e) {
      this.state.events = this.initialEvents;
    }
  },

  saveStorage() {
    try {
      localStorage.setItem('poticket_events', JSON.stringify(this.state.events));
      localStorage.setItem('poticket_tickets', JSON.stringify(this.state.myTickets));
      if (this.state.user) {
        localStorage.setItem('poticket_user', JSON.stringify(this.state.user));
      } else {
        localStorage.removeItem('poticket_user');
      }
    } catch (e) {
      console.error('Erro de persistência local', e);
    }
  },

  initPWA() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch((err) => {
        console.warn('SW register notice:', err);
      });
    }
  },

  haptic() {
    if (window.navigator && window.navigator.vibrate) {
      try { window.navigator.vibrate(12); } catch (_) {}
    }
  },

  switchView(viewName) {
    this.haptic();
    this.state.activeView = viewName;

    document.querySelectorAll('.view-panel').forEach((el) => {
      el.style.display = 'none';
    });

    const target = document.getElementById('view-' + viewName);
    if (target) {
      target.style.display = 'block';
      window.scrollTo(0, 0);
    }

    document.querySelectorAll('.nav-item-btn').forEach((btn) => {
      btn.classList.remove('active');
    });
    const activeNavBtn = document.querySelector(`.nav-item-btn[data-view="${viewName}"]`);
    if (activeNavBtn) activeNavBtn.classList.add('active');

    // Sincronizar botões da Navbar Desktop
    document.querySelectorAll('.desktop-nav-btn').forEach((btn) => {
      btn.classList.remove('active');
    });
    const activeDesktopBtn = document.querySelector(`.desktop-nav-btn[data-view="${viewName}"]`);
    if (activeDesktopBtn) activeDesktopBtn.classList.add('active');

    // Controlar visibilidade da Desktop Navbar
    const desktopNavbar = document.getElementById('desktopNavbar');
    const authViews = ['login-step1', 'login-step2', 'register-step1', 'register-step2', 'forgot-password'];
    if (desktopNavbar) {
      desktopNavbar.style.display = authViews.includes(viewName) ? 'none' : '';
    }

    // Split-screen class para login
    const loginStep1 = document.getElementById('view-login-step1');
    if (loginStep1) {
      if (viewName === 'login-step1') {
        loginStep1.classList.add('split-login-active');
      } else {
        loginStep1.classList.remove('split-login-active');
      }
    }

    const bottomNav = document.getElementById('bottomNav');
    if (bottomNav) {
      bottomNav.style.display = authViews.includes(viewName) ? 'none' : '';
    }

    if (viewName === 'profile') this.renderProfile();
    if (viewName === 'my-tickets') this.renderMyTickets();
  },

  validateCpf(cpf) {
    const clean = cpf.replace(/\D/g, '');
    if (clean.length !== 11 || /^(\d)\1{10}$/.test(clean)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(clean.charAt(i)) * (10 - i);
    let rem = sum % 11;
    let d1 = rem < 2 ? 0 : 11 - rem;
    if (parseInt(clean.charAt(9)) !== d1) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(clean.charAt(i)) * (11 - i);
    rem = sum % 11;
    let d2 = rem < 2 ? 0 : 11 - rem;
    return parseInt(clean.charAt(10)) === d2;
  },

  calculateAge(birthDateStr) {
    if (!birthDateStr) return 0;
    const bDate = new Date(birthDateStr);
    const today = new Date();
    let age = today.getFullYear() - bDate.getFullYear();
    const m = today.getMonth() - bDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < bDate.getDate())) {
      age--;
    }
    return age;
  },

  formatCpf(value) {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14);
  },

  formatCep(value) {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 9);
  },

  async lookupCep(cepInput, formPrefix = 'reg') {
    const cleanCep = cepInput.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    const streetEl = document.getElementById(`${formPrefix}-street`);
    const neighEl = document.getElementById(`${formPrefix}-neighborhood`);
    const cityEl = document.getElementById(`${formPrefix}-city`);
    const stateEl = document.getElementById(`${formPrefix}-state`);
    const numEl = document.getElementById(`${formPrefix}-number`);

    try {
      this.showToast('Buscando endereço via CEP...');
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        this.showToast('CEP não encontrado. Preencha manualmente.', 'error');
        return;
      }

      if (streetEl) streetEl.value = data.logradouro || '';
      if (neighEl) neighEl.value = data.bairro || '';
      if (cityEl) cityEl.value = data.localidade || '';
      if (stateEl) stateEl.value = data.uf || '';

      this.showToast('Endereço carregado com sucesso!');
      if (numEl) numEl.focus();
    } catch (err) {
      console.warn('Erro ao consultar ViaCEP', err);
    }
  },

  // =========================================================================
  // CATÁLOGO COM CARDS IDÊNTICOS À IMAGEM DE REFERÊNCIA
  // =========================================================================
  renderCatalog() {
    const featuredContainer = document.getElementById('featuredList');
    const allEventsContainer = document.getElementById('allEventsList');
    if (!featuredContainer || !allEventsContainer) return;

    const filtered = this.state.events.filter((evt) => {
      const matchCity = this.state.selectedCity === 'all' || evt.city.toLowerCase() === this.state.selectedCity.toLowerCase();
      const matchCategory = this.state.selectedCategory === 'all' || evt.category === this.state.selectedCategory;
      const matchSearch = !this.state.searchQuery || 
        evt.title.toLowerCase().includes(this.state.searchQuery.toLowerCase()) ||
        evt.venue.toLowerCase().includes(this.state.searchQuery.toLowerCase()) ||
        evt.city.toLowerCase().includes(this.state.searchQuery.toLowerCase());
      return matchCity && matchCategory && matchSearch;
    });

    // 1. CARDS EM DESTAQUE (Exatamente conforme a imagem enviada)
    const featuredEvents = filtered.filter(e => e.featured);
    if (featuredEvents.length > 0) {
      document.getElementById('featuredSection').style.display = 'block';
      featuredContainer.innerHTML = featuredEvents.map(evt => {
        const icon = evt.icon || (evt.category === 'festas' ? '🎉' : evt.category === 'congressos' ? '🎤' : evt.category === 'shows' ? '🎵' : '🏃');
        const formattedPrice = Number.isInteger(evt.price) ? evt.price : evt.price.toFixed(0);
        return `
          <div class="featured-card" role="button" tabindex="0" onclick="App.openEventDetails(${evt.id})" onkeydown="if(event.key==='Enter'||event.key===' ') App.openEventDetails(${evt.id})">
            <img src="${evt.image}" alt="${evt.title}" loading="lazy">
            <div class="featured-overlay">
              <span class="featured-badge">${icon} ${evt.categoryName}</span>
              <h3 class="featured-title">${evt.title}</h3>
              <p class="featured-meta">${evt.date} · R$ ${formattedPrice}</p>
            </div>
          </div>
        `;
      }).join('');
    } else {
      document.getElementById('featuredSection').style.display = 'none';
    }

    // 2. TODOS OS EVENTOS
    if (filtered.length === 0) {
      allEventsContainer.innerHTML = `
        <div style="text-align: center; padding: 3rem var(--space-gutter); color: var(--pot-text-subtle);">
          <i class="bi bi-calendar-x" style="font-size: 3rem; color: #b2a288;"></i>
          <p style="margin: 12px 0 16px; font-weight: 800; font-size: 1.05rem;">Nenhum evento encontrado</p>
          <button class="btn-pot-outline" style="max-width: 200px; margin: 0 auto;" onclick="App.resetFilters()">
            Limpar Filtros
          </button>
        </div>
      `;
      return;
    }

    allEventsContainer.innerHTML = filtered.map(evt => {
      const icon = evt.icon || (evt.category === 'festas' ? '🎉' : evt.category === 'congressos' ? '🎤' : evt.category === 'shows' ? '🎵' : '🏃');
      return `
        <div class="event-item-card" role="button" tabindex="0" onclick="App.openEventDetails(${evt.id})" onkeydown="if(event.key==='Enter'||event.key===' ') App.openEventDetails(${evt.id})">
          <img class="event-item-thumb" src="${evt.image}" alt="${evt.title}" loading="lazy">
          <div class="event-item-info">
            <div>
              <div class="event-item-category">${icon} ${evt.categoryName}</div>
              <div class="event-item-title">${evt.title}</div>
              <div class="event-item-meta">
                <span><i class="bi bi-calendar-event me-1"></i>${evt.date}</span>
                <span><i class="bi bi-geo-alt me-1"></i>${evt.city}</span>
              </div>
            </div>
            <div class="event-item-price">R$ ${Number.isInteger(evt.price) ? evt.price : evt.price.toFixed(2).replace('.', ',')}</div>
          </div>
        </div>
      `;
    }).join('');
  },

  resetFilters() {
    this.state.searchQuery = '';
    this.state.selectedCategory = 'all';
    this.state.selectedCity = 'all';

    const searchInput = document.getElementById('catalogSearch');
    if (searchInput) searchInput.value = '';

    const clearBtn = document.getElementById('searchClearBtn');
    if (clearBtn) clearBtn.style.display = 'none';

    const citySelect = document.getElementById('citySelect');
    if (citySelect) citySelect.value = 'all';

    document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
    const defaultPill = document.querySelector('.category-pill[data-category="all"]');
    if (defaultPill) defaultPill.classList.add('active');

    this.renderCatalog();
  },

  // =========================================================================
  // DETALHES DO EVENTO & FIXAÇÃO DO BOTÃO COMPRAR
  // =========================================================================
  openEventDetails(eventId) {
    const event = this.state.events.find(e => e.id === eventId);
    if (!event) return;

    this.state.selectedEvent = event;
    this.state.selectedBatch = event.batches[0];
    this.state.ticketQty = 1;

    const detailsView = document.getElementById('view-event-details');
    detailsView.innerHTML = `
      <div class="event-details-view">
        <div style="position: relative; height: 260px; overflow: hidden;">
          <img src="${event.image}" alt="${event.title}" style="width: 100%; height: 100%; object-fit: cover;">
          <button class="btn-access-top" onclick="App.switchView('home')" style="position: absolute; top: 1rem; left: 1rem; background: rgba(0,0,0,0.5);">
            <i class="bi bi-arrow-left" style="font-size: 1.25rem;"></i>
          </button>
          <button class="btn-access-top" onclick="AccessibilityManager.toggleDrawer()" style="position: absolute; top: 1rem; right: 1rem; background: rgba(0,0,0,0.5);">
            <i class="bi bi-universal-access" style="font-size: 1.25rem;"></i>
          </button>
          <div style="position: absolute; bottom: 12px; left: 16px; background: var(--pot-orange); color: #fff; padding: 4px 14px; border-radius: 99px; font-weight: 800; font-size: 0.8rem;">
            ${(event.icon || '🎉')} ${event.categoryName.toUpperCase()}
          </div>
        </div>

        <div style="padding: 1.5rem var(--space-gutter);">
          <h1 style="font-size: 1.65rem; font-weight: 900; color: var(--pot-text-dark); line-height: 1.2; margin-bottom: 0.75rem;">
            ${event.title}
          </h1>

          <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 1.5rem; color: var(--pot-text-subtle); font-size: 0.92rem;">
            <div><i class="bi bi-calendar-check text-success me-2"></i><strong>Data:</strong> ${event.date} às ${event.time}</div>
            <div><i class="bi bi-geo-alt-fill text-success me-2"></i><strong>Local:</strong> ${event.venue} — ${event.city}/${event.state}</div>
          </div>

          <div style="margin-bottom: 1.75rem;">
            <h4 style="font-size: 1.05rem; font-weight: 800; margin-bottom: 8px;">Sobre o Evento</h4>
            <p style="font-size: 0.94rem; color: #435047; line-height: 1.6;">${event.description}</p>
          </div>

          <!-- Lotes -->
          <div style="margin-bottom: 1.75rem;">
            <h4 style="font-size: 1.05rem; font-weight: 800; margin-bottom: 10px;">Selecione o Ingresso</h4>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${event.batches.map(batch => `
                <div style="padding: 14px; border: 2px solid ${batch.id === this.state.selectedBatch.id ? 'var(--pot-orange)' : 'var(--pot-input-border)'}; background: ${batch.id === this.state.selectedBatch.id ? 'var(--pot-orange-light)' : '#ffffff'}; border-radius: 16px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;"
                     onclick="App.selectBatch(${batch.id})">
                  <div>
                    <div style="font-weight: 800; font-size: 1rem; color: var(--pot-text-dark);">${batch.name}</div>
                    <div style="font-size: 0.82rem; color: var(--pot-text-subtle);">Disponíveis: ${batch.qty} unidades</div>
                  </div>
                  <div style="font-weight: 900; font-size: 1.2rem; color: var(--pot-orange);">
                    R$ ${batch.price.toFixed(2).replace('.', ',')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Quantidade -->
          <div style="display: flex; align-items: center; justify-content: space-between; background: var(--pot-bg-pill); padding: 12px 16px; border-radius: 14px; margin-bottom: 1.5rem;">
            <span style="font-weight: 800; font-size: 0.98rem;">Quantidade</span>
            <div style="display: flex; align-items: center; gap: 14px;">
              <button class="btn btn-outline-secondary btn-sm" onclick="App.changeQty(-1)" style="width: 38px; height: 38px; border-radius: 50%; font-weight: bold;">-</button>
              <span id="ticketQtyDisplay" style="font-weight: 900; font-size: 1.25rem;">${this.state.ticketQty}</span>
              <button class="btn btn-sm" onclick="App.changeQty(1)" style="width: 38px; height: 38px; border-radius: 50%; font-weight: bold; background: var(--pot-green-btn); color: #fff;">+</button>
            </div>
          </div>
        </div>

        <!-- ===================================================================
             BARRA FIXA DE COMPRA - ACIMA DA BARRA INFERIOR SEM SOBREPOSIÇÃO
             =================================================================== -->
        <div class="sticky-buy-bar">
          <div>
            <div style="font-size: 0.72rem; color: var(--pot-text-subtle); text-transform: uppercase; font-weight: 800;">Total</div>
            <div id="stickyTotalAmount" style="font-size: 1.45rem; font-weight: 900; color: var(--pot-orange);">
              R$ ${(this.state.selectedBatch.price * this.state.ticketQty).toFixed(2).replace('.', ',')}
            </div>
          </div>
          <button class="btn-pot-green" style="width: auto; padding: 12px 28px;" onclick="App.proceedToCheckout()">
            <i class="bi bi-ticket-perforated-fill"></i> Comprar Agora
          </button>
        </div>
      </div>
    `;

    this.switchView('event-details');
  },

  selectBatch(batchId) {
    const b = this.state.selectedEvent.batches.find(x => x.id === batchId);
    if (b) {
      this.state.selectedBatch = b;
      this.openEventDetails(this.state.selectedEvent.id);
    }
  },

  changeQty(delta) {
    const newQty = this.state.ticketQty + delta;
    if (newQty >= 1 && newQty <= 10) {
      this.state.ticketQty = newQty;
      const total = this.state.selectedBatch.price * this.state.ticketQty;
      document.getElementById('ticketQtyDisplay').innerText = newQty;
      document.getElementById('stickyTotalAmount').innerText = 'R$ ' + total.toFixed(2).replace('.', ',');
    }
  },

  proceedToCheckout() {
    if (!this.state.user) {
      this.showToast('Faça login ou cadastre-se para comprar ingressos!', 'warning');
      this.switchView('login-step1');
      return;
    }

    const total = this.state.selectedBatch.price * this.state.ticketQty;
    const checkoutView = document.getElementById('view-checkout');

    checkoutView.innerHTML = `
      <div style="padding: 1.5rem var(--space-gutter) 100px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem;">
          <button class="btn-access-top" onclick="App.openEventDetails(${this.state.selectedEvent.id})" style="background: var(--pot-bg-pill); color: var(--pot-text-dark);">
            <i class="bi bi-arrow-left"></i>
          </button>
          <h2 style="font-size: 1.35rem; font-weight: 900; margin: 0;">Finalizar Compra</h2>
          <button class="btn-access-top" onclick="AccessibilityManager.toggleDrawer()" style="background: var(--pot-bg-pill); color: var(--pot-text-dark);">
            <i class="bi bi-universal-access"></i>
          </button>
        </div>

        <div style="background: #ffffff; border: 1.5px solid var(--pot-border-pill); border-radius: 18px; padding: 16px; margin-bottom: 1.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <h4 style="font-weight: 800; font-size: 1.05rem; margin-bottom: 4px;">${this.state.selectedEvent.title}</h4>
          <p style="font-size: 0.85rem; color: var(--pot-text-subtle); margin-bottom: 10px;">${this.state.selectedBatch.name} • ${this.state.ticketQty}x ingresso(s)</p>
          <div style="display: flex; justify-content: space-between; border-top: 1px dashed var(--pot-border-pill); padding-top: 10px; font-weight: 900; font-size: 1.3rem; color: var(--pot-orange);">
            <span>Valor Total</span>
            <span>R$ ${total.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>

        <h4 style="font-size: 1rem; font-weight: 800; margin-bottom: 12px;">Selecione a Forma de Pagamento</h4>

        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 1.5rem;">
          <label style="border: 2px solid var(--pot-green-btn); border-radius: 16px; padding: 14px; display: flex; align-items: center; gap: 12px; cursor: pointer; background: #eef7f2;">
            <input type="radio" name="paymentMethod" value="pix" checked onchange="App.togglePaymentFields('pix')">
            <div>
              <div style="font-weight: 800; color: var(--pot-green-btn);"><i class="bi bi-qr-code text-success me-2"></i>PIX Instantâneo</div>
              <div style="font-size: 0.8rem; color: var(--pot-text-subtle);">Aprovação na hora e emissão do ingresso com QR Code</div>
            </div>
          </label>

          <label style="border: 1.5px solid var(--pot-border-pill); border-radius: 16px; padding: 14px; display: flex; align-items: center; gap: 12px; cursor: pointer; background: #fff;">
            <input type="radio" name="paymentMethod" value="card" onchange="App.togglePaymentFields('card')">
            <div>
              <div style="font-weight: 800;"><i class="bi bi-credit-card me-2"></i>Cartão de Crédito</div>
              <div style="font-size: 0.8rem; color: var(--pot-text-subtle);">Parcele em até 12x no cartão</div>
            </div>
          </label>
        </div>

        <div id="cardFieldsArea" style="display: none; margin-bottom: 1.5rem; background: #fff; padding: 16px; border: 1.5px solid var(--pot-border-pill); border-radius: 16px;">
          <div class="form-group-custom">
            <label class="form-label-custom">Número do Cartão</label>
            <input type="text" class="form-control" placeholder="0000 0000 0000 0000" maxlength="19">
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="form-group-custom">
              <label class="form-label-custom">Validade</label>
              <input type="text" class="form-control" placeholder="MM/AA">
            </div>
            <div class="form-group-custom">
              <label class="form-label-custom">CVV</label>
              <input type="password" class="form-control" placeholder="123" maxlength="4">
            </div>
          </div>
        </div>

        <button class="btn-pot-green" onclick="App.generatePaymentOrder('${total}')">
          <i class="bi bi-shield-check"></i> Gerar Pagamento Seguro
        </button>
      </div>
    `;

    this.switchView('checkout');
  },

  togglePaymentFields(method) {
    const cardArea = document.getElementById('cardFieldsArea');
    if (cardArea) cardArea.style.display = method === 'card' ? 'block' : 'none';
  },

  generatePaymentOrder(totalAmount) {
    const orderCode = 'POT-' + Math.floor(100000 + Math.random() * 900000);
    const pixPayload = `00020101021226580014br.gov.bcb.pix0136${this.state.selectedEvent.pixKey}5204000053039865406${parseFloat(totalAmount).toFixed(2)}5802BR5915POTICKET BRASIL6005NATAL62190515${orderCode}6304ABCD`;

    const checkoutView = document.getElementById('view-checkout');
    checkoutView.innerHTML = `
      <div style="padding: 1.5rem var(--space-gutter) 100px; text-align: center;">
        <div style="width: 62px; height: 62px; border-radius: 50%; background: #eaf5f0; color: var(--pot-green-btn); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-size: 1.9rem;">
          <i class="bi bi-qr-code-scan"></i>
        </div>
        <h3 style="font-weight: 900; font-size: 1.45rem;">Pague com PIX</h3>
        <p style="color: var(--pot-text-subtle); font-size: 0.92rem;">Escaneie o QR Code abaixo ou copie a chave para pagar no app do seu banco.</p>

        <!-- QR Code -->
        <div style="margin: 1.5rem auto; display: inline-block; padding: 14px; background: #fff; border: 2px solid var(--pot-border-pill); border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.06);">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixPayload)}" alt="QR Code Pix" style="display: block; width: 190px; height: 190px;">
        </div>

        <div style="background: var(--pot-bg-pill); padding: 12px; border-radius: 12px; font-family: monospace; font-size: 0.76rem; word-break: break-all; margin-bottom: 1rem; border: 1px solid var(--pot-border-pill);">
          ${pixPayload}
        </div>

        <button class="btn-pot-outline mb-3" onclick="navigator.clipboard.writeText('${pixPayload}'); App.showToast('Código Pix copiado!');">
          <i class="bi bi-clipboard-check"></i> Copiar Código PIX
        </button>

        <button class="btn-pot-green" onclick="App.simulatePaymentApproval('${orderCode}', ${totalAmount})">
          <i class="bi bi-check2-circle"></i> Confirmar Pagamento Simulado
        </button>
      </div>
    `;
  },

  simulatePaymentApproval(orderCode, totalAmount) {
    this.showToast('Pagamento confirmado com sucesso!');

    const newTickets = [];
    for (let i = 0; i < this.state.ticketQty; i++) {
      const ticketId = 'TKT-' + Math.floor(10000000 + Math.random() * 90000000);
      newTickets.push({
        id: ticketId,
        orderCode: orderCode,
        eventTitle: this.state.selectedEvent.title,
        date: this.state.selectedEvent.date,
        venue: this.state.selectedEvent.venue,
        batchName: this.state.selectedBatch.name,
        holderName: this.state.user.name,
        holderCpf: this.state.user.cpf,
        qrHash: `VALID-${ticketId}-${orderCode}`
      });
    }

    this.state.myTickets.unshift(...newTickets);
    this.saveStorage();

    setTimeout(() => {
      this.switchView('my-tickets');
    }, 600);
  },

  renderMyTickets() {
    const list = document.getElementById('myTicketsList');
    if (!list) return;

    if (!this.state.user) {
      list.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem;">
          <i class="bi bi-person-lock" style="font-size: 3rem; color: #b2a288;"></i>
          <p style="margin: 12px 0 16px; color: var(--pot-text-subtle); font-weight: 700;">Faça login para ver seus ingressos adquiridos.</p>
          <button class="btn-pot-green" onclick="App.switchView('login-step1')">Fazer Login</button>
        </div>
      `;
      return;
    }

    if (this.state.myTickets.length === 0) {
      list.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem;">
          <i class="bi bi-ticket-perforated" style="font-size: 3.2rem; color: #b2a288;"></i>
          <h4 style="font-weight: 800; margin-top: 10px;">Você ainda não tem ingressos</h4>
          <p style="color: var(--pot-text-subtle); font-size: 0.9rem;">Escolha seu evento favorito e garanta seu lugar em segundos.</p>
          <button class="btn-pot-orange mt-3" onclick="App.switchView('home')">Explorar Eventos</button>
        </div>
      `;
      return;
    }

    list.innerHTML = this.state.myTickets.map(tkt => `
      <div style="background: #ffffff; border: 1.5px solid var(--pot-border-pill); border-radius: 18px; padding: 1.25rem; margin-bottom: 1.25rem; box-shadow: 0 4px 15px rgba(0,0,0,0.05); position: relative; overflow: hidden;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <div>
            <span style="background: #eaf5f0; color: var(--pot-green-btn); font-size: 0.74rem; font-weight: 800; padding: 4px 10px; border-radius: 99px;">INGRESSO VÁLIDO</span>
            <h4 style="font-weight: 800; font-size: 1.15rem; margin: 8px 0 2px;">${tkt.eventTitle}</h4>
            <div style="font-size: 0.85rem; color: var(--pot-text-subtle);">${tkt.batchName}</div>
          </div>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(tkt.qrHash)}" alt="QR Code Ingresso" style="width: 80px; height: 80px; border-radius: 10px; border: 1px solid var(--pot-border-pill);">
        </div>

        <div style="border-top: 1px dashed var(--pot-border-pill); padding-top: 10px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.82rem; color: var(--pot-text-subtle);">
          <div><strong>Titular:</strong> ${tkt.holderName}</div>
          <div><strong>CPF:</strong> ${tkt.holderCpf}</div>
          <div><strong>Data:</strong> ${tkt.date}</div>
          <div><strong>Código:</strong> ${tkt.id}</div>
        </div>
      </div>
    `).join('');
  },

  createEvent(formData) {
    if (!this.state.user) {
      this.state.user = {
        name: 'Produtor POTicket',
        cpf: '040.090.814-06',
        email: 'produtor@poticket.com.br',
        role: 'producer',
        city: formData.city || 'Natal',
        state: formData.state || 'RN'
      };
      this.saveStorage();
    }

    const newEvent = {
      id: Date.now(),
      title: formData.title,
      category: formData.category,
      categoryName: formData.categoryName,
      icon: formData.category === 'festas' ? '🎉' : formData.category === 'congressos' ? '🎤' : formData.category === 'shows' ? '🎵' : '🏃',
      city: formData.city,
      state: formData.state || 'RN',
      date: formData.date,
      time: formData.time || '20:00',
      venue: formData.venue,
      price: parseFloat(formData.price),
      image: formData.image || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
      featured: true,
      description: formData.description,
      pixKey: formData.pixKey || 'produtor@poticket.com.br',
      batches: [
        { id: Date.now() + 1, name: '1º Lote Geral', price: parseFloat(formData.price), qty: parseInt(formData.qty) || 100 }
      ]
    };

    this.state.events.unshift(newEvent);
    this.saveStorage();
    this.showToast('Evento publicado com sucesso no catálogo!');
    this.renderCatalog();
    this.switchView('home');
  },

  handleLoginCpfSubmit(cpf) {
    if (!this.validateCpf(cpf)) {
      this.showToast('Digite um CPF válido com 11 dígitos.', 'error');
      return;
    }

    this.state.loginCpf = this.formatCpf(cpf);
    document.getElementById('loginCpfPreview').innerText = `Entrando com ${this.state.loginCpf}`;
    this.switchView('login-step2');
  },

  handleLoginPasswordSubmit(password) {
    if (!password || password.length < 6) {
      this.showToast('Digite sua senha cadastrada (mínimo 6 dígitos).', 'error');
      return;
    }

    this.state.user = {
      name: 'Maria Oliveira',
      cpf: this.state.loginCpf,
      email: 'usuario@poticket.com.br',
      role: 'producer',
      cep: '59000-000',
      street: 'Av. Engenheiro Roberto Freire',
      number: '1000',
      neighborhood: 'Ponta Negra',
      city: 'Natal',
      state: 'RN'
    };

    this.saveStorage();
    this.showToast(`Bem-vindo(a) de volta, ${this.state.user.name}!`);
    this.switchView('home');
  },

  loginWithGoogle() {
    this.showToast('Conectando com conta Google...');
    setTimeout(() => {
      this.state.user = {
        name: 'Usuário Google',
        cpf: '040.090.814-06',
        email: 'usuario.google@gmail.com',
        role: 'customer',
        cep: '01310-100',
        street: 'Avenida Paulista',
        number: '1578',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP'
      };
      this.saveStorage();
      this.showToast('Login com Google concluído com sucesso!');
      this.switchView('home');
    }, 700);
  },

  loginWithBiometrics() {
    this.showToast('Autenticando via biometria (Touch ID / Face ID)...');
    setTimeout(() => {
      this.state.user = {
        name: 'Maria Oliveira (Biometria)',
        cpf: '040.090.814-06',
        email: 'maria.oliveira@poticket.com.br',
        role: 'producer',
        cep: '49000-000',
        street: 'Avenida Beira Mar',
        number: '500',
        neighborhood: 'Treze de Julho',
        city: 'Aracaju',
        state: 'SE'
      };
      this.saveStorage();
      this.showToast('Biometria reconhecida com sucesso!');
      this.switchView('home');
    }, 600);
  },

  sendPasswordResetLink(email) {
    if (!email || !email.includes('@')) {
      this.showToast('Informe um e-mail válido.', 'error');
      return;
    }
    this.showToast(`Link de recuperação enviado para ${email}!`);
    setTimeout(() => this.switchView('login-step1'), 1200);
  },

  logout() {
    this.state.user = null;
    this.saveStorage();
    this.showToast('Você saiu da sua conta.');
    this.switchView('login-step1');
  },

  renderProfile() {
    const profileView = document.getElementById('view-profile');
    if (!this.state.user) {
      profileView.innerHTML = `
        <div style="padding: 3.5rem var(--space-gutter); text-align: center;">
          <i class="bi bi-person-circle" style="font-size: 3.5rem; color: #b2a288;"></i>
          <h3 style="font-weight: 900; margin-top: 14px;">Você não está conectado</h3>
          <p style="color: var(--pot-text-subtle); font-size: 0.92rem;">Entre na sua conta para gerenciar ingressos, publicar eventos e cadastrar dados.</p>
          <button class="btn-pot-green mt-3" onclick="App.switchView('login-step1')">Entrar ou Cadastrar</button>
        </div>
      `;
      return;
    }

    profileView.innerHTML = `
      <div style="padding: 1.5rem var(--space-gutter) 100px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
          <h2 style="font-size: 1.45rem; font-weight: 900; margin: 0;">Minha Conta</h2>
          <button class="btn-access-top" onclick="AccessibilityManager.toggleDrawer()" style="background: var(--pot-bg-pill); color: var(--pot-text-dark);">
            <i class="bi bi-universal-access"></i>
          </button>
        </div>

        <div style="background: #ffffff; border: 1.5px solid var(--pot-border-pill); border-radius: 18px; padding: 1.25rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 14px; box-shadow: 0 4px 15px rgba(0,0,0,0.04);">
          <div style="width: 58px; height: 58px; border-radius: 50%; background: var(--pot-orange); color: #fff; font-weight: 900; font-size: 1.4rem; display: flex; align-items: center; justify-content: center;">
            ${this.state.user.name.charAt(0)}
          </div>
          <div style="flex: 1;">
            <h4 style="font-size: 1.15rem; font-weight: 800; margin: 0;">${this.state.user.name}</h4>
            <div style="font-size: 0.85rem; color: var(--pot-text-subtle);">${this.state.user.email}</div>
            <div style="font-size: 0.82rem; color: var(--pot-green-btn); font-weight: 800; margin-top: 2px;">CPF: ${this.state.user.cpf}</div>
          </div>
        </div>

        <div style="background: #ffffff; border: 1.5px solid var(--pot-border-pill); border-radius: 16px; padding: 14px; margin-bottom: 1.5rem;">
          <div style="font-weight: 800; font-size: 0.92rem; margin-bottom: 6px;"><i class="bi bi-geo-alt-fill text-success me-2"></i>Endereço Cadastrado</div>
          <div style="font-size: 0.86rem; color: var(--pot-text-dark); line-height: 1.5;">
            ${this.state.user.street || 'Rua Principal'}, nº ${this.state.user.number || 'S/N'}<br>
            ${this.state.user.neighborhood || 'Centro'} — ${this.state.user.city || 'Natal'}/${this.state.user.state || 'RN'}<br>
            CEP: ${this.state.user.cep || '00000-000'}
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 2rem;">
          <button class="btn-pot-outline" style="justify-content: flex-start; text-align: left;" onclick="App.switchView('create-event')">
            <i class="bi bi-calendar-plus text-success me-2"></i> Criar e Publicar Evento
          </button>
          <button class="btn-pot-outline" style="justify-content: flex-start; text-align: left;" onclick="App.switchView('my-tickets')">
            <i class="bi bi-ticket-detailed text-success me-2"></i> Meus Ingressos
          </button>
          <button class="btn-pot-outline" style="justify-content: flex-start; text-align: left;" onclick="AccessibilityManager.toggleDrawer(true)">
            <i class="bi bi-universal-access text-success me-2"></i> Menu de Acessibilidade
          </button>
        </div>

        <button class="btn btn-outline-danger w-100" style="padding: 12px; border-radius: 14px; font-weight: 800;" onclick="App.logout()">
          <i class="bi bi-box-arrow-right me-2"></i> Sair da Conta
        </button>
      </div>
    `;
  },

  showToast(message, type = 'success') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 1090; width: 90%; max-width: 400px; display: flex; flex-direction: column; gap: 8px;';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const bg = type === 'error' ? '#dc2626' : type === 'warning' ? '#d97706' : '#225a43';
    toast.style.cssText = `background: ${bg}; color: #fff; padding: 12px 18px; border-radius: 14px; font-weight: 700; font-size: 0.92rem; box-shadow: 0 10px 25px rgba(0,0,0,0.2); animation: fadeIn 0.25s ease; display: flex; align-items: center; justify-content: space-between;`;
    toast.innerHTML = `<span>${message}</span><i class="bi bi-x" style="cursor: pointer; font-size: 1.3rem;" onclick="this.parentElement.remove()"></i>`;

    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  },

  bindEvents() {
    const searchInput = document.getElementById('catalogSearch');
    const clearBtn = document.getElementById('searchClearBtn');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.state.searchQuery = e.target.value;
        if (clearBtn) clearBtn.style.display = e.target.value.length > 0 ? 'block' : 'none';
        this.renderCatalog();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
        this.state.searchQuery = '';
        clearBtn.style.display = 'none';
        this.renderCatalog();
      });
    }

    const citySelect = document.getElementById('citySelect');
    if (citySelect) {
      citySelect.addEventListener('change', (e) => {
        this.state.selectedCity = e.target.value;
        this.renderCatalog();
      });
    }
  }
};

window.App = App;
document.addEventListener('DOMContentLoaded', () => App.init());
