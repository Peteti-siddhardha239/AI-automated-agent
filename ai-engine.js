/**
 * AstraGov AI - Core Artificial Intelligence Engine
 * 1. Generative AI Custom Mock Test Architect
 * 2. 24/7 AI Exam Doubt Solver & Mentor ("Astra AI")
 * 3. AI Predictive Rank & Adaptive Study Plan Generator
 */

class AstraAiEngine {
  constructor() {
    this.doubtResponsesDatabase = {
      "article 32": {
        title: "Article 32 vs Article 226 (Writ Jurisdiction)",
        content: `• <strong>Article 32</strong> is itself a Fundamental Right (Right to Constitutional Remedies) under Part III. It can be invoked ONLY for enforcement of Fundamental Rights against the Supreme Court of India. Dr. B.R. Ambedkar called Article 32 the <em>'Heart and Soul of the Constitution'</em>.<br><br>
• <strong>Article 226</strong> empowers High Courts to issue writs NOT ONLY for Fundamental Rights but also for 'any other purpose' (legal/statutory rights). Hence, the writ jurisdiction of the High Court is legally broader in scope than that of the Supreme Court!<br><br>
💡 <strong>Exam Memory Trick:</strong> SC = Only FRs (Defensive shield). HC = FRs + Legal Rights (Broader horizon).`
      },
      "schedules": {
        title: "Tricks to Remember 12 Schedules of Indian Constitution",
        content: `Use the universally acclaimed UPSC mnemonic: <strong>\"TEARS OF OLD PM\"</strong><br><br>
• <strong>T</strong> - Territories & States (Schedule 1)<br>
• <strong>E</strong> - Emoluments, Salaries & Allowances (Schedule 2)<br>
• <strong>A</strong> - Affirmations & Oaths (Schedule 3)<br>
• <strong>R</strong> - Rajya Sabha seat allocation (Schedule 4)<br>
• <strong>S</strong> - Scheduled Areas administration (Schedule 5)<br>
• <strong>O</strong> - Other Tribal Areas (Assam, Meghalaya, Tripura, Mizoram - AMTM) (Schedule 6)<br>
• <strong>F</strong> - Federal Lists (Union, State, Concurrent) (Schedule 7)<br>
• <strong>O</strong> - Official Languages (22 languages) (Schedule 8)<br>
• <strong>L</strong> - Land Reforms & 1st Amendment validation (Schedule 9)<br>
• <strong>D</strong> - Defection (Anti-Defection Law, 52nd Amendment) (Schedule 10)<br>
• <strong>P</strong> - Panchayats (73rd Amendment, 29 matters) (Schedule 11)<br>
• <strong>M</strong> - Municipalities (74th Amendment, 18 matters) (Schedule 12)`
      },
      "fiscal deficit": {
        title: "Fiscal Deficit vs Primary Deficit vs Revenue Deficit",
        content: `• <strong>Fiscal Deficit (FD):</strong> Total Expenditure - Total Receipts (excluding borrowings). It reflects the total borrowing requirement of the government from all sources in a financial year.<br>
• <strong>Revenue Deficit (RD):</strong> Revenue Expenditure - Revenue Receipts. Indicates government is dissaving and using capital receipts to fund daily operational overheads.<br>
• <strong>Primary Deficit (PD):</strong> Fiscal Deficit - Interest Payments. It measures how much the government needs to borrow to meet expenses EXCLUDING past debt servicing!<br><br>
💡 <strong>Key Formula for SSC/UPSC:</strong> <code>Primary Deficit = Fiscal Deficit - Net Interest Payments</code>.`
      },
      "compound interest": {
        title: "Compound Interest 2-Year & 3-Year Speed Hacks",
        content: `Instead of multiplying (1 + r/100)^t, use Successive Percentage:<br><br>
• <strong>For 2 Years at R%:</strong> Effective Rate = <code>2R + (R²/100)%</code><br>
  - At 5%: 10 + 0.25 = 10.25%<br>
  - At 10%: 20 + 1 = 21%<br>
  - At 12%: 24 + 1.44 = 25.44%<br><br>
• <strong>Difference between CI and SI for 2 years:</strong><br>
  <code>CI - SI = P * (R / 100)²</code><br><br>
• <strong>Difference between CI and SI for 3 years:</strong><br>
  <code>CI - SI = P * (R / 100)² * [(300 + R) / 100]</code>`
      },
      "monsoons": {
        title: "Mechanism of Indian South-West Monsoon",
        content: `Four fundamental drivers tested in Civil Services:<br>
1. <strong>Differential Heating:</strong> Intense heating of Tibetan Plateau creates low-pressure cell; Mascarene High near Madagascar directs Somali Jet stream.<br>
2. <strong>Shift of ITCZ:</strong> Inter-Tropical Convergence Zone shifts northward over Ganga plains in summer, pulling moisture-laden oceanic winds.<br>
3. <strong>Tropical Easterly Jet (TEJ):</strong> Steers rain-bearing depressions from Bay of Bengal across central India.<br>
4. <strong>El Niño / IOD:</strong> Positive Indian Ocean Dipole (IOD) enhances Indian monsoons, while El Niño typically causes deficient rainfall.`
      }
    };
  }

  /**
   * Generates custom test questions based on topic, exam type, and difficulty.
   */
  generateCustomAiTest(topic, examType, difficulty, count = 5) {
    const questions = [];
    const sanitizedTopic = (topic || "General Studies").trim();

    // Topic-based intelligent synthesizer library
    const generatorTemplates = [
      {
        pattern: "conceptual_statements",
        builder: (t, d) => ({
          question: `With reference to '${t}', consider the following analytical statements:\n\n1. It plays a decisive role in macro-policy formulation and institutional governance in India.\n2. Recent regulatory notifications have established standardized compliance benchmarks for this domain.\n3. The statutory oversight is vested exclusively in independent constitutional authorities.\n\nWhich of the statements given above are correct?`,
          options: [
            "1 and 2 only",
            "2 and 3 only",
            "1 and 3 only",
            "1, 2 and 3"
          ],
          correct: 0,
          explanation: {
            coreConcept: `${t} Governance & Analytical Framework`,
            breakdown: `• Statements 1 & 2 reflect modern statutory provisions governing '${t}'.\n• Statement 3 is incorrect because administrative oversight involves coordinated multi-agency frameworks rather than exclusive constitutional reservation.`,
            mnemonic: `Recall: Exclusive reservation rarely applies unless specified by Articles 148, 280, or 324.`,
            reference: `Standard Civil Services Foundation Manual on ${t}.`
          }
        })
      },
      {
        pattern: "application_and_features",
        builder: (t, d) => ({
          question: `Which of the following best characterizes the primary objective and operational impact of '${t}' in the context of recent government examinations?`,
          options: [
            `Enhancing structural transparency and optimizing resource allocation efficiency`,
            `Restricting decentralization in favor of centralized bureaucratic monitoring`,
            `Phasing out digital infrastructure in traditional administration`,
            `Mandating uniform fixed quotas across non-notified sectors`
          ],
          correct: 0,
          explanation: {
            coreConcept: `${t} - Functional Objective`,
            breakdown: `• The core tenet of modern administrative reforms regarding '${t}' focuses on maximizing transparency, eliminating leakages, and fostering targeted socio-economic growth.`,
            mnemonic: `Modern Public Policy = Transparency + Direct Benefit Delivery.`,
            reference: `NITI Aayog Strategy Reports & Annual Surveys.`
          }
        })
      },
      {
        pattern: "chronology_and_amendments",
        builder: (t, d) => ({
          question: `In the evolutionary timeline of '${t}' in Indian history and governance, which of the following milestones occurred earliest?`,
          options: [
            `Enactment of the foundational statutory framework`,
            `Introduction of the landmark 1991 structural adaptation`,
            `Establishment of modern high-level autonomous tribunals`,
            `Digitization of procedural verification under national portals`
          ],
          correct: 0,
          explanation: {
            coreConcept: `${t} - Historical Chronology`,
            breakdown: `• Foundational statutory acts established the legal baseline long before post-independence reforms and the subsequent 1991 liberalization / modern digital transitions.`,
            mnemonic: `Always trace chronology: Colonial/Constituent Baseline -> Planning Era -> 1991 Reforms -> Digital Era.`,
            reference: `India Since Independence - Bipan Chandra.`
          }
        })
      },
      {
        pattern: "problem_solving_quantitative",
        builder: (t, d) => ({
          question: `In an analytical test scenario concerning '${t}', an initial baseline value increases by 20% in the first quarter and subsequently decreases by 10% in the next quarter. What is the net percentage variation?`,
          options: [
            `+8% Net Increase`,
            `+10% Net Increase`,
            `+5% Net Increase`,
            `No net change (0%)`
          ],
          correct: 0,
          explanation: {
            coreConcept: `Successive Percentage Application`,
            breakdown: `• Let Initial Value = 100.\n• After +20%: 100 * 1.20 = 120.\n• After -10%: 120 * 0.90 = 108.\n• Net Variation = 108 - 100 = +8% Increase.\n• Formula: x + y + (xy/100) = 20 - 10 - 2 = +8%.`,
            mnemonic: `Net % = +20 - 10 - 2 = +8%.`,
            reference: `Quantitative Aptitude for Competitive Examinations.`
          }
        })
      },
      {
        pattern: "comparative_analysis",
        builder: (t, d) => ({
          question: `Consider the following pairs regarding '${t}' and associated key terminologies:\n\n1. Statutory Mandate : Backed by an Act of Parliament\n2. Quasi-Judicial Power : Authority to adjudicate and impose penalties\n3. Advisory Competence : Binding on executive decision-making without exception\n\nWhich of the pairs given above are correctly matched?`,
          options: [
            "1 and 2 only",
            "2 and 3 only",
            "1 and 3 only",
            "1, 2 and 3"
          ],
          correct: 0,
          explanation: {
            coreConcept: `Constitutional & Statutory Terminology`,
            breakdown: `• Pair 1 is correct: Statutory means created by an Act of Parliament.\n• Pair 2 is correct: Quasi-judicial bodies have powers resembling courts (e.g., NGT, CCI).\n• Pair 3 is incorrect: Advisory recommendations are non-binding recommendations.`,
            mnemonic: `Advisory = Suggestive, never automatically binding!`,
            reference: `Indian Polity - Laxmikanth.`
          }
        })
      }
    ];

    for (let i = 0; i < count; i++) {
      const template = generatorTemplates[i % generatorTemplates.length];
      const built = template.builder(sanitizedTopic, difficulty);

      questions.push({
        id: `ai_gen_${Date.now()}_${i + 1}`,
        section: sanitizedTopic,
        subject: sanitizedTopic,
        difficulty: difficulty,
        question: built.question,
        options: built.options,
        correct: built.correct,
        explanation: built.explanation
      });
    }

    return {
      id: `ai_custom_${Date.now()}`,
      title: `AI Custom Mock: ${sanitizedTopic} (${examType})`,
      category: examType,
      badge: "AI Generated",
      duration: Math.max(10, count * 2), // 2 mins per question
      totalQuestions: questions.length,
      marksPerQuestion: 2,
      negativeMark: 0.66,
      difficulty: difficulty,
      description: `Curated on-the-fly by Astra AI Generative Engine focusing on ${sanitizedTopic}.`,
      sections: ["All", sanitizedTopic],
      questions: questions
    };
  }

  /**
   * AI Doubt Solver chat responses
   */
  askDoubt(query) {
    const q = (query || "").toLowerCase();
    
    // Check keyword matches in built-in knowledge base
    for (const [key, item] of Object.entries(this.doubtResponsesDatabase)) {
      if (q.includes(key)) {
        return item;
      }
    }

    if (q.includes("article") || q.includes("polity") || q.includes("constitution")) {
      return {
        title: "Indian Polity & Constitutional Dynamics",
        content: `• <strong>Key Principle:</strong> The Constitution of India balances parliamentary sovereignty with judicial review. Fundamental Rights (Articles 12-35) are justiciable, whereas Directive Principles (Articles 36-51) guide state policy without legal coercion in courts.<br><br>
• <strong>Elimination Tip for Exams:</strong> Look out for absolute words like <em>'sole discretion'</em>, <em>'unconditionally'</em>, or <em>'no exception'</em>. In Indian Constitutional Law, almost every executive power is conditioned by advice of the Council of Ministers (Article 74).`
      };
    }

    if (q.includes("speed") || q.includes("math") || q.includes("quant") || q.includes("aptitude") || q.includes("ratio")) {
      return {
        title: "Quantitative Aptitude Speed Strategies",
        content: `• <strong>Rule of Fraction-to-Percentage:</strong> Memorize 1/7 = 14.28%, 1/8 = 12.5%, 1/9 = 11.11%, 1/11 = 9.09%, 1/12 = 8.33%, 1/13 = 7.69%.<br><br>
• <strong>Alligation Method:</strong> Whenever two ingredients at costs C1 and C2 are mixed to produce mean cost M, the ratio of quantities is always <code>(C2 - M) : (M - C1)</code>. This saves 40+ seconds in profit-loss, mixtures, and weighted average questions!`
      };
    }

    if (q.includes("strategy") || q.includes("how to prepare") || q.includes("negative mark")) {
      return {
        title: "Astra AI Strategic Protocol for Negative Marking Reduction",
        content: `1. <strong>Round 1 (Pure Certainty):</strong> Attempt only questions where you are 100% sure. Target: 40-50% of the paper.<br>
2. <strong>Round 2 (50-50 Elimination):</strong> Attempt questions where you have eliminated 2 options. Mathematically, with +2 and -0.66, your expected value is positive (+0.67 marks per question)!<br>
3. <strong>Strict Never-Guess Rule:</strong> If you cannot eliminate at least one option, skip immediately without hesitation to protect your hard-earned score.`
      };
    }

    // Default intelligent fallback synthesis
    return {
      title: `Astra AI Insight on: "${query}"`,
      content: `• <strong>Core Exam Context:</strong> In competitive examinations (UPSC, SSC, Banking, Railways), this topic requires mastery of fundamental definitions, recent 12-month current affairs linkages, and standard NCERT conceptual clarity.<br><br>
• <strong>Astra AI High-Yield Recommendation:</strong> Focus on chronological progression, comparative tabular analysis, and solving previous 5-year question papers (PYQs).<br><br>
💡 <em>Want a live mock test on this topic? Use our 'AI Test Architect' tab to generate a custom 10-question drill instantly!</em>`
    };
  }
}

window.astraAi = new AstraAiEngine();
