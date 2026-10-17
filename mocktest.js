/**
 * AstraGov AI - High Precision Government Exam Test Engine
 * Simulates official NTA / TCS-iON style interface with modern AI diagnostics.
 */

const QuestionStatus = {
  NOT_VISITED: 'not-visited',     // Gray
  NOT_ANSWERED: 'not-answered',   // Red
  ANSWERED: 'answered',           // Green
  MARKED: 'marked',               // Purple
  ANSWERED_MARKED: 'ans-marked'   // Cyan with badge
};

class ExamEngine {
  constructor() {
    this.currentExam = null;
    this.questions = [];
    this.currentIndex = 0;
    this.userResponses = {}; // { qid: optionIndex }
    this.questionStatuses = {}; // { qid: QuestionStatus }
    this.timeSpent = {}; // { qid: seconds }
    this.eliminatedOptions = {}; // { qid: Set of optionIndices }
    this.timerInterval = null;
    this.remainingSeconds = 0;
    this.totalDurationSeconds = 0;
    this.isTestActive = false;
    this.isReviewMode = false;
    this.reviewFilter = 'all'; // all, correct, incorrect, unattempted, marked
    this.examStartTime = null;
    this.fontSizeLevel = 1; // 0: small, 1: normal, 2: large
    this.currentSectionFilter = 'All';

    this.dom = {};
  }

  initDOM() {
    this.dom = {
      testView: document.getElementById('test-interface-view'),
      dashboardView: document.getElementById('portal-dashboard-view'),
      resultsView: document.getElementById('test-results-view'),
      reviewView: document.getElementById('test-review-view'),
      
      examTitle: document.getElementById('active-exam-title'),
      timerDisplay: document.getElementById('exam-timer-clock'),
      timerProgress: document.getElementById('exam-timer-bar'),
      questionNum: document.getElementById('current-question-num'),
      totalQNum: document.getElementById('total-questions-count'),
      subjectBadge: document.getElementById('question-subject-badge'),
      difficultyBadge: document.getElementById('question-difficulty-badge'),
      marksBadge: document.getElementById('question-marks-badge'),
      questionText: document.getElementById('question-body-text'),
      optionsContainer: document.getElementById('options-list-container'),
      paletteGrid: document.getElementById('question-palette-grid'),
      sectionTabs: document.getElementById('section-filter-tabs'),
      
      btnPrev: document.getElementById('btn-prev-q'),
      btnNext: document.getElementById('btn-next-q'),
      btnSaveNext: document.getElementById('btn-save-next'),
      btnMarkReview: document.getElementById('btn-mark-review'),
      btnClear: document.getElementById('btn-clear-response'),
      btnAiHint: document.getElementById('btn-ai-hint'),
      btnSubmit: document.getElementById('btn-submit-exam'),
      
      hintBox: document.getElementById('question-ai-hint-box'),
      
      // Legend counters
      legendAnswered: document.getElementById('legend-count-answered'),
      legendNotAnswered: document.getElementById('legend-count-not-answered'),
      legendMarked: document.getElementById('legend-count-marked'),
      legendAnsMarked: document.getElementById('legend-count-ans-marked'),
      legendNotVisited: document.getElementById('legend-count-not-visited')
    };

    this.bindEvents();
  }

  bindEvents() {
    if (this.dom.btnSaveNext) {
      this.dom.btnSaveNext.addEventListener('click', () => {
        window.soundFX?.playClick();
        this.saveAndNext();
      });
    }

    if (this.dom.btnMarkReview) {
      this.dom.btnMarkReview.addEventListener('click', () => {
        window.soundFX?.playClick();
        this.markForReviewAndNext();
      });
    }

    if (this.dom.btnClear) {
      this.dom.btnClear.addEventListener('click', () => {
        window.soundFX?.playClick();
        this.clearResponse();
      });
    }

    if (this.dom.btnPrev) {
      this.dom.btnPrev.addEventListener('click', () => {
        window.soundFX?.playClick();
        if (this.currentIndex > 0) {
          this.navigateToQuestion(this.currentIndex - 1);
        }
      });
    }

    if (this.dom.btnNext) {
      this.dom.btnNext.addEventListener('click', () => {
        window.soundFX?.playClick();
        if (this.currentIndex < this.questions.length - 1) {
          this.navigateToQuestion(this.currentIndex + 1);
        }
      });
    }

    if (this.dom.btnAiHint) {
      this.dom.btnAiHint.addEventListener('click', () => {
        window.soundFX?.playNotification();
        this.toggleAiHint();
      });
    }

    if (this.dom.btnSubmit) {
      this.dom.btnSubmit.addEventListener('click', () => {
        window.soundFX?.playWarning();
        this.confirmSubmitModal();
      });
    }

    // Keyboard shortcuts (A, B, C, D to pick options, Enter to save & next)
    window.addEventListener('keydown', (e) => {
      if (!this.isTestActive || this.isReviewMode) return;
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      const key = e.key.toUpperCase();
      if (['1', 'A'].includes(key)) this.selectOption(0);
      else if (['2', 'B'].includes(key)) this.selectOption(1);
      else if (['3', 'C'].includes(key)) this.selectOption(2);
      else if (['4', 'D'].includes(key)) this.selectOption(3);
      else if (key === 'ENTER') this.saveAndNext();
      else if (key === 'ARROWLEFT' && this.currentIndex > 0) this.navigateToQuestion(this.currentIndex - 1);
      else if (key === 'ARROWRIGHT' && this.currentIndex < this.questions.length - 1) this.navigateToQuestion(this.currentIndex + 1);
    });

    // Font size controls
    const btnFontInc = document.getElementById('btn-font-inc');
    const btnFontDec = document.getElementById('btn-font-dec');
    if (btnFontInc) {
      btnFontInc.addEventListener('click', () => {
        this.fontSizeLevel = Math.min(2, this.fontSizeLevel + 1);
        this.updateFontSize();
      });
    }
    if (btnFontDec) {
      btnFontDec.addEventListener('click', () => {
        this.fontSizeLevel = Math.max(0, this.fontSizeLevel - 1);
        this.updateFontSize();
      });
    }
  }

  updateFontSize() {
    const qBox = document.getElementById('question-display-area');
    if (!qBox) return;
    qBox.classList.remove('font-sm', 'font-md', 'font-lg');
    if (this.fontSizeLevel === 0) qBox.classList.add('font-sm');
    else if (this.fontSizeLevel === 1) qBox.classList.add('font-md');
    else if (this.fontSizeLevel === 2) qBox.classList.add('font-lg');
  }

  startTest(examKey, customBank = null) {
    let examData = customBank;
    if (!examData && window.EXAM_BANKS && window.EXAM_BANKS[examKey]) {
      examData = window.EXAM_BANKS[examKey];
    }

    if (!examData) {
      console.error("Exam data not found for key:", examKey);
      return;
    }

    this.currentExam = examData;
    this.questions = JSON.parse(JSON.stringify(examData.questions || []));
    this.currentIndex = 0;
    this.userResponses = {};
    this.questionStatuses = {};
    this.timeSpent = {};
    this.eliminatedOptions = {};
    this.isTestActive = true;
    this.isReviewMode = false;
    this.examStartTime = Date.now();

    // Default status for all questions is NOT_VISITED
    this.questions.forEach((q, idx) => {
      this.questionStatuses[q.id] = QuestionStatus.NOT_VISITED;
      this.timeSpent[q.id] = 0;
      this.eliminatedOptions[q.id] = new Set();
    });

    // Mark first question as NOT_ANSWERED
    if (this.questions.length > 0) {
      this.questionStatuses[this.questions[0].id] = QuestionStatus.NOT_ANSWERED;
    }

    // Setup timer
    const durationMinutes = examData.duration || 30;
    this.totalDurationSeconds = durationMinutes * 60;
    this.remainingSeconds = this.totalDurationSeconds;
    this.startTimer();

    // Switch views
    if (this.dom.dashboardView) this.dom.dashboardView.classList.add('hidden');
    if (this.dom.resultsView) this.dom.resultsView.classList.add('hidden');
    if (this.dom.reviewView) this.dom.reviewView.classList.add('hidden');
    if (this.dom.testView) this.dom.testView.classList.remove('hidden');

    // Update UI headers
    if (this.dom.examTitle) {
      this.dom.examTitle.textContent = examData.title;
    }

    this.renderSectionTabs();
    this.renderPalette();
    this.navigateToQuestion(0);
    this.updateLegendCounts();

    window.soundFX?.playTestStart();
  }

  renderSectionTabs() {
    if (!this.dom.sectionTabs || !this.currentExam) return;
    const sections = this.currentExam.sections || ["All"];
    this.dom.sectionTabs.innerHTML = "";

    sections.forEach(sec => {
      const tab = document.createElement('button');
      tab.className = `px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
        this.currentSectionFilter === sec ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'text-slate-400 hover:text-white bg-slate-800/60'
      }`;
      tab.textContent = sec;
      tab.addEventListener('click', () => {
        this.currentSectionFilter = sec;
        this.renderSectionTabs();
        this.renderPalette();
        // Jump to first question in section if current is outside
        const firstMatchIdx = this.questions.findIndex(q => sec === 'All' || q.section === sec);
        if (firstMatchIdx !== -1) {
          this.navigateToQuestion(firstMatchIdx);
        }
      });
      this.dom.sectionTabs.appendChild(tab);
    });
  }

  startTimer() {
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.remainingSeconds <= 0) {
        clearInterval(this.timerInterval);
        this.autoSubmitOnTimeUp();
        return;
      }

      this.remainingSeconds--;
      
      // Track time on current question
      const currentQ = this.questions[this.currentIndex];
      if (currentQ) {
        this.timeSpent[currentQ.id] = (this.timeSpent[currentQ.id] || 0) + 1;
      }

      this.updateTimerDisplay();

      // Sound alerts at 5 mins, 2 mins, 30 secs
      if (this.remainingSeconds === 120 || this.remainingSeconds === 30) {
        window.soundFX?.playWarning();
      }
    }, 1000);

    this.updateTimerDisplay();
  }

  updateTimerDisplay() {
    if (!this.dom.timerDisplay) return;
    const hours = Math.floor(this.remainingSeconds / 3600);
    const minutes = Math.floor((this.remainingSeconds % 3600) / 60);
    const seconds = this.remainingSeconds % 60;

    let timeStr = "";
    if (hours > 0) {
      timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    } else {
      timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    this.dom.timerDisplay.textContent = timeStr;

    if (this.dom.timerProgress) {
      const pct = (this.remainingSeconds / this.totalDurationSeconds) * 100;
      this.dom.timerProgress.style.width = `${pct}%`;
      
      if (pct < 10) {
        this.dom.timerProgress.className = "h-full bg-rose-500 animate-pulse";
        this.dom.timerDisplay.classList.add('text-rose-400');
      } else if (pct < 25) {
        this.dom.timerProgress.className = "h-full bg-amber-500";
        this.dom.timerDisplay.classList.add('text-amber-400');
      } else {
        this.dom.timerProgress.className = "h-full bg-cyan-500";
        this.dom.timerDisplay.classList.remove('text-rose-400', 'text-amber-400');
      }
    }
  }

  navigateToQuestion(index) {
    if (index < 0 || index >= this.questions.length) return;
    this.currentIndex = index;
    const q = this.questions[index];

    // If never visited, mark as NOT_ANSWERED
    if (this.questionStatuses[q.id] === QuestionStatus.NOT_VISITED) {
      this.questionStatuses[q.id] = QuestionStatus.NOT_ANSWERED;
    }

    this.renderQuestion(q);
    this.renderPalette();
    this.updateLegendCounts();
  }

  renderQuestion(q) {
    if (!q) return;

    if (this.dom.questionNum) this.dom.questionNum.textContent = `Question ${this.currentIndex + 1}`;
    if (this.dom.totalQNum) this.dom.totalQNum.textContent = `of ${this.questions.length}`;
    if (this.dom.subjectBadge) this.dom.subjectBadge.textContent = q.subject || q.section || "General";
    if (this.dom.difficultyBadge) {
      this.dom.difficultyBadge.textContent = q.difficulty || "Standard";
      this.dom.difficultyBadge.className = `px-2 py-0.5 rounded text-xs font-semibold ${
        q.difficulty === 'Hard' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
        q.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
      }`;
    }
    if (this.dom.marksBadge) {
      const marks = this.currentExam.marksPerQuestion || 2;
      const neg = this.currentExam.negativeMark || 0.66;
      this.dom.marksBadge.textContent = `+${marks} / -${neg}`;
    }

    if (this.dom.questionText) {
      this.dom.questionText.innerHTML = q.question.replace(/\n/g, '<br>');
    }

    // Hide AI hint on question change
    if (this.dom.hintBox) {
      this.dom.hintBox.classList.add('hidden');
    }

    // Render Options
    if (this.dom.optionsContainer) {
      this.dom.optionsContainer.innerHTML = '';
      const selected = this.userResponses[q.id];
      const eliminated = this.eliminatedOptions[q.id] || new Set();

      const optionLabels = ['A', 'B', 'C', 'D', 'E'];

      q.options.forEach((optText, optIdx) => {
        const optRow = document.createElement('div');
        const isSelected = selected === optIdx;
        const isEliminated = eliminated.has(optIdx);

        optRow.className = `group flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer select-none ${
          isEliminated ? 'opacity-40 line-through bg-slate-900/40 border-slate-800' :
          isSelected ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-lg shadow-cyan-500/10' :
          'bg-slate-900/60 border-slate-800/80 hover:border-slate-600 text-slate-200'
        }`;

        optRow.innerHTML = `
          <div class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-colors ${
            isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
          }">
            ${optionLabels[optIdx]}
          </div>
          <div class="flex-grow pt-1 text-sm md:text-base leading-relaxed">
            ${optText}
          </div>
          <div class="flex-shrink-0 pt-1">
            <button title="Strike out option (Elimination Tool)" class="btn-strike-opt text-xs text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors">
              ${isEliminated ? '↩ Restore' : '❌ Strike'}
            </button>
          </div>
        `;

        // Click on row selects option
        optRow.addEventListener('click', (e) => {
          if (e.target.closest('.btn-strike-opt')) return; // handled by button
          this.selectOption(optIdx);
        });

        // Strike button
        const strikeBtn = optRow.querySelector('.btn-strike-opt');
        if (strikeBtn) {
          strikeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleEliminateOption(optIdx);
          });
        }

        this.dom.optionsContainer.appendChild(optRow);
      });
    }

    // Update navigation button states
    if (this.dom.btnPrev) {
      this.dom.btnPrev.disabled = this.currentIndex === 0;
      this.dom.btnPrev.classList.toggle('opacity-50', this.currentIndex === 0);
    }
  }

  selectOption(optIdx) {
    const q = this.questions[this.currentIndex];
    if (!q) return;

    window.soundFX?.playOptionSelect();
    this.userResponses[q.id] = optIdx;

    // Un-eliminate if selected
    if (this.eliminatedOptions[q.id]?.has(optIdx)) {
      this.eliminatedOptions[q.id].delete(optIdx);
    }

    // Refresh option styles
    this.renderQuestion(q);
  }

  toggleEliminateOption(optIdx) {
    const q = this.questions[this.currentIndex];
    if (!q) return;

    if (!this.eliminatedOptions[q.id]) {
      this.eliminatedOptions[q.id] = new Set();
    }

    if (this.eliminatedOptions[q.id].has(optIdx)) {
      this.eliminatedOptions[q.id].delete(optIdx);
    } else {
      this.eliminatedOptions[q.id].add(optIdx);
      if (this.userResponses[q.id] === optIdx) {
        delete this.userResponses[q.id];
      }
    }

    window.soundFX?.playClick();
    this.renderQuestion(q);
  }

  clearResponse() {
    const q = this.questions[this.currentIndex];
    if (!q) return;

    delete this.userResponses[q.id];
    this.questionStatuses[q.id] = QuestionStatus.NOT_ANSWERED;

    this.renderQuestion(q);
    this.renderPalette();
    this.updateLegendCounts();
  }

  saveAndNext() {
    const q = this.questions[this.currentIndex];
    if (!q) return;

    if (this.userResponses[q.id] !== undefined) {
      this.questionStatuses[q.id] = QuestionStatus.ANSWERED;
    } else {
      this.questionStatuses[q.id] = QuestionStatus.NOT_ANSWERED;
    }

    if (this.currentIndex < this.questions.length - 1) {
      this.navigateToQuestion(this.currentIndex + 1);
    } else {
      this.renderPalette();
      this.updateLegendCounts();
      // Show notification: reached end of test
      window.showToast?.("You have reached the final question. Click Submit to finish.", "info");
    }
  }

  markForReviewAndNext() {
    const q = this.questions[this.currentIndex];
    if (!q) return;

    if (this.userResponses[q.id] !== undefined) {
      this.questionStatuses[q.id] = QuestionStatus.ANSWERED_MARKED;
    } else {
      this.questionStatuses[q.id] = QuestionStatus.MARKED;
    }

    if (this.currentIndex < this.questions.length - 1) {
      this.navigateToQuestion(this.currentIndex + 1);
    } else {
      this.renderPalette();
      this.updateLegendCounts();
    }
  }

  toggleAiHint() {
    const q = this.questions[this.currentIndex];
    if (!q || !this.dom.hintBox) return;

    if (this.dom.hintBox.classList.contains('hidden')) {
      const hint = q.explanation?.mnemonic || "Look for definitive keywords like 'Only', 'Always', or eliminate extreme statements.";
      const concept = q.explanation?.coreConcept || "Conceptual linkage with fundamental principles.";
      
      this.dom.hintBox.innerHTML = `
        <div class="flex items-start gap-3 p-4 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-200 animate-fadeIn">
          <div class="text-xl">🤖</div>
          <div>
            <div class="font-bold text-xs uppercase tracking-wider text-purple-400 mb-1">Astra AI Exam Strategic Clue</div>
            <div class="text-sm font-medium mb-1">Focus Area: <span class="text-white">${concept}</span></div>
            <div class="text-xs text-purple-300 italic">"Hint: ${hint}"</div>
          </div>
        </div>
      `;
      this.dom.hintBox.classList.remove('hidden');
    } else {
      this.dom.hintBox.classList.add('hidden');
    }
  }

  renderPalette() {
    if (!this.dom.paletteGrid) return;
    this.dom.paletteGrid.innerHTML = '';

    this.questions.forEach((q, idx) => {
      // Check section filter
      if (this.currentSectionFilter !== 'All' && q.section !== this.currentSectionFilter) {
        return;
      }

      const status = this.questionStatuses[q.id] || QuestionStatus.NOT_VISITED;
      const isCurrent = idx === this.currentIndex;

      const item = document.createElement('button');
      item.className = `palette-btn relative w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs transition-all ${
        this.getPaletteClasses(status, isCurrent)
      }`;
      item.textContent = idx + 1;

      // Small badge dot for answered & marked
      if (status === QuestionStatus.ANSWERED_MARKED) {
        const dot = document.createElement('span');
        dot.className = "absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border border-slate-900 rounded-full";
        item.appendChild(dot);
      }

      item.addEventListener('click', () => {
        window.soundFX?.playClick();
        this.navigateToQuestion(idx);
      });

      this.dom.paletteGrid.appendChild(item);
    });
  }

  getPaletteClasses(status, isCurrent) {
    let base = "";
    switch (status) {
      case QuestionStatus.ANSWERED:
        base = "bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm shadow-emerald-500/30";
        break;
      case QuestionStatus.NOT_ANSWERED:
        base = "bg-rose-600 text-white hover:bg-rose-500 shadow-sm shadow-rose-500/30";
        break;
      case QuestionStatus.MARKED:
        base = "bg-purple-600 text-white hover:bg-purple-500 shadow-sm shadow-purple-500/30";
        break;
      case QuestionStatus.ANSWERED_MARKED:
        base = "bg-purple-700 text-white border-2 border-emerald-400";
        break;
      default:
        base = "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700";
    }

    if (isCurrent) {
      base += " ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 scale-105 z-10 font-black";
    }
    return base;
  }

  updateLegendCounts() {
    let answered = 0;
    let notAnswered = 0;
    let marked = 0;
    let ansMarked = 0;
    let notVisited = 0;

    this.questions.forEach(q => {
      const s = this.questionStatuses[q.id];
      if (s === QuestionStatus.ANSWERED) answered++;
      else if (s === QuestionStatus.NOT_ANSWERED) notAnswered++;
      else if (s === QuestionStatus.MARKED) marked++;
      else if (s === QuestionStatus.ANSWERED_MARKED) ansMarked++;
      else notVisited++;
    });

    if (this.dom.legendAnswered) this.dom.legendAnswered.textContent = answered;
    if (this.dom.legendNotAnswered) this.dom.legendNotAnswered.textContent = notAnswered;
    if (this.dom.legendMarked) this.dom.legendMarked.textContent = marked;
    if (this.dom.legendAnsMarked) this.dom.legendAnsMarked.textContent = ansMarked;
    if (this.dom.legendNotVisited) this.dom.legendNotVisited.textContent = notVisited;
  }

  confirmSubmitModal() {
    let answeredCount = 0;
    let markedCount = 0;
    let notAnsweredCount = 0;

    this.questions.forEach(q => {
      if (this.userResponses[q.id] !== undefined) answeredCount++;
      else if (this.questionStatuses[q.id] === QuestionStatus.MARKED) markedCount++;
      else notAnsweredCount++;
    });

    const modal = document.getElementById('exam-submit-modal');
    if (modal) {
      document.getElementById('modal-stat-answered').textContent = answeredCount;
      document.getElementById('modal-stat-unanswered').textContent = notAnsweredCount;
      document.getElementById('modal-stat-marked').textContent = markedCount;
      document.getElementById('modal-stat-total').textContent = this.questions.length;
      modal.classList.remove('hidden');
    } else {
      if (confirm(`Are you sure you want to submit?\nAnswered: ${answeredCount}\nUnanswered: ${notAnsweredCount}`)) {
        this.finishTest();
      }
    }
  }

  autoSubmitOnTimeUp() {
    window.soundFX?.playTestSubmit();
    window.showToast?.("Time's Up! Test is being evaluated automatically by Astra AI.", "warning");
    this.finishTest();
  }

  finishTest() {
    clearInterval(this.timerInterval);
    this.isTestActive = false;

    // Close submit modal if open
    const modal = document.getElementById('exam-submit-modal');
    if (modal) modal.classList.add('hidden');

    // Calculate score
    const results = this.computeResults();

    // Render results view
    this.renderResults(results);

    window.soundFX?.playSuccess();
  }

  computeResults() {
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;

    const marksPerQ = this.currentExam.marksPerQuestion || 2;
    const negMarks = this.currentExam.negativeMark || 0.66;

    const subjectBreakdown = {};

    this.questions.forEach(q => {
      const subj = q.subject || "General";
      if (!subjectBreakdown[subj]) {
        subjectBreakdown[subj] = { total: 0, correct: 0, incorrect: 0, marks: 0 };
      }
      subjectBreakdown[subj].total++;

      const userChoice = this.userResponses[q.id];

      if (userChoice === undefined) {
        unattemptedCount++;
      } else if (userChoice === q.correct) {
        correctCount++;
        subjectBreakdown[subj].correct++;
        subjectBreakdown[subj].marks += marksPerQ;
      } else {
        incorrectCount++;
        subjectBreakdown[subj].incorrect++;
        subjectBreakdown[subj].marks -= negMarks;
      }
    });

    const rawScore = (correctCount * marksPerQ) - (incorrectCount * negMarks);
    const finalScore = Math.max(0, parseFloat(rawScore.toFixed(2)));
    const maxScore = this.questions.length * marksPerQ;
    const accuracy = (correctCount + incorrectCount > 0)
      ? parseFloat(((correctCount / (correctCount + incorrectCount)) * 100).toFixed(1))
      : 0;

    const timeSpentTotal = this.totalDurationSeconds - this.remainingSeconds;
    const avgTimePerQ = (correctCount + incorrectCount > 0)
      ? Math.round(timeSpentTotal / (correctCount + incorrectCount))
      : 0;

    // Simulated All India Rank (AIR) based on percentile distribution
    const percentile = Math.min(99.9, Math.max(10, (finalScore / (maxScore || 1)) * 95 + (Math.random() * 4)));
    const totalSimulatedAspirants = 84500;
    const predictedRank = Math.max(1, Math.round((1 - (percentile / 100)) * totalSimulatedAspirants));

    return {
      examTitle: this.currentExam.title,
      totalQuestions: this.questions.length,
      correctCount,
      incorrectCount,
      unattemptedCount,
      finalScore,
      maxScore,
      accuracy,
      timeSpentTotal,
      avgTimePerQ,
      negativePenalty: parseFloat((incorrectCount * negMarks).toFixed(2)),
      percentile: parseFloat(percentile.toFixed(1)),
      predictedRank,
      subjectBreakdown
    };
  }

  renderResults(results) {
    if (this.dom.testView) this.dom.testView.classList.add('hidden');
    if (this.dom.resultsView) this.dom.resultsView.classList.remove('hidden');

    // Populate score cards
    document.getElementById('result-score-val').textContent = results.finalScore;
    document.getElementById('result-max-score').textContent = `/${results.maxScore}`;
    document.getElementById('result-accuracy-val').textContent = `${results.accuracy}%`;
    document.getElementById('result-rank-val').textContent = `AIR #${results.predictedRank.toLocaleString()}`;
    document.getElementById('result-percentile-val').textContent = `${results.percentile} %ile`;

    document.getElementById('stat-correct-count').textContent = results.correctCount;
    document.getElementById('stat-incorrect-count').textContent = results.incorrectCount;
    document.getElementById('stat-unattempted-count').textContent = results.unattemptedCount;
    document.getElementById('stat-penalty-val').textContent = `-${results.negativePenalty}`;

    // Format total time
    const mins = Math.floor(results.timeSpentTotal / 60);
    const secs = results.timeSpentTotal % 60;
    document.getElementById('stat-time-val').textContent = `${mins}m ${secs}s`;
    document.getElementById('stat-speed-val').textContent = `${results.avgTimePerQ}s / Q`;

    // AI Performance Diagnostics summary
    this.renderAiDiagnosis(results);

    // Subject breakdown bars
    this.renderSubjectBreakdown(results.subjectBreakdown);
  }

  renderAiDiagnosis(results) {
    const diagBox = document.getElementById('ai-performance-diagnosis');
    if (!diagBox) return;

    let verdict = "";
    let strength = [];
    let weakness = [];

    for (const [subj, data] of Object.entries(results.subjectBreakdown)) {
      const rate = data.total > 0 ? (data.correct / data.total) : 0;
      if (rate >= 0.7) strength.push(subj);
      else if (rate < 0.5) weakness.push(subj);
    }

    if (results.accuracy >= 75) {
      verdict = "🔥 <strong>Exceptional Performance!</strong> You are well ahead of the cut-off curve for this exam.";
    } else if (results.accuracy >= 50) {
      verdict = "⚡ <strong>Promising Score with Scope for Optimization!</strong> Your conceptual foundation is strong, but negative marking cost you critical marks.";
    } else {
      verdict = "🎯 <strong>Intensive Revision Recommended.</strong> Focus on high-yield static topics and strict elimination tactics before attempting full-length tests.";
    }

    diagBox.innerHTML = `
      <div class="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-purple-950/60 border border-purple-500/30 text-slate-200">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-black">AI</div>
          <h4 class="font-bold text-white text-base">Astra AI Diagnostic Intelligence</h4>
        </div>
        <p class="text-sm leading-relaxed mb-4">${verdict}</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div class="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
            <div class="font-bold text-emerald-400 mb-1">💪 High Mastery Subjects:</div>
            <div>${strength.length > 0 ? strength.join(', ') : 'None marked yet (need broader question attempt)'}</div>
          </div>
          <div class="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30">
            <div class="font-bold text-rose-400 mb-1">⚠️ Remedial Focus Needed:</div>
            <div>${weakness.length > 0 ? weakness.join(', ') : 'Good balance across attempted sections'}</div>
          </div>
        </div>
      </div>
    `;
  }

  renderSubjectBreakdown(breakdown) {
    const container = document.getElementById('subject-accuracy-bars');
    if (!container) return;
    container.innerHTML = '';

    for (const [subj, data] of Object.entries(breakdown)) {
      const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
      const row = document.createElement('div');
      row.className = "space-y-1";
      row.innerHTML = `
        <div class="flex justify-between text-xs font-semibold">
          <span class="text-slate-300">${subj}</span>
          <span class="text-cyan-400">${data.correct}/${data.total} (${pct}%)</span>
        </div>
        <div class="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
          <div class="h-full rounded-full transition-all duration-1000 ${
            pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-rose-500'
          }" style="width: ${pct}%"></div>
        </div>
      `;
      container.appendChild(row);
    }
  }

  openReviewMode(filter = 'all') {
    this.isReviewMode = true;
    this.reviewFilter = filter;

    if (this.dom.resultsView) this.dom.resultsView.classList.add('hidden');
    if (this.dom.reviewView) this.dom.reviewView.classList.remove('hidden');

    this.renderReviewQuestions();
  }

  renderReviewQuestions() {
    const listContainer = document.getElementById('review-questions-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    const optionLabels = ['A', 'B', 'C', 'D'];

    this.questions.forEach((q, idx) => {
      const userChoice = this.userResponses[q.id];
      const isCorrect = userChoice === q.correct;
      const isAttempted = userChoice !== undefined;
      const isMarked = this.questionStatuses[q.id] === QuestionStatus.MARKED || this.questionStatuses[q.id] === QuestionStatus.ANSWERED_MARKED;

      // Filter check
      if (this.reviewFilter === 'correct' && !isCorrect) return;
      if (this.reviewFilter === 'incorrect' && (isCorrect || !isAttempted)) return;
      if (this.reviewFilter === 'unattempted' && isAttempted) return;
      if (this.reviewFilter === 'marked' && !isMarked) return;

      const card = document.createElement('div');
      card.className = `p-6 rounded-2xl border transition-all ${
        !isAttempted ? 'bg-slate-900/60 border-slate-800' :
        isCorrect ? 'bg-emerald-950/20 border-emerald-500/40' :
        'bg-rose-950/20 border-rose-500/40'
      }`;

      let statusBadge = "";
      if (!isAttempted) {
        statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400">Unattempted</span>`;
      } else if (isCorrect) {
        statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">✓ Correct (+${this.currentExam.marksPerQuestion || 2})</span>`;
      } else {
        statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">✗ Incorrect (-${this.currentExam.negativeMark || 0.66})</span>`;
      }

      // Build options html
      let optionsHtml = '<div class="space-y-2 mt-4">';
      q.options.forEach((optText, optIdx) => {
        const isThisCorrect = optIdx === q.correct;
        const isThisUser = optIdx === userChoice;

        let optClass = "bg-slate-900/50 border-slate-800 text-slate-300";
        let markIcon = "";

        if (isThisCorrect) {
          optClass = "bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold";
          markIcon = " <span class='text-xs text-emerald-400 font-bold'>(Official Answer)</span>";
        } else if (isThisUser) {
          optClass = "bg-rose-950/60 border-rose-500 text-rose-200 font-semibold";
          markIcon = " <span class='text-xs text-rose-400 font-bold'>(Your Selection)</span>";
        }

        optionsHtml += `
          <div class="flex items-center gap-3 p-3 rounded-xl border text-sm ${optClass}">
            <span class="w-6 h-6 rounded flex items-center justify-center font-bold text-xs ${
              isThisCorrect ? 'bg-emerald-500 text-slate-950' : isThisUser ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'
            }">${optionLabels[optIdx]}</span>
            <span class="flex-grow">${optText} ${markIcon}</span>
          </div>
        `;
      });
      optionsHtml += '</div>';

      // Build explanation html
      const exp = q.explanation || {};
      const expHtml = `
        <div class="mt-5 p-5 rounded-xl bg-slate-950/70 border border-cyan-500/30 space-y-3">
          <div class="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <span>🤖</span> Astra AI Deep Learning Solution & Elimination Rationale
          </div>
          <div class="text-sm font-semibold text-white">Core Concept: ${exp.coreConcept || 'Analytical Principles'}</div>
          <div class="text-xs text-slate-300 whitespace-pre-line leading-relaxed">${exp.breakdown || 'Comprehensive syllabus correlation.'}</div>
          ${exp.mnemonic ? `<div class="p-2.5 rounded-lg bg-purple-950/40 border border-purple-500/30 text-xs text-purple-300 font-mono">💡 Mnemonic/Shortcut: ${exp.mnemonic}</div>` : ''}
          ${exp.reference ? `<div class="text-[11px] text-slate-500">📚 Source Reference: ${exp.reference}</div>` : ''}
        </div>
      `;

      card.innerHTML = `
        <div class="flex items-center justify-between gap-4 border-b border-slate-800/80 pb-3 mb-3">
          <div class="flex items-center gap-2">
            <span class="font-bold text-white text-base">Q${idx + 1}.</span>
            <span class="text-xs text-cyan-400 font-semibold px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30">${q.subject || 'GS'}</span>
            <span class="text-xs text-slate-400">Time Taken: ${this.timeSpent[q.id] || 0}s</span>
          </div>
          <div>${statusBadge}</div>
        </div>
        <div class="text-sm md:text-base text-slate-200 leading-relaxed">${q.question.replace(/\n/g, '<br>')}</div>
        ${optionsHtml}
        ${expHtml}
      `;

      listContainer.appendChild(card);
    });
  }
}

// Global instance
window.examEngine = new ExamEngine();
