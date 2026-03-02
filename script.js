/* ============================================
   BILET — Super-App JavaScript Core
   ============================================ */

'use strict';

// ============ STATE ============
const state = {
  currentPage: 'splash',
  cart: JSON.parse(localStorage.getItem('bilet_cart') || '[]'),
  tickets: JSON.parse(localStorage.getItem('bilet_tickets') || '[]'),
  favorites: JSON.parse(localStorage.getItem('bilet_favs') || '[]'),
  selectedSeats: [],
  seatPrice: 45000,
  obSlide: 0,
  bannerSlide: 0,
  reelCounters: { 1: 47, 2: 23, 3: 12 },
};

// ============ NAVIGATION ============
function navigate(pageId) {
  const current = document.getElementById(`page-${state.currentPage}`);
  const next = document.getElementById(`page-${pageId}`);
  if (!next) return;

  // Pages that shouldn't show nav
  const noNavPages = ['splash', 'onboarding', 'login', 'register', 'booking-success'];
  const bottomNav = document.getElementById('bottomNav');

  if (current) {
    current.classList.remove('active');
    current.classList.add('exit-left');
    setTimeout(() => current.classList.remove('exit-left'), 400);
  }

  next.classList.add('active');
  state.currentPage = pageId;

  // Bottom nav visibility
  if (noNavPages.includes(pageId)) {
    bottomNav.style.display = 'none';
  } else {
    bottomNav.style.display = 'flex';
  }

  // Update active nav item
  document.querySelectorAll('.bn-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === pageId);
  });

  // Page-specific init
  if (pageId === 'event-details') initSeatMap();
  if (pageId === 'seat-selection') initSeatMapBig();
  if (pageId === 'cart') renderCart();
  if (pageId === 'my-tickets') renderTickets();
  if (pageId === 'booking-success') initSuccess();
  if (pageId === 'payment') updatePayTotal();
  if (pageId === 'reels') startReelCounters();

  // Scroll to top
  if (next.querySelector('.page-scroll')) {
    next.querySelector('.page-scroll').scrollTop = 0;
  }
}

// ============ SPLASH ============
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('page-splash').classList.add('active');
  document.getElementById('bottomNav').style.display = 'none';
  setTimeout(() => navigate('onboarding'), 2400);

  initBannerSlider();
  updateCartBadge();
});

// ============ ONBOARDING ============
let obSlide = 0;
function onboardNext() {
  const container = document.getElementById('slidesContainer');
  const dots = document.querySelectorAll('.dot');
  const btn = document.getElementById('obNextBtn');

  obSlide++;
  if (obSlide >= 3) {
    navigate('login');
    return;
  }

  container.style.transform = `translateX(-${obSlide * 100}%)`;
  container.style.transition = 'transform 0.4s cubic-bezier(0.4,0,0.2,1)';

  dots.forEach((d, i) => d.classList.toggle('active', i === obSlide));
  if (obSlide === 2) btn.textContent = 'Get Started';
}

// ============ LOGIN ============
function loginAction() {
  const btn = document.querySelector('#page-login .btn-primary');
  btn.textContent = 'Signing in...';
  btn.style.opacity = '0.7';
  btn.disabled = true;

  setTimeout(() => {
    btn.textContent = 'Sign In';
    btn.style.opacity = '';
    btn.disabled = false;
    navigate('home');
    showToast('Welcome back, Ahmed! 👋');
  }, 1200);
}

// ============ BANNER SLIDER ============
function initBannerSlider() {
  const slider = document.getElementById('bannerSlider');
  if (!slider) return;
  let slide = 0;
  const total = slider.children.length;

  setInterval(() => {
    slide = (slide + 1) % total;
    slider.style.transform = `translateX(-${slide * 100}%)`;
    slider.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1)';

    document.querySelectorAll('.bdot').forEach((d, i) => d.classList.toggle('active', i === slide));
  }, 3500);
}

// ============ SEAT MAP ============
const ROWS = ['A', 'B', 'C', 'D', 'E'];
const COLS = 8;
const TAKEN = ['A1','A4','B7','C2','C5','D3','D6','E1','E8'];

function buildSeatGrid(containerId, big) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  state.selectedSeats = [];

  ROWS.forEach(row => {
    const rowEl = document.createElement('div');
    rowEl.className = 'seat-row';

    const lbl = document.createElement('div');
    lbl.className = 'seat-row-label';
    lbl.textContent = row;
    rowEl.appendChild(lbl);

    for (let c = 1; c <= COLS; c++) {
      const id = `${row}${c}`;
      const seat = document.createElement('div');
      seat.className = 'seat' + (TAKEN.includes(id) ? ' taken' : '');
      seat.dataset.id = id;
      if (!TAKEN.includes(id)) {
        seat.addEventListener('click', () => toggleSeat(seat, id));
      }
      rowEl.appendChild(seat);

      // gap in middle
      if (c === 4) {
        const gap = document.createElement('div');
        gap.style.width = big ? '12px' : '8px';
        rowEl.appendChild(gap);
      }
    }
    container.appendChild(rowEl);
  });
}

function toggleSeat(el, id) {
  const idx = state.selectedSeats.indexOf(id);
  if (idx === -1) {
    state.selectedSeats.push(id);
    el.classList.add('selected');
  } else {
    state.selectedSeats.splice(idx, 1);
    el.classList.remove('selected');
  }
  updateSeatUI();
}

function updateSeatUI() {
  const count = state.selectedSeats.length;
  const total = count * state.seatPrice;

  // event details
  if (document.getElementById('totalPrice')) {
    document.getElementById('totalPrice').textContent = `IQD ${total.toLocaleString()}`;
    document.getElementById('seatsSelected').textContent = `${count} seat${count !== 1 ? 's' : ''}`;
  }

  // seat selection page
  if (document.getElementById('ss-seats')) {
    document.getElementById('ss-seats').textContent = `${count} seat${count !== 1 ? 's' : ''}`;
    document.getElementById('ss-price').textContent = `IQD ${total.toLocaleString()}`;
  }
}

function initSeatMap() { buildSeatGrid('seatMap', false); }
function initSeatMapBig() { buildSeatGrid('seatMapBig', true); }

// ============ ABOUT TOGGLE ============
function toggleAbout() {
  const content = document.getElementById('aboutContent');
  const arrow = document.getElementById('aboutArrow');
  content.classList.toggle('open');
  arrow.textContent = content.classList.contains('open') ? '▲' : '▼';
}

// ============ CART ============
function addToCart(e) {
  if (e) { e.stopPropagation(); e.preventDefault(); }

  const events = [
    { id: 'kadim', name: 'Kadim Al Sahir Live', meta: 'Sep 28 · Basra Intl.', price: 45000, emoji: '🎵', bg: 'linear-gradient(135deg,#6C5CE7,#a29bfe)' },
    { id: 'zawraa', name: 'Al-Zawraa vs Erbil FC', meta: 'Oct 2 · Al-Shaab', price: 15000, emoji: '⚽', bg: 'linear-gradient(135deg,#e17055,#fd79a8)' },
    { id: 'dune', name: 'Dune: Part Three', meta: 'Oct 10 · Grand Mall', price: 8000, emoji: '🎬', bg: 'linear-gradient(135deg,#00b894,#00D1B2)' },
  ];

  const item = events[Math.floor(Math.random() * events.length)];
  if (!state.cart.find(c => c.id === item.id)) {
    state.cart.push(item);
    saveCart();
    showToast(`${item.emoji} Added to cart!`);
    updateCartBadge();
  } else {
    showToast('Already in cart!');
  }
}

function renderCart() {
  const container = document.getElementById('cartItems');
  if (!container) return;

  if (state.cart.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:60px 20px;color:var(--text2)"><div style="font-size:48px;margin-bottom:16px">🛒</div><div>Your cart is empty</div></div>`;
    document.getElementById('cartSummary').style.display = 'none';
    return;
  }

  document.getElementById('cartSummary').style.display = 'block';
  container.innerHTML = state.cart.map(item => `
    <div class="cart-item">
      <div class="ci-thumb" style="background:${item.bg}">${item.emoji}</div>
      <div class="ci-info">
        <div class="ci-name">${item.name}</div>
        <div class="ci-meta">${item.meta}</div>
        <div class="ci-price">IQD ${item.price.toLocaleString()}</div>
      </div>
      <button class="ci-remove" onclick="removeFromCart('${item.id}')">✕</button>
    </div>
  `).join('');

  const subtotal = state.cart.reduce((a, b) => a + b.price, 0);
  const fee = Math.round(subtotal * 0.05);
  document.getElementById('csSubtotal').textContent = `IQD ${subtotal.toLocaleString()}`;
  document.getElementById('csFee').textContent = `IQD ${fee.toLocaleString()}`;
  document.getElementById('csTotal').textContent = `IQD ${(subtotal + fee).toLocaleString()}`;
}

function removeFromCart(id) {
  state.cart = state.cart.filter(c => c.id !== id);
  saveCart();
  renderCart();
  updateCartBadge();
  showToast('Removed from cart');
}

function clearCart() {
  state.cart = [];
  saveCart();
  renderCart();
  updateCartBadge();
  showToast('Cart cleared');
}

function saveCart() {
  localStorage.setItem('bilet_cart', JSON.stringify(state.cart));
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  const count = state.cart.length;
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}

// ============ PAYMENT ============
function selectPayMethod(el, method) {
  document.querySelectorAll('.pay-method').forEach(m => m.classList.remove('active'));
  el.classList.add('active');

  document.getElementById('cardForm').style.display = method === 'card' ? 'flex' : 'none';
  document.getElementById('zaincashForm').style.display = method !== 'card' ? 'flex' : 'none';
}

function updatePayTotal() {
  const subtotal = state.cart.reduce((a, b) => a + b.price, 0) || 45000;
  const fee = Math.round(subtotal * 0.05);
  const el = document.getElementById('payTotal');
  if (el) el.textContent = `IQD ${(subtotal + fee).toLocaleString()}`;
}

function processPayment() {
  const loader = document.getElementById('payLoader');
  loader.style.display = 'flex';

  // Fake payment steps
  const texts = ['Connecting to ZainCash...', 'Verifying payment...', 'Confirming booking...'];
  let step = 0;
  const textEl = loader.querySelector('.pay-loader-text');

  const interval = setInterval(() => {
    if (step < texts.length) {
      textEl.textContent = texts[step++];
    }
  }, 700);

  setTimeout(() => {
    clearInterval(interval);
    loader.style.display = 'none';
    navigate('booking-success');
  }, 2400);
}

// ============ BOOKING SUCCESS ============
function initSuccess() {
  const id = '#BL-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
  document.getElementById('bookingId').textContent = id;
}

function saveTicketAndGo() {
  const item = state.cart[0] || {
    id: 'kadim',
    name: 'Kadim Al Sahir Live',
    meta: 'Sep 28, 2025 · 8:00 PM',
    price: 45000,
    emoji: '🎵',
    bg: 'linear-gradient(135deg,#6C5CE7,#a29bfe)',
  };

  const ticket = {
    ...item,
    bookingId: document.getElementById('bookingId').textContent,
    date: new Date().toLocaleDateString(),
  };

  state.tickets.push(ticket);
  localStorage.setItem('bilet_tickets', JSON.stringify(state.tickets));

  state.cart = [];
  saveCart();
  updateCartBadge();

  showToast('🎫 Ticket saved!');
  navigate('my-tickets');
}

// ============ MY TICKETS ============
function renderTickets() {
  const container = document.getElementById('myTicketsList');
  if (!container) return;

  if (state.tickets.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:60px 20px;color:var(--text2)"><div style="font-size:48px;margin-bottom:16px">🎫</div><div>No tickets yet. Book something amazing!</div><br/><button class="btn-primary" onclick="navigate('home')">Explore Events</button></div>`;
    return;
  }

  container.innerHTML = state.tickets.map(t => `
    <div class="ticket-item">
      <div class="ti-left" style="background:${t.bg || 'var(--card2)'}">
        <span style="font-size:32px">${t.emoji || '🎫'}</span>
      </div>
      <div class="ti-body">
        <div class="ti-name">${t.name}</div>
        <div class="ti-meta">${t.meta}</div>
        <div class="ti-badge">✓ Confirmed</div>
      </div>
    </div>
  `).join('');
}

// ============ FAVORITES ============
function toggleFav(e) {
  e.stopPropagation();
  const btn = e.currentTarget;
  const isActive = btn.classList.contains('active');

  if (isActive) {
    btn.classList.remove('active');
    btn.textContent = '♡';
    showToast('Removed from favorites');
  } else {
    btn.classList.add('active');
    btn.textContent = '♥';
    btn.style.color = '#ff6b6b';
    showToast('❤️ Added to favorites!');
    // Animate
    btn.style.transform = 'scale(1.3)';
    setTimeout(() => btn.style.transform = '', 200);
  }
}

// ============ REELS ============
function likeReel(el) {
  const countEl = el.querySelector('.ra-count');
  const current = parseFloat(countEl.textContent.replace('K', '')) * 1000;
  const newCount = current + 1;
  countEl.textContent = newCount >= 1000 ? (newCount / 1000).toFixed(1) + 'K' : newCount;

  // Animate
  el.style.transform = 'scale(1.3)';
  setTimeout(() => el.style.transform = '', 200);
  showToast('❤️ Liked!');
}

function shareReel() {
  showToast('🔗 Link copied!');
}

function startReelCounters() {
  const counters = [
    { el: document.querySelector('#reel1counter span'), key: 1 },
    { el: document.querySelector('#reel2counter span'), key: 2 },
    { el: document.querySelector('#reel3counter span'), key: 3 },
  ];

  counters.forEach(({ el, key }) => {
    if (!el) return;
    setInterval(() => {
      if (state.reelCounters[key] > 1) {
        if (Math.random() < 0.3) {
          state.reelCounters[key]--;
          el.textContent = state.reelCounters[key];
          el.style.color = state.reelCounters[key] < 10 ? '#ff4757' : '#ff6b6b';
          el.parentElement.style.transform = 'scale(1.05)';
          setTimeout(() => el.parentElement.style.transform = '', 200);
        }
      }
    }, 2000 + Math.random() * 2000);
  });
}

// ============ TOAST ============
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ============ RIPPLE EFFECT ============
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-primary, .btn-accent');
  if (!btn) return;

  const ripple = document.createElement('span');
  ripple.style.cssText = `
    position:absolute;
    border-radius:50%;
    background:rgba(255,255,255,0.3);
    pointer-events:none;
    transform:scale(0);
    animation:rippleAnim 0.5s ease forwards;
    width:80px;height:80px;
    left:${e.offsetX - 40}px;
    top:${e.offsetY - 40}px;
  `;
  btn.style.position = 'relative';
  btn.style.overflow = 'hidden';
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 500);
});

// Add ripple animation
const style = document.createElement('style');
style.textContent = `@keyframes rippleAnim { to { transform: scale(3); opacity: 0; } }`;
document.head.appendChild(style);

// ============ SCALE ON TAP ============
document.addEventListener('touchstart', (e) => {
  const target = e.target.closest('.event-card, .cat-chip, .result-card, .nearby-card, .cat-big-card');
  if (target) {
    target.style.transition = 'transform 0.1s';
    target.style.transform = 'scale(0.97)';
  }
}, { passive: true });

document.addEventListener('touchend', (e) => {
  const target = e.target.closest('.event-card, .cat-chip, .result-card, .nearby-card, .cat-big-card');
  if (target) {
    target.style.transform = '';
  }
}, { passive: true });

// ============ INITIAL CART ITEMS ============
// Pre-populate with one item for demo
if (state.cart.length === 0) {
  state.cart.push({
    id: 'kadim',
    name: 'Kadim Al Sahir Live',
    meta: 'Sep 28 · Basra Intl.',
    price: 45000,
    emoji: '🎵',
    bg: 'linear-gradient(135deg,#6C5CE7,#a29bfe)',
  });
  saveCart();
}