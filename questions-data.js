/**
 * AstraGov AI - Authentic High-Yield Government Exam Question Bank
 * Curated for UPSC CSE, SSC CGL, IBPS Bank PO, RRB NTPC & State PCS
 */

const EXAM_BANKS = {
  upsc_prelims: {
    id: "upsc_prelims",
    title: "UPSC Civil Services Prelims 2026 - GS Paper I Super Mock",
    category: "UPSC CSE",
    badge: "Most Popular",
    duration: 120, // minutes
    totalQuestions: 15, // realistic preview sample for smooth interactive mock
    marksPerQuestion: 2,
    negativeMark: 0.66,
    difficulty: "UPSC Standard (Hard)",
    description: "Multi-statement conceptual questions covering Indian Polity, Modern History, Economics, Geography & Environment with UPSC-level trap options.",
    sections: ["All", "Polity & Governance", "Economy & Development", "History & Culture", "Geography & Ecology"],
    questions: [
      {
        id: "upsc_1",
        section: "Polity & Governance",
        subject: "Indian Polity",
        difficulty: "Hard",
        question: "With reference to the 'Writ of Quo-Warranto' in the Indian Constitution, consider the following statements:\n\n1. It can be sought only by an aggrieved person who has suffered personal legal injury.\n2. It cannot be issued in respect of an office of a private nature.\n3. Unlike other writs, it prevents illegal usurpation of a public office.\n\nWhich of the statements given above are correct?",
        options: [
          "1 and 2 only",
          "2 and 3 only",
          "1 and 3 only",
          "1, 2 and 3"
        ],
        correct: 1, // index 1 = "2 and 3 only"
        explanation: {
          coreConcept: "Article 32 & 226 - Writ Jurisdiction",
          breakdown: "• Statement 1 is INCORRECT: The writ of Quo-Warranto can be sought by any interested person, even if they are not personally aggrieved. The principle of 'Locus Standi' is relaxed in this writ.\n• Statement 2 is CORRECT: It can only be issued against a public office of substantive character created by statute or Constitution, NOT private bodies.\n• Statement 3 is CORRECT: The term literally means 'By what authority?' and is issued to oust an illegal occupant from public office.",
          mnemonic: "QUO-WARRANTO = 'Question Authority'. Any citizen can question, not just aggrieved!",
          reference: "M. Laxmikanth - Indian Polity, Chapter on Fundamental Rights (Writs)."
        }
      },
      {
        id: "upsc_2",
        section: "Economy & Development",
        subject: "Economics",
        difficulty: "Hard",
        question: "Consider the following statements regarding the 'Monetary Policy Committee' (MPC) in India:\n\n1. It consists of six members, with the Governor of the RBI acting as the ex-officio Chairperson.\n2. The Governor has a casting vote in the event of an equality of votes.\n3. The inflation target under the MPC framework is decided by the RBI alone without Government consultation.\n\nWhich of the statements given above is/are correct?",
        options: [
          "1 and 2 only",
          "2 only",
          "1 and 3 only",
          "1, 2 and 3"
        ],
        correct: 0, // "1 and 2 only"
        explanation: {
          coreConcept: "RBI Act, 1934 (Amended in 2016) - Monetary Policy Framework",
          breakdown: "• Statement 1 is CORRECT: MPC has 6 members (3 from RBI including Governor, Deputy Governor, one RBI officer; 3 external members appointed by Central Govt).\n• Statement 2 is CORRECT: Each member has one vote, and in case of a tie, the RBI Governor has a second or casting vote.\n• Statement 3 is INCORRECT: The inflation target (4% +/- 2% CPI) is determined by the Central Government in consultation with the RBI once every five years.",
          mnemonic: "MPC = 3 RBI + 3 Govt = 6 members. Target set by Govt + RBI together.",
          reference: "Economic Survey & Ramesh Singh Indian Economy."
        }
      },
      {
        id: "upsc_3",
        section: "History & Culture",
        subject: "Modern History",
        difficulty: "Medium",
        question: "With reference to the 'Cabinet Mission Plan (1946)', consider the following propositions:\n\n1. It rejected the demand for a separate sovereign Pakistan.\n2. It proposed a three-tier grouping of provincial assemblies into Section A, B, and C.\n3. It recommended complete transfer of power to the provinces with defense and external affairs retained under British crown.\n\nWhich of the statements given above is/are correct?",
        options: [
          "1 only",
          "1 and 2 only",
          "2 and 3 only",
          "1, 2 and 3"
        ],
        correct: 1, // "1 and 2 only"
        explanation: {
          coreConcept: "Cabinet Mission 1946 (Pethick-Lawrence, Stafford Cripps, A.V. Alexander)",
          breakdown: "• Statement 1 is CORRECT: The Cabinet Mission explicitly rejected a sovereign Pakistan, arguing it would not solve the communal minority problem.\n• Statement 2 is CORRECT: It proposed grouping: Section A (Hindu majority provinces), Section B (Muslim majority in NW), Section C (Bengal and Assam).\n• Statement 3 is INCORRECT: It proposed an Indian Union having control over Foreign Affairs, Defence, and Communications, not retained by the British crown.",
          mnemonic: "Cabinet Mission = 'One Union, 3 Sections (A,B,C), No Pakistan'.",
          reference: "Spectrum - A Brief History of Modern India by Rajiv Ahir."
        }
      },
      {
        id: "upsc_4",
        section: "Geography & Ecology",
        subject: "Environment & Ecology",
        difficulty: "Hard",
        question: "Consider the following statements regarding 'Biochar' and its ecological applications:\n\n1. Biochar can increase soil cation exchange capacity (CEC), improving nutrient retention.\n2. It can be used as a soil amendment to enhance soil microbial activity and water holding capacity.\n3. Being rich in aromatic carbon, it resists degradation and acts as a long-term carbon sink.\n\nHow many of the statements given above are correct?",
        options: [
          "Only one",
          "Only two",
          "All three",
          "None"
        ],
        correct: 2, // "All three"
        explanation: {
          coreConcept: "Pyrolysis, Soil Microbiology & Carbon Sequestration",
          breakdown: "• Statement 1 is CORRECT: High surface area and functional groups increase CEC, preventing nutrient leaching.\n• Statement 2 is CORRECT: Highly porous structure provides habitat for beneficial mycorrhizae and retains moisture.\n• Statement 3 is CORRECT: Pyrolysis locks carbon into stable polycyclic aromatic sheets that remain in soil for centuries.",
          mnemonic: "Biochar = Porous, High CEC, Carbon Sponge.",
          reference: "Shankar IAS Environment - Climate Change Mitigation."
        }
      },
      {
        id: "upsc_5",
        section: "Polity & Governance",
        subject: "Indian Polity",
        difficulty: "Medium",
        question: "Which of the following bodies in India submit their annual reports to the President of India, who then causes them to be laid before both Houses of Parliament?\n\n1. Comptroller and Auditor General of India (CAG)\n2. Union Public Service Commission (UPSC)\n3. National Commission for Scheduled Castes (NCSC)\n4. Reserve Bank of India (RBI)\n\nSelect the correct answer using the code given below:",
        options: [
          "1, 2 and 3 only",
          "2 and 3 only",
          "1 and 4 only",
          "1, 2, 3 and 4"
        ],
        correct: 0, // "1, 2 and 3 only"
        explanation: {
          coreConcept: "Constitutional Reports to Parliament via President",
          breakdown: "• 1 (CAG): Under Article 151, CAG submits reports to the President who causes them to be laid before Parliament.\n• 2 (UPSC): Under Article 323, UPSC submits annual report to the President.\n• 3 (NCSC): Under Article 338, NCSC submits report to the President.\n• 4 (RBI): RBI submits its annual report directly to the Central Government (Ministry of Finance), not to the President.",
          mnemonic: "President receives reports from Constitutional bodies (CAG, UPSC, NCSC, Finance Commission).",
          reference: "Indian Constitution - Articles 151, 323, 338."
        }
      },
      {
        id: "upsc_6",
        section: "Geography & Ecology",
        subject: "Physical Geography",
        difficulty: "Medium",
        question: "Consider the following pairs of Rivers and their direct tributaries:\n\n1. Godavari : Manjira\n2. Krishna : Tungabhadra\n3. Cauvery : Kabini\n4. Narmada : Musi\n\nWhich of the pairs given above are correctly matched?",
        options: [
          "1, 2 and 3 only",
          "2 and 3 only",
          "1 and 4 only",
          "1, 2, 3 and 4"
        ],
        correct: 0, // "1, 2 and 3 only"
        explanation: {
          coreConcept: "Peninsular Drainage System of India",
          breakdown: "• Pair 1 is CORRECT: Manjira is a major right-bank tributary of Godavari.\n• Pair 2 is CORRECT: Tungabhadra is the largest tributary of Krishna River.\n• Pair 3 is CORRECT: Kabini, along with Bhavani, Hemavati, Amravati, are major tributaries of Cauvery.\n• Pair 4 is INCORRECT: Musi is a tributary of Krishna River (Hyderabad sits on Musi), not Narmada.",
          mnemonic: "Musi river = Hyderabad = Krishna basin.",
          reference: "NCERT Class XI - India: Physical Environment."
        }
      },
      {
        id: "upsc_7",
        section: "Economy & Development",
        subject: "Economics",
        difficulty: "Hard",
        question: "Which of the following best describes the term 'Core Inflation' in macroeconomics?",
        options: [
          "Inflation rate calculated on primary consumer capital goods only",
          "Headline inflation excluding volatile components like food and fuel",
          "Inflation adjusted for fluctuations in foreign exchange rates",
          "The percentage increase in wholesale price index (WPI) over a financial quarter"
        ],
        correct: 1,
        explanation: {
          coreConcept: "Headline vs. Core Inflation",
          breakdown: "• Headline Inflation measures the total inflation within an economy, including commodities such as food and energy prices, which tend to be much more volatile.\n• Core Inflation explicitly strips out Food and Fuel/Energy from Headline CPI to measure the underlying, sticky, long-term inflation trend.",
          mnemonic: "Core = Stripped of volatile food & oil peaks.",
          reference: "NCERT Macroeconomics Class XII."
        }
      },
      {
        id: "upsc_8",
        section: "Polity & Governance",
        subject: "Indian Polity",
        difficulty: "Hard",
        question: "Consider the following statements regarding the 'Pardoning Powers of the President and Governor' under the Indian Constitution:\n\n1. The President can grant pardon in cases of punishment or sentence by a Court Martial, while the Governor cannot.\n2. The President can pardon a death sentence, but the Governor cannot pardon a death sentence under any circumstances.\n3. Both President and Governor possess concurrent power in suspension, remission, and commutation of death sentences.\n\nWhich of the statements given above are correct?",
        options: [
          "1 and 2 only",
          "1 and 3 only",
          "2 and 3 only",
          "1, 2 and 3"
        ],
        correct: 3, // All three are correct as per standard interpretation (Governor cannot pardon death completely, but can suspend/remit/commute)
        explanation: {
          coreConcept: "Article 72 (President) vs Article 161 (Governor)",
          breakdown: "• Statement 1 is CORRECT: President alone has military court martial pardon power.\n• Statement 2 is CORRECT: The Governor cannot pardon a death sentence (only the President can grant full pardon to death convicts).\n• Statement 3 is CORRECT: Both the President and Governor have concurrent powers to suspend, remit, or commute a sentence of death.",
          mnemonic: "Governor cannot PARDON death, but CAN commute/remit death.",
          reference: "M. Laxmikanth - Chapter on President & Governor."
        }
      },
      {
        id: "upsc_9",
        section: "History & Culture",
        subject: "Ancient & Medieval History",
        difficulty: "Medium",
        question: "With reference to the cultural history of India, the term 'Panchayatan' refers to:",
        options: [
          "An assembly of village elders in the Chola administration",
          "A style of temple construction where four subsidiary shrines surround the main temple",
          "A system of five municipal committees mentioned in Megasthenes' Indica",
          "A tantric religious sect active in eastern India during Pala rule"
        ],
        correct: 1,
        explanation: {
          coreConcept: "Temple Architecture of Ancient India (Nagara / Dravida)",
          breakdown: "• Panchayatan is a style of temple architecture where the primary temple is built on a raised platform, surrounded by four smaller subsidiary shrines at the four corners (e.g., Dashavatara temple at Deogarh, Kandariya Mahadeva at Khajuraho, Lakshmana Temple).",
          mnemonic: "Panch = 5 (1 Main Sanctum + 4 Corner Shrines).",
          reference: "NCERT Class XI - An Introduction to Indian Art."
        }
      },
      {
        id: "upsc_10",
        section: "Geography & Ecology",
        subject: "Science & Tech",
        difficulty: "Hard",
        question: "Consider the following statements regarding 'CRISPR-Cas9' gene editing technology:\n\n1. Cas9 is an RNA-guided endonuclease enzyme that cuts targeted DNA strands.\n2. Guide RNA (gRNA) is synthesized to match the specific genomic sequence to be edited.\n3. CRISPR was originally discovered as an adaptive immune defense system in bacteria against viral phages.\n\nWhich of the statements given above are correct?",
        options: [
          "1 and 2 only",
          "2 and 3 only",
          "1 and 3 only",
          "1, 2 and 3"
        ],
        correct: 3,
        explanation: {
          coreConcept: "Biotechnology & Genome Editing",
          breakdown: "• Statement 1 is CORRECT: Cas9 functions as molecular scissors guided by RNA.\n• Statement 2 is CORRECT: Synthetic guide RNA directs the Cas9 enzyme to the precise target sequence.\n• Statement 3 is CORRECT: Bacteria incorporate spacer DNA from attacking bacteriophages to recognize and destroy future infections.",
          mnemonic: "CRISPR = Molecular Scissors (Cas9) + GPS Tracker (gRNA).",
          reference: "Nobel Prize in Chemistry 2020 (Emmanuelle Charpentier & Jennifer Doudna)."
        }
      }
    ]
  },

  ssc_cgl: {
    id: "ssc_cgl",
    title: "SSC CGL Tier-1 Super Drill (Quant, Reasoning, GA, English)",
    category: "SSC CGL",
    badge: "High Speed",
    duration: 30, // minutes
    totalQuestions: 10,
    marksPerQuestion: 2,
    negativeMark: 0.50,
    difficulty: "Moderate & Fast",
    description: "High-speed competitive drill focused on Quantitative Aptitude tricks, Logical Reasoning, General Awareness, and English vocabulary.",
    sections: ["All", "Quantitative Aptitude", "General Intelligence & Reasoning", "General Awareness", "English Comprehension"],
    questions: [
      {
        id: "ssc_1",
        section: "Quantitative Aptitude",
        subject: "Mathematics",
        difficulty: "Medium",
        question: "A train running at 72 km/h crosses an electric pole in 18 seconds and a platform in 33 seconds. What is the length of the platform?",
        options: [
          "250 metres",
          "300 metres",
          "360 metres",
          "400 metres"
        ],
        correct: 1, // 300 metres
        explanation: {
          coreConcept: "Time, Speed & Distance",
          breakdown: "• Speed = 72 km/h = 72 * (5/18) = 20 m/s.\n• Length of Train (Lt) = Speed * Time to cross pole = 20 * 18 = 360 m.\n• Total length (Lt + Lp) to cross platform = 20 * 33 = 660 m.\n• Length of Platform (Lp) = 660 - 360 = 300 metres.\n• Alternative Fast Trick: The train takes (33 - 18) = 15 seconds to cover the platform. 15 s * 20 m/s = 300 m directly!",
          mnemonic: "Delta Time * Speed = Platform Length! (33 - 18) * 20 = 300m.",
          reference: "R.S. Aggarwal Quantitative Aptitude - Trains."
        }
      },
      {
        id: "ssc_2",
        section: "Quantitative Aptitude",
        subject: "Mathematics",
        difficulty: "Hard",
        question: "If x + (1/x) = 3, then what is the value of x^5 + (1/x^5)?",
        options: [
          "123",
          "126",
          "118",
          "132"
        ],
        correct: 0, // 123
        explanation: {
          coreConcept: "Algebraic Identities & Powers",
          breakdown: "• Formula: (x^5 + 1/x^5) = (x^2 + 1/x^2)(x^3 + 1/x^3) - (x + 1/x)\n• Given x + 1/x = 3:\n  - x^2 + 1/x^2 = 3^2 - 2 = 7\n  - x^3 + 1/x^3 = 3^3 - 3(3) = 27 - 9 = 18\n• Therefore, x^5 + 1/x^5 = (7 * 18) - 3 = 126 - 3 = 123.",
          mnemonic: "Power 5 = Square * Cube - Linear! (7 * 18) - 3 = 123.",
          reference: "SSC Advance Maths - Polynomial Identities."
        }
      },
      {
        id: "ssc_3",
        section: "General Intelligence & Reasoning",
        subject: "Reasoning",
        difficulty: "Medium",
        question: "Select the option that is related to the third term in the same way as the second term is related to the first term:\n\nARCHITECT : BLUEPRINT :: SCULPTOR : ?",
        options: [
          "CHISEL",
          "STATUE",
          "CLAY",
          "MUSEUM"
        ],
        correct: 1, // STATUE
        explanation: {
          coreConcept: "Analogy: Creator and Final Product",
          breakdown: "• An Architect creates a Blueprint as their primary creative work/output, and a Sculptor creates a Statue as their finished artistic output.\n• (Chisel and clay are tools/materials, not the created outcome).",
          mnemonic: "Worker : Finished Masterpiece.",
          reference: "Verbal Reasoning - Analytical Analogies."
        }
      },
      {
        id: "ssc_4",
        section: "General Intelligence & Reasoning",
        subject: "Reasoning",
        difficulty: "Medium",
        question: "Statements:\n1. All metals are conductors.\n2. Some conductors are liquids.\n\nConclusions:\nI. Some metals are liquids.\nII. Some conductors are metals.\n\nChoose the correct option:",
        options: [
          "Only Conclusion I follows",
          "Only Conclusion II follows",
          "Both I and II follow",
          "Neither I nor II follows"
        ],
        correct: 1, // Only II follows
        explanation: {
          coreConcept: "Syllogism (A-type and I-type propositions)",
          breakdown: "• Statement 1: All Metals (M) are Conductors (C). This implies Some Conductors are Metals (Immediate converse of Universal Affirmative). Therefore, Conclusion II is definitely TRUE.\n• Statement 2: Some C are Liquids. But we cannot establish any direct intersection between M and Liquids without affirmative link. Conclusion I does not necessarily follow.",
          mnemonic: "'All A are B' always converts to 'Some B are A'.",
          reference: "Logical Deductions & Syllogisms."
        }
      },
      {
        id: "ssc_5",
        section: "General Awareness",
        subject: "Polity & Constitution",
        difficulty: "Easy",
        question: "Which Constitutional Amendment Act reduced the voting age in India from 21 years to 18 years?",
        options: [
          "42nd Amendment Act, 1976",
          "44th Amendment Act, 1978",
          "61st Amendment Act, 1988",
          "73rd Amendment Act, 1992"
        ],
        correct: 2, // 61st
        explanation: {
          coreConcept: "Article 326 - Adult Suffrage",
          breakdown: "• The 61st Constitutional Amendment Act, 1988 (which came into force in 1989 under Rajiv Gandhi government) amended Article 326 to lower the voting age for Lok Sabha and Legislative Assemblies from 21 to 18 years.",
          mnemonic: "61st = 6 - 1 = 5, or 21 down to 18 in 1989.",
          reference: "Lucent General Knowledge - Indian Polity."
        }
      },
      {
        id: "ssc_6",
        section: "General Awareness",
        subject: "General Science",
        difficulty: "Medium",
        question: "Which chemical compound is responsible for the characteristic pungent smell of rotten eggs in sewage and hot springs?",
        options: [
          "Sulfur Dioxide (SO2)",
          "Hydrogen Sulfide (H2S)",
          "Methane (CH4)",
          "Carbon Monoxide (CO)"
        ],
        correct: 1, // H2S
        explanation: {
          coreConcept: "Chemistry in Everyday Life",
          breakdown: "• Hydrogen sulfide (H2S) is a colorless chalcogen-hydride gas with the characteristic foul odor of rotten eggs. It is produced by microbial breakdown of organic matter in the absence of oxygen.",
          mnemonic: "H2S = Heavy Smell (Rotten Eggs).",
          reference: "NCERT Class X Chemistry."
        }
      },
      {
        id: "ssc_7",
        section: "English Comprehension",
        subject: "English Language",
        difficulty: "Medium",
        question: "Choose the word most nearly OPPOSITE in meaning (Antonym) to the underlined word:\n\nThe minister made a 'lucid' presentation on the national budget to the parliament.",
        options: [
          "Ambiguous",
          "Transparent",
          "Eloquent",
          "Articulate"
        ],
        correct: 0, // Ambiguous
        explanation: {
          coreConcept: "Vocabulary & Antonyms",
          breakdown: "• 'Lucid' means expressed clearly, easy to understand, transparent, or intelligible.\n• 'Ambiguous' means open to more than one interpretation, vague, obscure, or unclear.\n• Transparent, Eloquent, and Articulate are synonyms or positive attributes.",
          mnemonic: "Lucid = Light & Clear. Ambiguous = Foggy & Vague.",
          reference: "Word Power Made Easy by Norman Lewis."
        }
      },
      {
        id: "ssc_8",
        section: "Quantitative Aptitude",
        subject: "Mathematics",
        difficulty: "Medium",
        question: "A shopkeeper marks his goods 40% above the cost price and allows a discount of 25% on the marked price. What is his net gain or loss percent?",
        options: [
          "5% Gain",
          "5% Loss",
          "10% Gain",
          "15% Gain"
        ],
        correct: 0, // 5% Gain
        explanation: {
          coreConcept: "Profit, Loss & Successive Percentage",
          breakdown: "• Let Cost Price (CP) = 100.\n• Marked Price (MP) = 100 + 40 = 140.\n• Selling Price (SP) after 25% discount = 140 * (75/100) = 140 * 0.75 = 105.\n• Net Profit = SP - CP = 105 - 100 = 5% Gain.\n• Or using formula: a + b + (ab/100) = 40 - 25 - (40*25/100) = 15 - 10 = +5% Gain.",
          mnemonic: "Net % = +40 - 25 - 10 = +5%.",
          reference: "R.S. Aggarwal - Profit and Loss."
        }
      }
    ]
  },

  banking_ibps: {
    id: "banking_ibps",
    title: "IBPS / SBI PO Prelims Speed & Accuracy Drill",
    category: "Banking (IBPS/SBI)",
    badge: "Speed Test",
    duration: 20, // minutes
    totalQuestions: 8,
    marksPerQuestion: 1,
    negativeMark: 0.25,
    difficulty: "High Calculation Speed",
    description: "Focus on Data Interpretation, Syllogisms, Quadratic Equations, Banking Awareness, and Reading Comprehension.",
    sections: ["All", "Quantitative Aptitude", "Reasoning Ability", "Banking Awareness"],
    questions: [
      {
        id: "bank_1",
        section: "Quantitative Aptitude",
        subject: "Quadratic Equations",
        difficulty: "Medium",
        question: "Solve the two equations and establish the relationship between x and y:\n\nEquation I: x^2 - 11x + 30 = 0\nEquation II: y^2 - 15y + 56 = 0",
        options: [
          "x > y",
          "x < y",
          "x >= y",
          "Relationship cannot be established (or x = y)"
        ],
        correct: 1, // x < y
        explanation: {
          coreConcept: "Quadratic Roots Comparison",
          breakdown: "• Equation I: x^2 - 11x + 30 = 0. Factors of 30 that add to 11 are 5 and 6. Roots: x = +5, +6.\n• Equation II: y^2 - 15y + 56 = 0. Factors of 56 that add to 15 are 7 and 8. Roots: y = +7, +8.\n• Comparison: 5 < 7, 5 < 8, 6 < 7, 6 < 8.\n• Hence, x is strictly less than y (x < y).",
          mnemonic: "Roots: x=(5,6), y=(7,8). Clear inequality: x < y.",
          reference: "Bank PO Quantitative Aptitude."
        }
      },
      {
        id: "bank_2",
        section: "Banking Awareness",
        subject: "Banking & Finance",
        difficulty: "Medium",
        question: "What is the full form of 'PCA' framework implemented by the Reserve Bank of India to restore the health of financially distressed banks?",
        options: [
          "Primary Credit Allocation",
          "Prompt Corrective Action",
          "Prudential Capital Assessment",
          "Public Credit Accounting"
        ],
        correct: 1, // Prompt Corrective Action
        explanation: {
          coreConcept: "RBI Regulatory Frameworks",
          breakdown: "• Prompt Corrective Action (PCA) is a framework under which banks with weak financial metrics (Capital Adequacy Ratio, Net NPA, and Return on Assets) are put under watchful monitoring and operational curbs by RBI until their balance sheets recover.",
          mnemonic: "PCA = Prompt Corrective Action.",
          reference: "RBI Monetary & Banking Guidelines."
        }
      },
      {
        id: "bank_3",
        section: "Reasoning Ability",
        subject: "Coding-Decoding",
        difficulty: "Hard",
        question: "In a certain code language:\n'bank reserve economy growth' is coded as 'kx mt zg pq'\n'economy reform fiscal deficit' is coded as 'zg tr ws vn'\n'growth deficit record high' is coded as 'pq ws ab cd'\n\nWhat is the code for 'economy'?",
        options: [
          "pq",
          "zg",
          "mt",
          "ws"
        ],
        correct: 1, // zg
        explanation: {
          coreConcept: "Common Word Elimination Method",
          breakdown: "• Comparing sentence 1 ('bank reserve economy growth') and sentence 2 ('economy reform fiscal deficit'):\n  - The only common word is 'economy'.\n  - The only common code between 'kx mt zg pq' and 'zg tr ws vn' is 'zg'.\n• Hence, 'economy' = 'zg'.",
          mnemonic: "Sentence 1 ∩ Sentence 2 = {economy} = {zg}.",
          reference: "Analytical Reasoning by M.K. Pandey."
        }
      },
      {
        id: "bank_4",
        section: "Quantitative Aptitude",
        subject: "Data Interpretation",
        difficulty: "Medium",
        question: "A sum of ₹12,000 is invested at 10% compound interest per annum, compounded annually for 2 years. What is the total compound interest earned?",
        options: [
          "₹2,400",
          "₹2,520",
          "₹2,640",
          "₹2,720"
        ],
        correct: 1, // ₹2,520
        explanation: {
          coreConcept: "Compound Interest Successive Rate",
          breakdown: "• Effective CI rate for 2 years at 10% = 10 + 10 + (10*10/100) = 21%.\n• Compound Interest = 21% of 12,000 = (21/100) * 12,000 = 21 * 120 = ₹2,520.\n• (Direct check: Year 1 = ₹1,200. Year 2 = ₹1,200 + 10% of 1,200 = ₹1,320. Total = 1,200 + 1,320 = 2,520).",
          mnemonic: "10% for 2 yrs CI is always 21%. 21 * 120 = 2,520.",
          reference: "Arithmetic Shortcut Techniques."
        }
      }
    ]
  },

  rrb_ntpc: {
    id: "rrb_ntpc",
    title: "RRB NTPC & Railway Recruitment Mega Mock",
    category: "Railways (RRB)",
    badge: "Official Pattern",
    duration: 40,
    totalQuestions: 8,
    marksPerQuestion: 1,
    negativeMark: 0.33,
    difficulty: "Balanced",
    description: "General Awareness, General Science, Indian Railways history, and basic arithmetic for Non-Technical Popular Categories.",
    sections: ["All", "General Awareness", "General Science", "Mathematics"],
    questions: [
      {
        id: "rrb_1",
        section: "General Awareness",
        subject: "Indian Railways",
        difficulty: "Easy",
        question: "In which year was the first passenger railway train run in India between Bori Bunder (Bombay) and Thane?",
        options: [
          "1850",
          "1853",
          "1857",
          "1862"
        ],
        correct: 1, // 1853
        explanation: {
          coreConcept: "History of Indian Railways",
          breakdown: "• The first passenger train in India ran on 16 April 1853 between Bori Bunder (now Chhatrapati Shivaji Maharaj Terminus) and Thane, covering a distance of 34 kilometers with 400 passengers in 14 carriages, hauled by three steam locomotives named Sahib, Sindh, and Sultan.",
          mnemonic: "16 April 1853: Lord Dalhousie era.",
          reference: "Indian Railways Heritage Records."
        }
      },
      {
        id: "rrb_2",
        section: "General Science",
        subject: "Physics",
        difficulty: "Medium",
        question: "What is the SI unit of electric potential difference and electromotive force?",
        options: [
          "Ampere",
          "Volt",
          "Ohm",
          "Joule"
        ],
        correct: 1, // Volt
        explanation: {
          coreConcept: "Units and Measurements",
          breakdown: "• The SI unit of electric potential difference and EMF is Volt (V), defined as 1 Joule of work done per 1 Coulomb of charge (1 V = 1 J/C).\n• Ampere = Electric Current\n• Ohm = Electrical Resistance\n• Joule = Work and Energy.",
          mnemonic: "Voltage pushes current like pressure!",
          reference: "NCERT Class X Physics - Electricity."
        }
      },
      {
        id: "rrb_3",
        section: "General Science",
        subject: "Biology",
        difficulty: "Easy",
        question: "Which organelle is universally known as the 'Powerhouse of the Cell'?",
        options: [
          "Ribosome",
          "Mitochondria",
          "Golgi Apparatus",
          "Lysosome"
        ],
        correct: 1, // Mitochondria
        explanation: {
          coreConcept: "Cell Biology & Cellular Respiration",
          breakdown: "• Mitochondria are called the powerhouse of the cell because they produce energy currency in the form of ATP (Adenosine Triphosphate) molecules through aerobic cellular respiration.",
          mnemonic: "Mighty Mitochondria makes ATP!",
          reference: "NCERT Class IX Biology."
        }
      },
      {
        id: "rrb_4",
        section: "General Awareness",
        subject: "Geography",
        difficulty: "Medium",
        question: "Which Indian state has the longest coastline in mainland India?",
        options: [
          "Tamil Nadu",
          "Maharashtra",
          "Gujarat",
          "Andhra Pradesh"
        ],
        correct: 2, // Gujarat
        explanation: {
          coreConcept: "Indian Coastlines",
          breakdown: "• Gujarat has the longest coastline among all Indian states, spanning approximately 1,600 km, due to the indentations of the Gulf of Kutch and Gulf of Khambhat.\n• Andhra Pradesh has the second-longest coastline (~974 km).",
          mnemonic: "G for Gujarat = Greatest coastline.",
          reference: "Survey of India & Ministry of Earth Sciences."
        }
      }
    ]
  }
};

// Expose on window for browser scripts
if (typeof window !== "undefined") {
  window.EXAM_BANKS = EXAM_BANKS;
}
