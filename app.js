/**
 * AstraGov AI - Main Application Controller
 * Handles Audio Synthesis, View Routing, AI Chatbot Drawer,
 * Custom Test Generation, and Interactive UI Events.
 */

// 1. Synthetic Web Audio Engine (No external sound files required)
class SoundFXController {
  constructor() {
    this.audioCtx = null;
    this.enabled = true;
  }

  ensureContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    const btn = document.getElementById('btn-sound-toggle');
    if (btn) {
      btn.innerHTML = this.enabled ? '🔊' : '🔇';
      btn.title = this.enabled ? 'Sound Effects Enabled' : 'Sound Effects Muted';
    }
    window.showToast?.(this.enabled ? "Audio FX unmuted" : "Audio FX muted", "info");
  }

  playClick() {
    if (!this.enabled) return;
    try {
      this.ensureContext();
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, this.audioCtx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.04);
    } catch(e) {}
  }

  playOptionSelect() {
    if (!this.enabled) return;
    try {
      this.ensureContext();
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.06);
    } catch(e) {}
  }

  playNotification() {
    if (!this.enabled) return;
    try {
      this.ensureContext();
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.12);
    } catch(e) {}
  }

  playWarning() {
    if (!this.enabled) return;
    try {
      this.ensureContext();
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, this.audioCtx.currentTime);
      osc.frequency.setValueAtTime(260, this.audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.18);
    } catch(e) {}
  }

  playSuccess() {
    if (!this.enabled) return;
    try {
      this.ensureContext();
      const now = this.audioCtx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.1, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.25);
      });
    } catch(e) {}
  }

  playTestStart() {
    this.playNotification();
  }

  playTestSubmit() {
    this.playSuccess();
  }
}

window.soundFX = new SoundFXController();

// 2. Global Toast Notification System
window.showToast = function(message, type = "info") {
  const container = document.getElementById('toast-notification-container');
  if (!container) return;

  const toast = document.createElement('div');
  const typeStyles = {
    info: 'border-cyan-500/50 bg-slate-900/90 text-cyan-200',
    success: 'border-emerald-500/50 bg-emerald-950/90 text-emerald-200',
    warning: 'border-amber-500/50 bg-amber-950/90 text-amber-200',
    error: 'border-rose-500/50 bg-rose-950/90 text-rose-200'
  };

  toast.className = `flex items-center gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md text-xs md:text-sm animate-fadeIn ${typeStyles[type] || typeStyles.info}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '⚡'}</span>
    <span class="flex-grow font-medium">${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};

// 3. Application Lifecycle & UI Routing
document.addEventListener('DOMContentLoaded', () => {
  // Initialize 3D Three.js canvas
  if (window.initAstraThree) {
    window.initAstraThree('hero-3d-canvas');
  }

  // Initialize Exam Engine DOM references
  if (window.examEngine) {
    window.examEngine.initDOM();
  }

  setupNavigation();
  setup3DControls();
  setupExamCards();
  setupAiCustomGenerator();
  setupAiChatDrawer();
  setupModals();
  setupResultsAndReviewButtons();

  // Handle 3D node click event from three-scene.js
  window.on3DNodeClick = function(nodeData) {
    window.soundFX?.playNotification();
    window.showToast(`🎯 Targeted Subject Node: ${nodeData.name}. Scroll to explore related tests!`, "info");
    
    // Switch to mock tests section
    const targetSec = document.getElementById('mock-tests-section');
    if (targetSec) {
      targetSec.scrollIntoView({ behavior: 'smooth' });
    }
  };
});

function setupNavigation() {
  const navLinks = document.querySelectorAll('[data-nav-target]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      window.soundFX?.playClick();
      const targetId = link.getAttribute('data-nav-target');
      
      // If currently inside an active test, confirm navigation
      if (window.examEngine?.isTestActive) {
        if (!confirm("A mock test is actively in progress. Navigating away will pause your session. Do you wish to leave?")) {
          return;
        }
      }

      // Hide test/results/review views and show dashboard
      document.getElementById('portal-dashboard-view')?.classList.remove('hidden');
      document.getElementById('test-interface-view')?.classList.add('hidden');
      document.getElementById('test-results-view')?.classList.add('hidden');
      document.getElementById('test-review-view')?.classList.add('hidden');

      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }

      // Update active nav styling
      navLinks.forEach(l => l.classList.remove('text-cyan-400', 'font-bold'));
      link.classList.add('text-cyan-400', 'font-bold');
    });
  });

  // Sound toggle button
  const btnSound = document.getElementById('btn-sound-toggle');
  if (btnSound) {
    btnSound.addEventListener('click', () => {
      window.soundFX?.toggle();
    });
  }
}

function setup3DControls() {
  const btnModeQuantum = document.getElementById('btn-3d-quantum');
  const btnModeMatrix = document.getElementById('btn-3d-matrix');
  const btnModeHolo = document.getElementById('btn-3d-holo');

  const modes = [
    { btn: btnModeQuantum, mode: 'quantum' },
    { btn: btnModeMatrix, mode: 'matrix' },
    { btn: btnModeHolo, mode: 'holo' }
  ];

  modes.forEach(m => {
    if (m.btn) {
      m.btn.addEventListener('click', () => {
        window.soundFX?.playClick();
        window.astraThree?.setVisualMode(m.mode);
        modes.forEach(x => x.btn?.classList.remove('bg-cyan-500', 'text-slate-950'));
        m.btn.classList.add('bg-cyan-500', 'text-slate-950');
      });
    }
  });
}

function setupExamCards() {
  // Category tabs filter
  const filterBtns = document.querySelectorAll('.exam-category-pill');
  const examCards = document.querySelectorAll('.exam-card-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      window.soundFX?.playClick();
      const cat = btn.getAttribute('data-category');

      filterBtns.forEach(b => {
        b.classList.remove('bg-cyan-500', 'text-slate-950');
        b.classList.add('bg-slate-800', 'text-slate-300');
      });
      btn.classList.add('bg-cyan-500', 'text-slate-950');
      btn.classList.remove('bg-slate-800', 'text-slate-300');

      examCards.forEach(card => {
        const cardCat = card.getAttribute('data-card-category');
        if (cat === 'all' || cardCat === cat) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // "Start Test" buttons on cards
  const startBtns = document.querySelectorAll('.btn-launch-mock');
  startBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const examKey = btn.getAttribute('data-exam-key');
      if (examKey && window.examEngine) {
        window.examEngine.startTest(examKey);
      }
    });
  });
}

function setupAiCustomGenerator() {
  const form = document.getElementById('ai-test-builder-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    window.soundFX?.playNotification();

    const topic = document.getElementById('ai-gen-topic')?.value || "General Studies";
    const examType = document.getElementById('ai-gen-exam-type')?.value || "UPSC CSE";
    const difficulty = document.getElementById('ai-gen-difficulty')?.value || "Medium";
    const count = parseInt(document.getElementById('ai-gen-count')?.value || "5", 10);

    const btnSubmit = form.querySelector('button[type="submit"]');
    const origText = btnSubmit.innerHTML;
    btnSubmit.innerHTML = `<span>⚡ Synthesizing AI Bank...</span>`;
    btnSubmit.disabled = true;

    setTimeout(() => {
      const customExam = window.astraAi?.generateCustomAiTest(topic, examType, difficulty, count);
      btnSubmit.innerHTML = origText;
      btnSubmit.disabled = false;

      if (customExam && window.examEngine) {
        window.showToast(`Custom AI Mock for "${topic}" successfully generated! Starting now.`, "success");
        window.examEngine.startTest(customExam.id, customExam);
      }
    }, 800);
  });
}

function setupAiChatDrawer() {
  const drawer = document.getElementById('ai-chat-drawer');
  const btnOpen = document.getElementById('btn-open-ai-chat');
  const btnClose = document.getElementById('btn-close-ai-chat');
  const chatInput = document.getElementById('ai-chat-user-input');
  const chatSendBtn = document.getElementById('btn-send-ai-chat');
  const chatMessages = document.getElementById('ai-chat-messages-container');
  const quickChips = document.querySelectorAll('.ai-quick-query-chip');

  if (btnOpen) {
    btnOpen.addEventListener('click', () => {
      window.soundFX?.playClick();
      drawer?.classList.remove('closed');
    });
  }

  if (btnClose) {
    btnClose.addEventListener('click', () => {
      window.soundFX?.playClick();
      drawer?.classList.add('closed');
    });
  }

  const handleSend = () => {
    const text = chatInput?.value?.trim();
    if (!text) return;

    window.soundFX?.playClick();

    // Append user message
    appendChatMessage('user', text);
    if (chatInput) chatInput.value = '';

    // Show AI typing indicator
    const typingId = `typing_${Date.now()}`;
    const typingBubble = document.createElement('div');
    typingBubble.id = typingId;
    typingBubble.className = "flex items-start gap-3 p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-purple-300 text-xs animate-pulse";
    typingBubble.innerHTML = `<span>🤖</span><span>Astra AI is analyzing exam syllabus and formulations...</span>`;
    chatMessages?.appendChild(typingBubble);
    chatMessages?.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });

    setTimeout(() => {
      typingBubble.remove();
      const reply = window.astraAi?.askDoubt(text);
      appendChatMessage('ai', reply.content, reply.title);
      window.soundFX?.playNotification();
    }, 700);
  };

  if (chatSendBtn) chatSendBtn.addEventListener('click', handleSend);
  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSend();
    });
  }

  quickChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.getAttribute('data-query');
      if (chatInput && q) {
        chatInput.value = q;
        handleSend();
      }
    });
  });

  function appendChatMessage(sender, content, title = null) {
    if (!chatMessages) return;
    const msg = document.createElement('div');

    if (sender === 'user') {
      msg.className = "flex justify-end";
      msg.innerHTML = `
        <div class="max-w-[85%] p-3.5 rounded-2xl rounded-tr-none bg-cyan-600 text-white text-xs md:text-sm shadow-md">
          ${content}
        </div>
      `;
    } else {
      msg.className = "flex items-start gap-2.5";
      msg.innerHTML = `
        <div class="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
          AI
        </div>
        <div class="max-w-[88%] p-4 rounded-2xl rounded-tl-none bg-slate-900 border border-slate-700/80 text-slate-200 text-xs md:text-sm leading-relaxed shadow-lg">
          ${title ? `<div class="font-bold text-cyan-400 mb-1 text-xs uppercase tracking-wider">${title}</div>` : ''}
          <div>${content}</div>
        </div>
      `;
    }

    chatMessages.appendChild(msg);
    chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
  }
}

function setupModals() {
  const modal = document.getElementById('exam-submit-modal');
  const btnCancel = document.getElementById('btn-modal-cancel-submit');
  const btnConfirm = document.getElementById('btn-modal-confirm-submit');

  if (btnCancel && modal) {
    btnCancel.addEventListener('click', () => {
      window.soundFX?.playClick();
      modal.classList.add('hidden');
    });
  }

  if (btnConfirm && modal) {
    btnConfirm.addEventListener('click', () => {
      window.soundFX?.playTestSubmit();
      modal.classList.add('hidden');
      window.examEngine?.finishTest();
    });
  }
}

function setupResultsAndReviewButtons() {
  const btnReview = document.getElementById('btn-go-to-review');
  const btnRetake = document.getElementById('btn-retake-exam');
  const btnHomeFromResults = document.getElementById('btn-home-from-results');
  const btnHomeFromReview = document.getElementById('btn-home-from-review');

  if (btnReview) {
    btnReview.addEventListener('click', () => {
      window.soundFX?.playClick();
      window.examEngine?.openReviewMode('all');
    });
  }

  if (btnRetake) {
    btnRetake.addEventListener('click', () => {
      window.soundFX?.playClick();
      if (window.examEngine?.currentExam) {
        window.examEngine.startTest(window.examEngine.currentExam.id, window.examEngine.currentExam);
      }
    });
  }

  const goHome = () => {
    window.soundFX?.playClick();
    document.getElementById('portal-dashboard-view')?.classList.remove('hidden');
    document.getElementById('test-interface-view')?.classList.add('hidden');
    document.getElementById('test-results-view')?.classList.add('hidden');
    document.getElementById('test-review-view')?.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (btnHomeFromResults) btnHomeFromResults.addEventListener('click', goHome);
  if (btnHomeFromReview) btnHomeFromReview.addEventListener('click', goHome);

  // Review mode filter pills
  const reviewFilterPills = document.querySelectorAll('.review-filter-pill');
  reviewFilterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      window.soundFX?.playClick();
      const filter = pill.getAttribute('data-review-filter');

      reviewFilterPills.forEach(p => {
        p.classList.remove('bg-cyan-500', 'text-slate-950');
        p.classList.add('bg-slate-800', 'text-slate-400');
      });
      pill.classList.add('bg-cyan-500', 'text-slate-950');
      pill.classList.remove('bg-slate-800', 'text-slate-400');

      window.examEngine?.openReviewMode(filter);
    });
  });
}
