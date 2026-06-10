// ============================================================
// GST LITIGATION PRO — KNOWLEDGE DATABASE (gst-data.js)
// Built-in GST provisions, case laws, templates, circulars
// ============================================================

const GST_DATA = {
  "sections": [
    {
      "id": "s7",
      "num": "Section 7",
      "act": "CGST",
      "chapter": "III",
      "title": "Scope of Supply",
      "category": "levy",
      "summary": "Defines what constitutes taxable supply — all forms of supply of goods/services/money for consideration in course of business.",
      "key_points": [
        "Includes import of services even without consideration",
        "Schedule I activities are supply even without consideration",
        "Schedule III activities are neither goods nor services"
      ],
      "tags": [
        "supply",
        "levy",
        "scope"
      ]
    },
    {
      "id": "s9",
      "num": "Section 9",
      "act": "CGST",
      "chapter": "III",
      "title": "Levy and Collection of CGST",
      "category": "levy",
      "summary": "Levies Central GST on intra-state supplies. Rate not to exceed 20% as recommended by GST Council. Also covers reverse charge.",
      "key_points": [
        "CGST on all intra-state supplies",
        "Max rate: 20%",
        "Reverse charge for notified categories",
        "E-commerce operators liable for tax on notified supplies"
      ],
      "tags": [
        "levy",
        "RCM",
        "rate"
      ]
    },
    {
      "id": "s12",
      "num": "Section 12",
      "act": "CGST",
      "chapter": "IV",
      "title": "Time of Supply of Goods",
      "category": "valuation",
      "summary": "Determines when tax liability on goods arises — earliest of invoice date, payment date, or delivery.",
      "key_points": [
        "For forward charge: earlier of invoice date or advance receipt",
        "For RCM: earlier of payment date or 60th day from invoice",
        "For vouchers: date of supply or redemption"
      ],
      "tags": [
        "time of supply",
        "goods"
      ]
    },
    {
      "id": "s13",
      "num": "Section 13",
      "act": "CGST",
      "chapter": "IV",
      "title": "Time of Supply of Services",
      "category": "valuation",
      "summary": "Determines when tax liability on services arises. Invoice must be issued within 30 days of service completion.",
      "key_points": [
        "If invoice within 30 days: date of invoice",
        "Else: date of service completion",
        "RCM: earlier of payment date or 60th day from invoice"
      ],
      "tags": [
        "time of supply",
        "services"
      ]
    },
    {
      "id": "s15",
      "num": "Section 15",
      "act": "CGST",
      "chapter": "IV",
      "title": "Value of Taxable Supply",
      "category": "valuation",
      "summary": "Transaction value is the taxable value, subject to inclusions/exclusions. Related party transactions may be revalued.",
      "key_points": [
        "Transaction value = price paid/payable",
        "Includes: freight, packing, loading, subsidies linked to supply",
        "Excludes: post-supply discounts, GST itself",
        "Related parties: AO may determine value by rules"
      ],
      "tags": [
        "value",
        "valuation",
        "transaction value"
      ]
    },
    {
      "id": "s16",
      "num": "Section 16",
      "act": "CGST",
      "chapter": "V",
      "title": "Eligibility and Conditions for ITC",
      "category": "ITC",
      "summary": "Lays down 4 mandatory conditions for claiming Input Tax Credit. All must be simultaneously satisfied.",
      "key_points": [
        "Must possess tax invoice/debit note",
        "Goods/services must be received",
        "Tax must be paid by supplier to government",
        "Return must be filed under Sec 39",
        "Time limit: earlier of annual return date or Nov 30",
        "180-day rule: pay supplier within 180 days or reverse ITC",
        "Sec 16(4): time limit for ITC claim",
        "Sec 16(5): ITC for FY 2017-20 (Budget 2024 relief)"
      ],
      "tags": [
        "ITC",
        "input tax credit",
        "eligibility"
      ]
    },
    {
      "id": "s17",
      "num": "Section 17",
      "act": "CGST",
      "chapter": "V",
      "title": "Apportionment of Credit and Blocked Credits",
      "category": "ITC",
      "summary": "Restricts ITC where goods/services used partly for exempt or non-business purpose. Section 17(5) lists absolute blocked credits.",
      "key_points": [
        "17(1): Restrict ITC to business use proportion",
        "17(2): Restrict ITC to taxable supply proportion",
        "17(5): BLOCKED CREDITS — motor vehicles (personal), food, beauty, club, health insurance, construction of immovable property, CSR, personal consumption, free samples"
      ],
      "tags": [
        "ITC",
        "blocked credits",
        "section 17(5)"
      ]
    },
    {
      "id": "s18",
      "num": "Section 18",
      "act": "CGST",
      "chapter": "V",
      "title": "ITC in Special Circumstances",
      "category": "ITC",
      "summary": "Allows ITC on transitional stock when registration status changes (new registration, composition to regular, exempt to taxable).",
      "key_points": [
        "New registration: ITC on stock held on preceding day",
        "Composition to Regular: ITC on stock + reduced capital goods",
        "Exempt to Taxable: ITC on stock on preceding day",
        "Time limit: 30 days (extendable by Commissioner)"
      ],
      "tags": [
        "ITC",
        "special circumstances",
        "transitional"
      ]
    },
    {
      "id": "s22",
      "num": "Section 22",
      "act": "CGST",
      "chapter": "VI",
      "title": "Persons Liable for Registration",
      "category": "registration",
      "summary": "Every supplier with aggregate turnover exceeding threshold in financial year must register.",
      "key_points": [
        "Threshold: ₹40L for goods, ₹20L for services/special states",
        "Threshold: ₹10L for NE/hilly states",
        "Aggregate turnover across all GSTINs on single PAN"
      ],
      "tags": [
        "registration",
        "threshold",
        "turnover"
      ]
    },
    {
      "id": "s24",
      "num": "Section 24",
      "act": "CGST",
      "chapter": "VI",
      "title": "Compulsory Registration",
      "category": "registration",
      "summary": "Certain persons must register regardless of turnover threshold.",
      "key_points": [
        "Inter-state taxable suppliers",
        "Casual taxable persons",
        "RCM recipients",
        "Non-resident taxable persons",
        "E-commerce operators",
        "TDS deductors (Sec 51)",
        "TCS collectors (Sec 52)"
      ],
      "tags": [
        "compulsory registration",
        "interstate"
      ]
    },
    {
      "id": "s29",
      "num": "Section 29",
      "act": "CGST",
      "chapter": "VI",
      "title": "Cancellation of Registration",
      "category": "registration",
      "summary": "Allows voluntary and suo motu cancellation. Proper officer must follow procedure and issue SCN before cancellation.",
      "key_points": [
        "Voluntary: supplier can apply if turnover below threshold",
        "Suo motu: officer can cancel if returns not filed for 6 months",
        "SCN mandatory before cancellation",
        "Retrospective cancellation: courts have struck down cancellation without SCN"
      ],
      "tags": [
        "registration",
        "cancellation",
        "GST cancellation"
      ]
    },
    {
      "id": "s54",
      "num": "Section 54",
      "act": "CGST",
      "chapter": "XI",
      "title": "Refund of Tax",
      "category": "refund",
      "summary": "Primary provision for claiming GST refunds. Covers zero-rated supplies, excess tax paid, ITC accumulation due to inverted duty.",
      "key_points": [
        "Application within 2 years of relevant date",
        "Processing within 60 days of complete application",
        "90% provisional refund for zero-rated supplies within 7 days",
        "Unjust enrichment: refund to Consumer Welfare Fund if tax passed on",
        "Inverted duty: refund of ITC where input rate > output rate"
      ],
      "tags": [
        "refund",
        "zero-rated",
        "export",
        "ITC accumulation"
      ]
    },
    {
      "id": "s56",
      "num": "Section 56",
      "act": "CGST",
      "chapter": "XI",
      "title": "Interest on Delayed Refunds",
      "category": "refund",
      "summary": "Mandatory interest if refund not processed within 60 days of application.",
      "key_points": [
        "6% p.a. — standard delayed refund (from 61st day)",
        "9% p.a. — court/appellate authority ordered refund (if delayed beyond 60 days)",
        "Interest is mandatory, not discretionary"
      ],
      "tags": [
        "interest",
        "refund delay"
      ]
    },
    {
      "id": "s67",
      "num": "Section 67",
      "act": "CGST",
      "chapter": "XIV",
      "title": "Power of Inspection, Search and Seizure",
      "category": "enforcement",
      "summary": "Empowers officers to inspect business premises, vehicles, seize goods and documents.",
      "key_points": [
        "Joint Commissioner or above can authorize inspection",
        "No prior notice required",
        "Seizure if goods liable to confiscation",
        "Seal premises if officer reasonably suspects evasion",
        "Cannot use inspection findings alone for Sec 130 confiscation (Allahabad HC 2024)"
      ],
      "tags": [
        "inspection",
        "search",
        "seizure",
        "enforcement"
      ]
    },
    {
      "id": "s73",
      "num": "Section 73",
      "act": "CGST",
      "chapter": "XV",
      "title": "Determination of Tax — No Fraud",
      "category": "demand",
      "summary": "Covers demand of tax in cases of short-payment, non-payment, wrong ITC — where there is NO fraud, wilful misstatement, or suppression.",
      "key_points": [
        "SCN within 42 months from annual return due date",
        "Order within 12 months from SCN date (3 months for SCN by officer below Commissioner)",
        "Penalty: 10% of tax or ₹10,000 (higher)",
        "No penalty if tax + interest paid before SCN",
        "25% penalty if paid within 30 days of SCN",
        "Self-correction: audit findings self-corrected before SCN â†’ no SCN if tax + interest paid"
      ],
      "tags": [
        "demand",
        "SCN",
        "no fraud",
        "section 73"
      ]
    },
    {
      "id": "s74",
      "num": "Section 74",
      "act": "CGST",
      "chapter": "XV",
      "title": "Determination of Tax — Fraud Cases",
      "category": "demand",
      "summary": "Covers demand in cases involving fraud, wilful misstatement or suppression of facts with intent to evade tax.",
      "key_points": [
        "SCN within 5 years from annual return due date",
        "Order within 3 years from SCN date",
        "Penalty: 100% of tax",
        "Burden of proof: on tax officer to prove fraud",
        "Cannot presume fraud from mere error or calculation difference",
        "Courts: Sec 74 not invokable without specific fraud evidence"
      ],
      "tags": [
        "demand",
        "fraud",
        "section 74",
        "wilful misstatement"
      ]
    },
    {
      "id": "s75",
      "num": "Section 75",
      "act": "CGST",
      "chapter": "XV",
      "title": "General Provisions for Demand Determination",
      "category": "demand",
      "summary": "Procedural safeguards for all demand proceedings under Sec 73/74. Ensures fairness and natural justice.",
      "key_points": [
        "Maximum 3 adjournments during hearing",
        "Order demand cannot exceed SCN demand amount",
        "Order cannot be on grounds not in SCN",
        "If Sec 74 not proved â†’ convert to Sec 73",
        "Periods of court stay excluded from limitation",
        "Opportunity of hearing mandatory if adverse order contemplated (Sec 75(4))"
      ],
      "tags": [
        "procedure",
        "natural justice",
        "hearing",
        "limitation"
      ]
    },
    {
      "id": "s76",
      "num": "Section 76",
      "act": "CGST",
      "chapter": "XV",
      "title": "Tax Collected but Not Paid",
      "category": "demand",
      "summary": "Any amount collected as tax must be paid to government regardless of taxability of supply.",
      "key_points": [
        "No limitation period for initiation of action",
        "Once SCN issued: order within 1 year",
        "Penalty: 100% of amount or ₹10,000",
        "Specific form: FORM GST DRC-07"
      ],
      "tags": [
        "collected tax",
        "not paid",
        "section 76"
      ]
    },
    {
      "id": "s79",
      "num": "Section 79",
      "act": "CGST",
      "chapter": "XV",
      "title": "Recovery of Tax",
      "category": "recovery",
      "summary": "Provides multiple modes for recovery of outstanding tax demand after 3 months from order.",
      "key_points": [
        "Modes: attachment and sale of property, garnishee notices on debtors, bank attachment",
        "Tax Recovery Officer can act like a civil court decree",
        "E-way bill system: blocking or suspension for defaulters",
        "Recovery from directors in case of company default"
      ],
      "tags": [
        "recovery",
        "attachment",
        "garnishee",
        "bank"
      ]
    },
    {
      "id": "s107",
      "num": "Section 107",
      "act": "CGST",
      "chapter": "XVIII",
      "title": "Appeals to Appellate Authority",
      "category": "appeal",
      "summary": "Right of appeal against adjudicating authority orders. Both taxpayer and department can appeal.",
      "key_points": [
        "Taxpayer: 3 months from order communication",
        "Department: 6 months from order",
        "Condonation: up to 1 month additional for sufficient cause",
        "Pre-deposit: 10% of disputed tax (max ₹20 Cr CGST+SGST+IGST each)",
        "AA can confirm, modify, or annul — CANNOT remand",
        "Decision within 1 year (ideally)"
      ],
      "tags": [
        "appeal",
        "appellate authority",
        "section 107"
      ]
    },
    {
      "id": "s108",
      "num": "Section 108",
      "act": "CGST",
      "chapter": "XVIII",
      "title": "Powers of Revisional Authority",
      "category": "appeal",
      "summary": "Commissioner can revise any order passed by subordinate officers. Quasi-judicial power requiring fair hearing.",
      "key_points": [
        "Can act suo motu or on information",
        "Can stay, enhance, modify, or annul order",
        "Cannot revise if: matter under appeal; dept appeal time not lapsed; 3 years elapsed; already revised",
        "Must give opportunity of hearing",
        "Revisional order final subject to further appeal"
      ],
      "tags": [
        "revision",
        "revisional authority",
        "commissioner"
      ]
    },
    {
      "id": "s112",
      "num": "Section 112",
      "act": "CGST",
      "chapter": "XVIII",
      "title": "Appeals to Appellate Tribunal (GSTAT)",
      "category": "appeal",
      "summary": "Second appellate forum on facts and law. Requires additional 20% pre-deposit of disputed tax.",
      "key_points": [
        "Pre-deposit: 20% of remaining disputed tax (max ₹50 Cr CGST+SGST shared)",
        "Time limit: 3 months from Appellate Authority order",
        "Covers both facts and law (unlike HC — law only)",
        "Currently being constituted in states"
      ],
      "tags": [
        "tribunal",
        "GSTAT",
        "appeal"
      ]
    },
    {
      "id": "s117",
      "num": "Section 117",
      "act": "CGST",
      "chapter": "XVIII",
      "title": "Appeal to High Court",
      "category": "appeal",
      "summary": "Further appeal to High Court only on substantial questions of law.",
      "key_points": [
        "Only on substantial questions of law (not facts)",
        "Time limit: 180 days from GSTAT order (condonable)",
        "Also: writ jurisdiction under Article 226 if no efficacious remedy"
      ],
      "tags": [
        "high court",
        "substantial question of law"
      ]
    },
    {
      "id": "s122",
      "num": "Section 122",
      "act": "CGST",
      "chapter": "XIX",
      "title": "Penalty for Certain Offences",
      "category": "penalty",
      "summary": "21 categories of offences with mandatory penalty. Covers fraudulent invoicing, ITC fraud, tax collection without payment.",
      "key_points": [
        "21 offences for taxable persons",
        "Penalty: higher of ₹10,000 or tax amount",
        "Sec 122(3): abettor/aider penalty up to ₹25,000",
        "E-commerce violations: ₹10,000 or tax (from Oct 2023)"
      ],
      "tags": [
        "penalty",
        "offences",
        "section 122"
      ]
    },
    {
      "id": "s126",
      "num": "Section 126",
      "act": "CGST",
      "chapter": "XIX",
      "title": "General Disciplines Related to Penalty",
      "category": "penalty",
      "summary": "Principles governing penalty imposition — proportionality, voluntary disclosure as mitigating factor, no penalty for minor breaches.",
      "key_points": [
        "No penalty for breach < ₹5,000 tax and easily rectifiable",
        "Penalty proportionate to severity and degree",
        "Opportunity of hearing before any penalty",
        "Voluntary disclosure = mitigating factor",
        "Not applicable where penalty is fixed sum/percentage"
      ],
      "tags": [
        "penalty principles",
        "minor breach",
        "proportionality"
      ]
    },
    {
      "id": "s128",
      "num": "Section 128",
      "act": "CGST",
      "chapter": "XIX",
      "title": "Power to Waive Penalty",
      "category": "penalty",
      "summary": "Government can waive penalty/late fee for specific class of taxpayers via notification (on GST Council recommendation).",
      "key_points": [
        "Used for amnesty schemes (e.g., GSTR-3B late fee waiver)",
        "Section 128A (inserted 2024): waiver of interest/penalty for FY 2017-20 demands if tax paid"
      ],
      "tags": [
        "waiver",
        "amnesty",
        "penalty waiver"
      ]
    },
    {
      "id": "s129",
      "num": "Section 129",
      "act": "CGST",
      "chapter": "XIX",
      "title": "Detention and Seizure in Transit",
      "category": "penalty",
      "summary": "Goods in transit not covered by required documents can be detained. Released on payment of tax + penalty.",
      "key_points": [
        "Owner present: penalty = 100% of tax",
        "Owner absent: penalty = 50% of value or actual tax",
        "Exempted goods: 2%/5% of value or ₹25,000 (lower)",
        "Delhi HC: not invokable for minor/technical breach without fraud intent",
        "Must file application for release within 7 days of detention"
      ],
      "tags": [
        "detention",
        "transit",
        "e-way bill",
        "section 129"
      ]
    },
    {
      "id": "s132",
      "num": "Section 132",
      "act": "CGST",
      "chapter": "XIX",
      "title": "Punishment for Certain Offences",
      "category": "prosecution",
      "summary": "Criminal prosecution and imprisonment for serious GST offences above monetary thresholds.",
      "key_points": [
        "> ₹500L: 5 years imprisonment + fine",
        "₹200L–500L: 3 years + fine",
        "₹100L–200L (fake invoice): 1 year + fine",
        "Threshold for prosecution: generally > ₹5 crore (48th GST Council)",
        "Sanction of Principal Commissioner required before prosecution",
        "No specific limitation period for Sec 132 prosecution"
      ],
      "tags": [
        "prosecution",
        "imprisonment",
        "fake invoice",
        "section 132"
      ]
    }
  ],
  "caseLaws": [
    {
      "id": "cl1",
      "title": "Union of India v. Mohit Minerals Pvt. Ltd.",
      "court": "Supreme Court",
      "year": 2022,
      "citation": "(2022) 61 GSTL (SC)",
      "sections": [
        "IGST Sec 5"
      ],
      "issue": "Validity of GST on ocean freight on CIF imports — RCM on deemed services of shipping",
      "holding": "Notification No. 8/2017-IT(R) levying IGST on ocean freight under reverse charge on importer held ultra vires. Double taxation on same transaction not permissible.",
      "impact": "Major relief for importers. CIF importers cannot be taxed again when foreign shipping line already taxed.",
      "tags": [
        "ocean freight",
        "CIF imports",
        "RCM",
        "IGST",
        "notification ultra vires"
      ]
    },
    {
      "id": "cl2",
      "title": "Chief Commissioner of CGST v. Safari Retreats Pvt. Ltd.",
      "court": "Supreme Court",
      "year": 2024,
      "citation": "2024 TAXSCAN (SC) 267",
      "sections": [
        "Section 17(5)(d)"
      ],
      "issue": "ITC on construction of immovable property used for renting (commercial shopping mall)",
      "holding": "Section 17(5)(d) blocking ITC on construction of immovable property upheld as constitutional. BUT \"plant or machinery\" exception applies — if property qualifies as plant, ITC is available.",
      "impact": "ITC on malls/commercial buildings generally blocked; but plant & machinery exception available for manufacturing facilities built as immovable structures.",
      "tags": [
        "ITC",
        "blocked credits",
        "construction",
        "plant and machinery",
        "section 17(5)",
        "immovable property"
      ]
    },
    {
      "id": "cl3",
      "title": "State of Karnataka v. M/s Ecom Gill Coffee Trading Pvt. Ltd.",
      "court": "Supreme Court",
      "year": 2023,
      "citation": "2023 TAXSCAN (SC) 131",
      "sections": [
        "Section 16"
      ],
      "issue": "Whether photocopy of invoices and payee cheques alone sufficient to prove ITC genuineness",
      "holding": "Mere possession of invoices and proof of payment (cheques) insufficient to prove transaction genuineness. Must prove actual supply, physical movement of goods.",
      "impact": "Taxpayers must maintain comprehensive records: invoices, e-way bills, GRNs, weighbridge slips, transport documents, payment proofs — to prove bona fide ITC claim.",
      "tags": [
        "ITC",
        "genuineness",
        "burden of proof",
        "section 16",
        "fake invoicing"
      ]
    },
    {
      "id": "cl4",
      "title": "M/s Bharti Airtel Ltd. v. Commissioner of Central Excise",
      "court": "Supreme Court",
      "year": 2024,
      "citation": "2024 TAXSCAN (SC) 289",
      "sections": [
        "Section 2(52)",
        "Section 2(73)"
      ],
      "issue": "Whether mobile towers and pre-fabricated buildings are goods or immovable property",
      "holding": "Mobile towers and pre-fabricated buildings held to be \"goods\" and not immovable property. CENVAT/ITC credit allowed.",
      "impact": "Significant for telecom industry — ITC on tower infrastructure can be claimed.",
      "tags": [
        "mobile towers",
        "goods vs immovable property",
        "ITC",
        "telecom",
        "CENVAT"
      ]
    },
    {
      "id": "cl5",
      "title": "VKC Footsteps India Pvt. Ltd. v. Union of India",
      "court": "Supreme Court",
      "year": 2021,
      "citation": "2021 (53) GSTL 129 (SC)",
      "sections": [
        "Section 54",
        "Rule 89(4)"
      ],
      "issue": "Validity of Rule 89(4) restricting refund calculation for inverted duty structure to exclude services",
      "holding": "Rule 89(4) restricting refund formula to only input goods (excluding input services for inverted duty refund) was upheld as intra vires but with direction to re-examine.",
      "impact": "Refund calculation for inverted duty structure follows specific formula excluding service inputs; legislative review recommended.",
      "tags": [
        "refund",
        "inverted duty",
        "Rule 89(4)",
        "section 54",
        "formula"
      ]
    },
    {
      "id": "cl6",
      "title": "M/s Hindustan Steel Works Construction Ltd. v. Commissioner",
      "court": "Supreme Court",
      "year": 2023,
      "citation": "Civil Appeal No. 3802/2023",
      "sections": [
        "Section 74",
        "Section 75"
      ],
      "issue": "Whether mere difference in opinion on classification amounts to fraud/suppression under Section 74",
      "holding": "Bona fide difference in classification or honest belief does not constitute fraud or suppression. Section 74 cannot be invoked for genuine classification disputes.",
      "impact": "Taxpayers can defend Section 74 SCNs by proving honest bona fide belief; department must prove specific fraudulent intent.",
      "tags": [
        "section 74",
        "fraud",
        "suppression",
        "classification",
        "bona fide belief"
      ]
    },
    {
      "id": "cl7",
      "title": "State Tax Officer v. Shabu George",
      "court": "Supreme Court",
      "year": 2023,
      "citation": "2023 TAXSCAN (SC) 206",
      "sections": [
        "Section 67"
      ],
      "issue": "Whether Revenue can seize cash during GST inspection that is not stock-in-trade",
      "holding": "Revenue Department CANNOT seize cash that does not constitute stock-in-trade in a GST case during inspection.",
      "impact": "Protects businesses from excessive seizure of cash/assets during GST inspection.",
      "tags": [
        "seizure",
        "inspection",
        "cash",
        "section 67",
        "enforcement"
      ]
    },
    {
      "id": "cl8",
      "title": "Tvl. Senthil Hardwares v. State Tax Officer",
      "court": "Madras High Court",
      "year": 2024,
      "citation": "2024 TAXSCAN (HC) 2484",
      "sections": [
        "Section 75"
      ],
      "issue": "Whether GST authorities can include new defects in adjudication order beyond SCN",
      "holding": "GST authorities cannot introduce new defects or grounds in adjudication orders beyond what was specified in the Show Cause Notice. Such orders are liable to be set aside.",
      "impact": "SCN must contain all grounds of demand. Order beyond SCN scope = unlawful.",
      "tags": [
        "SCN",
        "adjudication order",
        "natural justice",
        "new grounds",
        "section 75"
      ]
    },
    {
      "id": "cl9",
      "title": "Patna HC (S.S. Enterprises v. Union of India)",
      "court": "Patna High Court",
      "year": 2024,
      "citation": "2024 TAXSCAN (HC) 2026",
      "sections": [
        "Section 73"
      ],
      "issue": "Calculation of 3-year limitation period under Section 73(10) — from which date",
      "holding": "The 3-year limitation period starts from the actual date of filing the annual return, NOT the extended due date (even if extended by government notification).",
      "impact": "Department must track actual return filing date for limitation. Demands post limitation period are void.",
      "tags": [
        "limitation",
        "section 73",
        "annual return",
        "time limit"
      ]
    },
    {
      "id": "cl10",
      "title": "Delhi HC – ANWAR ALI v. Addl. Commissioner CGST",
      "court": "Delhi High Court",
      "year": 2024,
      "citation": "2024 TAXSCAN (HC) 1795",
      "sections": [
        "Section 29"
      ],
      "issue": "Validity of retrospective cancellation of GST registration without following Section 29(2) procedure",
      "holding": "Retrospective cancellation of registration without issuing proper SCN and following procedure under Section 29(2) is unlawful and liable to be quashed.",
      "impact": "Department cannot cancel registration retrospectively without SCN. Natural justice must be followed.",
      "tags": [
        "registration",
        "cancellation",
        "retrospective",
        "section 29",
        "natural justice"
      ]
    },
    {
      "id": "cl11",
      "title": "Madras HC – Signet Industries Ltd. v. State Tax Officer",
      "court": "Madras High Court",
      "year": 2024,
      "citation": "2024 TAXSCAN (HC) 2171",
      "sections": [
        "Section 75(4)"
      ],
      "issue": "Whether personal hearing mandatory before passing adverse GST order",
      "holding": "Section 75(4) mandates personal hearing before passing any adverse order. Order passed without providing mandatory personal hearing must be quashed.",
      "impact": "Taxpayers must be given personal hearing opportunity. All orders without hearing are void.",
      "tags": [
        "hearing",
        "natural justice",
        "section 75(4)",
        "mandatory hearing",
        "adverse order"
      ]
    },
    {
      "id": "cl12",
      "title": "Allahabad HC – Dinesh Kumar Pradeep Kumar v. Addl. Commissioner",
      "court": "Allahabad High Court",
      "year": 2024,
      "citation": "July 25, 2024",
      "sections": [
        "Section 67",
        "Section 130",
        "Section 73"
      ],
      "issue": "Whether confiscation under Sec 130 can be initiated for excess stock found during inspection",
      "holding": "Confiscation proceedings under Section 130 cannot be initiated for excess stock found solely on basis of inspection under Sec 67. Tax demand must first be quantified through Sec 73/74 process.",
      "impact": "Excess stock cannot directly trigger Section 130 confiscation. Proper demand + adjudication must precede confiscation.",
      "tags": [
        "confiscation",
        "section 130",
        "excess stock",
        "inspection",
        "section 67"
      ]
    },
    {
      "id": "cl13",
      "title": "Karnataka HC – Huawei Technologies India Pvt. Ltd. v. State of Karnataka",
      "court": "Karnataka High Court",
      "year": 2024,
      "citation": "2024 HC Karnataka",
      "sections": [
        "IGST Section 13"
      ],
      "issue": "Whether remuneration paid to foreign national employees posted in India attracts IGST under RCM",
      "holding": "Where there exists a genuine employer-employee relationship, remuneration does not constitute import of service. IGST under RCM not applicable on such remuneration.",
      "impact": "Companies with foreign deputed employees can avoid RCM on salary/remuneration if genuine employment relationship proven.",
      "tags": [
        "RCM",
        "foreign employees",
        "employer-employee",
        "IGST",
        "reverse charge"
      ]
    },
    {
      "id": "cl14",
      "title": "Commissioner of CGST v. M/s Edelweiss Financial Services Ltd.",
      "court": "Supreme Court",
      "year": 2023,
      "citation": "2023 TAXSCAN (SC) 142",
      "sections": [
        "Section 7"
      ],
      "issue": "Whether corporate guarantee provided without consideration is taxable supply of service",
      "holding": "Valid consideration is necessary for any service to be taxable. Corporate guarantee provided without any consideration is not a taxable supply.",
      "impact": "No GST on free corporate guarantees. Circular 204/16/2023 and subsequent amendments must be read with this ruling.",
      "tags": [
        "corporate guarantee",
        "consideration",
        "supply",
        "section 7",
        "GST applicability"
      ]
    },
    {
      "id": "cl15",
      "title": "Union of India v. Cosmo Films Ltd.",
      "court": "Supreme Court",
      "year": 2023,
      "citation": "2023 TAXSCAN (SC) 177",
      "sections": [
        "IGST",
        "Advance Authorisation"
      ],
      "issue": "Validity of pre-import condition for claiming IGST exemption under Advance Authorisation Scheme",
      "holding": "The pre-import condition for claiming IGST and GST Compensation Cess exemption under Advance Authorisation Scheme is valid and constitutional.",
      "impact": "Exporters must import goods before export to claim exemption under advance authorisation.",
      "tags": [
        "advance authorisation",
        "IGST",
        "export",
        "pre-import condition"
      ]
    },
    {
      "id": "cl16",
      "title": "Bombay HC – Viswaat Chemicals Ltd. v. Union of India",
      "court": "Bombay High Court",
      "year": 2024,
      "citation": "October 14, 2024",
      "sections": [
        "Section 107"
      ],
      "issue": "Writ petition filed claiming SCN was vague without first objecting before adjudicating authority",
      "holding": "Where taxpayer did not raise vagueness objection before adjudicating authority, writ petition on that ground before HC is not maintainable — alternate remedy must be exhausted.",
      "impact": "Taxpayers must raise all objections at first stage (before AO) before approaching High Court.",
      "tags": [
        "writ petition",
        "alternate remedy",
        "SCN vagueness",
        "high court jurisdiction"
      ]
    },
    {
      "id": "cl17",
      "title": "Mineral Area Development Authority v. Steel Authority of India",
      "court": "Supreme Court",
      "year": 2024,
      "citation": "2024 (164) taxmann.com 806 (SC)",
      "sections": [
        "Constitution Article 246A"
      ],
      "issue": "Whether royalty on mining is a tax and who has authority to tax mineral rights",
      "holding": "Royalty on mining is NOT a tax. States have constitutional authority to levy taxes on mineral rights independent of Parliament.",
      "impact": "States can levy mineral taxes; clarifies distinction between royalty (contractual) and tax (statutory obligation).",
      "tags": [
        "mining royalty",
        "state power",
        "mineral rights",
        "constitution"
      ]
    },
    {
      "id": "cl18",
      "title": "GSTR-2A vs GSTR-3B Mismatch — ITC Denial",
      "court": "Supreme Court (upholding Calcutta HC)",
      "year": 2023,
      "citation": "Calcutta HC (affirmed)",
      "sections": [
        "Section 16"
      ],
      "issue": "Whether ITC can be denied solely on GSTR-2A mismatch without examining supplier default reasons",
      "holding": "ITC cannot be denied to purchaser solely due to GSTR-2A/GSTR-3B mismatch unless department proves supplier fraud/suppression linked to recipient. Recipient not responsible for supplier default in exceptional cases.",
      "impact": "Taxpayers can claim ITC even if supplier has not filed returns, subject to proving genuine transaction.",
      "tags": [
        "ITC",
        "GSTR-2A",
        "mismatch",
        "supplier default",
        "section 16"
      ]
    }
  ],
  "circulars": [
    {
      "id": "notif-1",
      "no": "NOTIFICATION No. 16/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "GOODS AND SERVICES TAX SETTLEMENT OF FUNDS (SECOND AMENDMENT) RULES, 2018 - AMENDMENT IN R...",
      "summary": "Original PDF document: 16_2017-CT_ConditionsForLUT_Corrigendum.pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/16_2017-CT_ConditionsForLUT_Corrigendum.pdf"
    },
    {
      "id": "notif-2",
      "no": "NOTIFICATION No. 08/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "SECTION 23 OF THE CENTRAL GOODS AND SERVICES TAX ACT, 2017 - REGISTRATION - PERSON LIABLE ...",
      "summary": "Original PDF document: 32_2017-CT_Eng.pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/32_2017-CT_Eng.pdf"
    },
    {
      "id": "notif-3",
      "no": "NOTIFICATION No. 2017/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "SECTION 1, READ WITH SECTION 51, OF THE CENTRAL GOODS AND SERVICES TAX ACT, 2017 - DATE OF...",
      "summary": "Original PDF document: 33_2017-CT_Eng.pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/33_2017-CT_Eng.pdf"
    },
    {
      "id": "notif-4",
      "no": "NOTIFICATION No. 34/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CENTRAL GOODS AND SERVICES TAX (SEVENTH AMENDMENT) RULES, 2017 - AMENDMENT IN RULES 3, 122...",
      "summary": "Original PDF document: 34_2017-CT_Eng.pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/34_2017-CT_Eng.pdf"
    },
    {
      "id": "notif-5",
      "no": "NOTIFICATION No. 35/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "SECTION 39 OF THE CENTRAL GOODS AND SERVICES TAX ACT, 2017, READ WITH RULE 61 OF THE CENTR...",
      "summary": "Original PDF document: 35_2017-CT_Eng.pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/35_2017-CT_Eng.pdf"
    },
    {
      "id": "notif-6",
      "no": "NOTIFICATION No. 14/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: Corrigendum_Noftn_14-2017.pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/Corrigendum_Noftn_14-2017.pdf"
    },
    {
      "id": "notif-7",
      "no": "NOTIFICATION No. 02/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: Corrigendum_Notfn_02-2017.pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/Corrigendum_Notfn_02-2017.pdf"
    },
    {
      "id": "notif-8",
      "no": "NOTIFICATION No. 74/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (1).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (1).pdf"
    },
    {
      "id": "notif-9",
      "no": "NOTIFICATION No. 58/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (10).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (10).pdf"
    },
    {
      "id": "notif-10",
      "no": "NOTIFICATION No. 64/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (11).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (11).pdf"
    },
    {
      "id": "notif-11",
      "no": "NOTIFICATION No. 53/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (12).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (12).pdf"
    },
    {
      "id": "notif-12",
      "no": "NOTIFICATION No. 62/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (13).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (13).pdf"
    },
    {
      "id": "notif-13",
      "no": "NOTIFICATION No. 61/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (14).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (14).pdf"
    },
    {
      "id": "notif-14",
      "no": "NOTIFICATION No. 60/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (15).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (15).pdf"
    },
    {
      "id": "notif-15",
      "no": "NOTIFICATION No. 59/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (16).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (16).pdf"
    },
    {
      "id": "notif-16",
      "no": "NOTIFICATION No. 58/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (17).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (17).pdf"
    },
    {
      "id": "notif-17",
      "no": "Notification (Year 2017)",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (18).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (18).pdf"
    },
    {
      "id": "notif-18",
      "no": "NOTIFICATION No. 56/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (19).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (19).pdf"
    },
    {
      "id": "notif-19",
      "no": "NOTIFICATION No. 73/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (2).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (2).pdf"
    },
    {
      "id": "notif-20",
      "no": "NOTIFICATION No. 42/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (20).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (20).pdf"
    },
    {
      "id": "notif-21",
      "no": "Notification (Year 2017)",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (21).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (21).pdf"
    },
    {
      "id": "notif-22",
      "no": "NOTIFICATION No. 53/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (22).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (22).pdf"
    },
    {
      "id": "notif-23",
      "no": "NOTIFICATION No. 52/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (23).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (23).pdf"
    },
    {
      "id": "notif-24",
      "no": "NOTIFICATION No. 51/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (24).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (24).pdf"
    },
    {
      "id": "notif-25",
      "no": "NOTIFICATION No. 58/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (25).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (25).pdf"
    },
    {
      "id": "notif-26",
      "no": "NOTIFICATION No. 50/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (26).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (26).pdf"
    },
    {
      "id": "notif-27",
      "no": "Notification (Year 2017)",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (27).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (27).pdf"
    },
    {
      "id": "notif-28",
      "no": "NOTIFICATION No. 46/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (28).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (28).pdf"
    },
    {
      "id": "notif-29",
      "no": "Notification (Year 2017)",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (29).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (29).pdf"
    },
    {
      "id": "notif-30",
      "no": "NOTIFICATION No. 58/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (3).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (3).pdf"
    },
    {
      "id": "notif-31",
      "no": "Notification (Year 2017)",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (30).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (30).pdf"
    },
    {
      "id": "notif-32",
      "no": "NOTIFICATION No. 26/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (31).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (31).pdf"
    },
    {
      "id": "notif-33",
      "no": "Notification (Year 2017)",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (32).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (32).pdf"
    },
    {
      "id": "notif-34",
      "no": "Notification (Year 2017)",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (33).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (33).pdf"
    },
    {
      "id": "notif-35",
      "no": "Notification (Year 2017)",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (34).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (34).pdf"
    },
    {
      "id": "notif-36",
      "no": "NOTIFICATION No. 32/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (35).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (35).pdf"
    },
    {
      "id": "notif-37",
      "no": "NOTIFICATION No. 16/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (36).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (36).pdf"
    },
    {
      "id": "notif-38",
      "no": "Notification (Year 2017)",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (37).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (37).pdf"
    },
    {
      "id": "notif-39",
      "no": "NOTIFICATION No. 74/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (38).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (38).pdf"
    },
    {
      "id": "notif-40",
      "no": "Notification (Year 2017)",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (39).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (39).pdf"
    },
    {
      "id": "notif-41",
      "no": "NOTIFICATION No. 57/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (4).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (4).pdf"
    },
    {
      "id": "notif-42",
      "no": "Notification (Year 2017)",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (40).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (40).pdf"
    },
    {
      "id": "notif-43",
      "no": "NOTIFICATION No. 25/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (41).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (41).pdf"
    },
    {
      "id": "notif-44",
      "no": "NOTIFICATION No. 21/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (42).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (42).pdf"
    },
    {
      "id": "notif-45",
      "no": "NOTIFICATION No. 23/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (43).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (43).pdf"
    },
    {
      "id": "notif-46",
      "no": "NOTIFICATION No. 22/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (44).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (44).pdf"
    },
    {
      "id": "notif-47",
      "no": "NOTIFICATION No. 21/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (45).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (45).pdf"
    },
    {
      "id": "notif-48",
      "no": "NOTIFICATION No. 20/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (46).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (46).pdf"
    },
    {
      "id": "notif-49",
      "no": "NOTIFICATION No. 19/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (47).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (47).pdf"
    },
    {
      "id": "notif-50",
      "no": "NOTIFICATION No. 18/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (48).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (48).pdf"
    },
    {
      "id": "notif-51",
      "no": "NOTIFICATION No. 17/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (49).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (49).pdf"
    },
    {
      "id": "notif-52",
      "no": "NOTIFICATION No. 70/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (5).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (5).pdf"
    },
    {
      "id": "notif-53",
      "no": "NOTIFICATION No. 16/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (50).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (50).pdf"
    },
    {
      "id": "notif-54",
      "no": "Notification (Year 2017)",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (51).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (51).pdf"
    },
    {
      "id": "notif-55",
      "no": "Notification (Year 2017)",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (52).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (52).pdf"
    },
    {
      "id": "notif-56",
      "no": "Notification (Year 2017)",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (53).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (53).pdf"
    },
    {
      "id": "notif-57",
      "no": "Notification (Year 2017)",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (54).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (54).pdf"
    },
    {
      "id": "notif-58",
      "no": "NOTIFICATION No. 06/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (55).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (55).pdf"
    },
    {
      "id": "notif-59",
      "no": "Notification (Year 2017)",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (56).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (56).pdf"
    },
    {
      "id": "notif-60",
      "no": "NOTIFICATION No. 72/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (57).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (57).pdf"
    },
    {
      "id": "notif-61",
      "no": "NOTIFICATION No. 08/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (58).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (58).pdf"
    },
    {
      "id": "notif-62",
      "no": "Notification (Year 2017)",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (59).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (59).pdf"
    },
    {
      "id": "notif-63",
      "no": "NOTIFICATION No. 69/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (6).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (6).pdf"
    },
    {
      "id": "notif-64",
      "no": "NOTIFICATION No. 06/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (60).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (60).pdf"
    },
    {
      "id": "notif-65",
      "no": "NOTIFICATION No. 05/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (61).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (61).pdf"
    },
    {
      "id": "notif-66",
      "no": "NOTIFICATION No. 72/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (62).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (62).pdf"
    },
    {
      "id": "notif-67",
      "no": "Notification (Year 2017)",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (63).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (63).pdf"
    },
    {
      "id": "notif-68",
      "no": "NOTIFICATION No. 02/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (64).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (64).pdf"
    },
    {
      "id": "notif-69",
      "no": "NOTIFICATION No. 01/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (65).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (65).pdf"
    },
    {
      "id": "notif-70",
      "no": "NOTIFICATION No. 68/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (7).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (7).pdf"
    },
    {
      "id": "notif-71",
      "no": "NOTIFICATION No. 67/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (8).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (8).pdf"
    },
    {
      "id": "notif-72",
      "no": "NOTIFICATION No. 66/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download (9).pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download (9).pdf"
    },
    {
      "id": "notif-73",
      "no": "Notification (Year 2017)",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: download.pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/download.pdf"
    },
    {
      "id": "notif-74",
      "no": "NOTIFICATION No. 29/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: notfctn-29-central-tax-english.pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/notfctn-29-central-tax-english.pdf"
    },
    {
      "id": "notif-75",
      "no": "NOTIFICATION No. 25/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: notfctn-42-cgst-english.pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/notfctn-42-cgst-english.pdf"
    },
    {
      "id": "notif-76",
      "no": "NOTIFICATION No. 74/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: notifctn-ct-50.pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/notifctn-ct-50.pdf"
    },
    {
      "id": "notif-77",
      "no": "NOTIFICATION No. 31/2017 – CENTRAL TAX",
      "date": "2017-01-01",
      "topic": "CGST Notification in 2017",
      "summary": "Original PDF document: Ntfn_31_2017E.pdf",
      "tags": [
        "Notification",
        "2017"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2017/Ntfn_31_2017E.pdf"
    },
    {
      "id": "notif-78",
      "no": "NOTIFICATION No. 59/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (1).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (1).pdf"
    },
    {
      "id": "notif-79",
      "no": "NOTIFICATION No. 69/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (10).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (10).pdf"
    },
    {
      "id": "notif-80",
      "no": "NOTIFICATION No. 68/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (11).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (11).pdf"
    },
    {
      "id": "notif-81",
      "no": "NOTIFICATION No. 67/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (12).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (12).pdf"
    },
    {
      "id": "notif-82",
      "no": "NOTIFICATION No. 66/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (13).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (13).pdf"
    },
    {
      "id": "notif-83",
      "no": "NOTIFICATION No. 65/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (14).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (14).pdf"
    },
    {
      "id": "notif-84",
      "no": "NOTIFICATION No. 64/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (15).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (15).pdf"
    },
    {
      "id": "notif-85",
      "no": "NOTIFICATION No. 63/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (16).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (16).pdf"
    },
    {
      "id": "notif-86",
      "no": "NOTIFICATION No. 62/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (17).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (17).pdf"
    },
    {
      "id": "notif-87",
      "no": "NOTIFICATION No. 57/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (18).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (18).pdf"
    },
    {
      "id": "notif-88",
      "no": "NOTIFICATION No. 60/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (19).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (19).pdf"
    },
    {
      "id": "notif-89",
      "no": "NOTIFICATION No. 73/2017 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (2).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (2).pdf"
    },
    {
      "id": "notif-90",
      "no": "NOTIFICATION No. 59/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (20).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (20).pdf"
    },
    {
      "id": "notif-91",
      "no": "NOTIFICATION No. 58/2017 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (21).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (21).pdf"
    },
    {
      "id": "notif-92",
      "no": "NOTIFICATION No. 50/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (22).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (22).pdf"
    },
    {
      "id": "notif-93",
      "no": "NOTIFICATION No. 56/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (23).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (23).pdf"
    },
    {
      "id": "notif-94",
      "no": "NOTIFICATION No. 34/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (24).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (24).pdf"
    },
    {
      "id": "notif-95",
      "no": "NOTIFICATION No. 54/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (25).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (25).pdf"
    },
    {
      "id": "notif-96",
      "no": "NOTIFICATION No. 53/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (26).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (26).pdf"
    },
    {
      "id": "notif-97",
      "no": "NOTIFICATION No. 52/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (27).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (27).pdf"
    },
    {
      "id": "notif-98",
      "no": "NOTIFICATION No. 51/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (28).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (28).pdf"
    },
    {
      "id": "notif-99",
      "no": "NOTIFICATION No. 50/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (29).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (29).pdf"
    },
    {
      "id": "notif-100",
      "no": "NOTIFICATION No. 28/2017 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (3).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (3).pdf"
    },
    {
      "id": "notif-101",
      "no": "NOTIFICATION No. 49/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (30).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (30).pdf"
    },
    {
      "id": "notif-102",
      "no": "NOTIFICATION No. 03/2017 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (31).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (31).pdf"
    },
    {
      "id": "notif-103",
      "no": "NOTIFICATION No. 47/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (32).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (32).pdf"
    },
    {
      "id": "notif-104",
      "no": "NOTIFICATION No. 31/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (33).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (33).pdf"
    },
    {
      "id": "notif-105",
      "no": "NOTIFICATION No. 31/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (34).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (34).pdf"
    },
    {
      "id": "notif-106",
      "no": "NOTIFICATION No. 44/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (35).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (35).pdf"
    },
    {
      "id": "notif-107",
      "no": "NOTIFICATION No. 43/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (36).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (36).pdf"
    },
    {
      "id": "notif-108",
      "no": "NOTIFICATION No. 42/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (37).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (37).pdf"
    },
    {
      "id": "notif-109",
      "no": "NOTIFICATION No. 41/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (38).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (38).pdf"
    },
    {
      "id": "notif-110",
      "no": "NOTIFICATION No. 40/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (39).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (39).pdf"
    },
    {
      "id": "notif-111",
      "no": "NOTIFICATION No. 75/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (4).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (4).pdf"
    },
    {
      "id": "notif-112",
      "no": "NOTIFICATION No. 39/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (40).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (40).pdf"
    },
    {
      "id": "notif-113",
      "no": "NOTIFICATION No. 38/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (41).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (41).pdf"
    },
    {
      "id": "notif-114",
      "no": "NOTIFICATION No. 37/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (42).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (42).pdf"
    },
    {
      "id": "notif-115",
      "no": "NOTIFICATION No. 36/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (43).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (43).pdf"
    },
    {
      "id": "notif-116",
      "no": "NOTIFICATION No. 35/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (44).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (44).pdf"
    },
    {
      "id": "notif-117",
      "no": "NOTIFICATION No. 34/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (45).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (45).pdf"
    },
    {
      "id": "notif-118",
      "no": "NOTIFICATION No. 33/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (46).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (46).pdf"
    },
    {
      "id": "notif-119",
      "no": "NOTIFICATION No. 58/2017 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (47).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (47).pdf"
    },
    {
      "id": "notif-120",
      "no": "NOTIFICATION No. 31/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (48).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (48).pdf"
    },
    {
      "id": "notif-121",
      "no": "NOTIFICATION No. 30/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (49).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (49).pdf"
    },
    {
      "id": "notif-122",
      "no": "NOTIFICATION No. 74/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (5).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (5).pdf"
    },
    {
      "id": "notif-123",
      "no": "NOTIFICATION No. 29/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (50).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (50).pdf"
    },
    {
      "id": "notif-124",
      "no": "NOTIFICATION No. 28/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (51).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (51).pdf"
    },
    {
      "id": "notif-125",
      "no": "NOTIFICATION No. 27/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (52).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (52).pdf"
    },
    {
      "id": "notif-126",
      "no": "NOTIFICATION No. 26/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (53).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (53).pdf"
    },
    {
      "id": "notif-127",
      "no": "NOTIFICATION No. 25/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (54).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (54).pdf"
    },
    {
      "id": "notif-128",
      "no": "NOTIFICATION No. 58/2017 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (55).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (55).pdf"
    },
    {
      "id": "notif-129",
      "no": "NOTIFICATION No. 23/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (56).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (56).pdf"
    },
    {
      "id": "notif-130",
      "no": "NOTIFICATION No. 58/2017 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (57).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (57).pdf"
    },
    {
      "id": "notif-131",
      "no": "NOTIFICATION No. 21/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (58).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (58).pdf"
    },
    {
      "id": "notif-132",
      "no": "NOTIFICATION No. 20/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (59).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (59).pdf"
    },
    {
      "id": "notif-133",
      "no": "NOTIFICATION No. 50/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (6).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (6).pdf"
    },
    {
      "id": "notif-134",
      "no": "NOTIFICATION No. 19/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (60).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (60).pdf"
    },
    {
      "id": "notif-135",
      "no": "NOTIFICATION No. 58/2017 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (61).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (61).pdf"
    },
    {
      "id": "notif-136",
      "no": "NOTIFICATION No. 17/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (62).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (62).pdf"
    },
    {
      "id": "notif-137",
      "no": "NOTIFICATION No. 58/2017 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (63).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (63).pdf"
    },
    {
      "id": "notif-138",
      "no": "NOTIFICATION No. 15/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (64).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (64).pdf"
    },
    {
      "id": "notif-139",
      "no": "NOTIFICATION No. 14/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (65).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (65).pdf"
    },
    {
      "id": "notif-140",
      "no": "NOTIFICATION No. 13/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (66).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (66).pdf"
    },
    {
      "id": "notif-141",
      "no": "NOTIFICATION No. 12/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (67).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (67).pdf"
    },
    {
      "id": "notif-142",
      "no": "NOTIFICATION No. 11/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (68).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (68).pdf"
    },
    {
      "id": "notif-143",
      "no": "NOTIFICATION No. 10/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (69).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (69).pdf"
    },
    {
      "id": "notif-144",
      "no": "NOTIFICATION No. 72/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (7).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (7).pdf"
    },
    {
      "id": "notif-145",
      "no": "NOTIFICATION No. 09/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (70).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (70).pdf"
    },
    {
      "id": "notif-146",
      "no": "NOTIFICATION No. 08/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (71).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (71).pdf"
    },
    {
      "id": "notif-147",
      "no": "NOTIFICATION No. 07/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (72).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (72).pdf"
    },
    {
      "id": "notif-148",
      "no": "NOTIFICATION No. 06/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (73).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (73).pdf"
    },
    {
      "id": "notif-149",
      "no": "NOTIFICATION No. 05/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (74).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (74).pdf"
    },
    {
      "id": "notif-150",
      "no": "NOTIFICATION No. 04/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (75).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (75).pdf"
    },
    {
      "id": "notif-151",
      "no": "NOTIFICATION No. 03/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (76).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (76).pdf"
    },
    {
      "id": "notif-152",
      "no": "NOTIFICATION No. 02/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (77).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (77).pdf"
    },
    {
      "id": "notif-153",
      "no": "NOTIFICATION No. 01/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (78).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (78).pdf"
    },
    {
      "id": "notif-154",
      "no": "NOTIFICATION No. 71/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (8).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (8).pdf"
    },
    {
      "id": "notif-155",
      "no": "NOTIFICATION No. 70/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download (9).pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download (9).pdf"
    },
    {
      "id": "notif-156",
      "no": "NOTIFICATION No. 02/2017 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: download.pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/download.pdf"
    },
    {
      "id": "notif-157",
      "no": "NOTIFICATION No. 60/2018 – CENTRAL TAX",
      "date": "2018-01-01",
      "topic": "CGST Notification in 2018",
      "summary": "Original PDF document: notfctn-60_english_corregendum.pdf",
      "tags": [
        "Notification",
        "2018"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2018/notfctn-60_english_corregendum.pdf"
    },
    {
      "id": "notif-158",
      "no": "NOTIFICATION No. 76/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (1).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (1).pdf"
    },
    {
      "id": "notif-159",
      "no": "NOTIFICATION No. 44/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (10).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (10).pdf"
    },
    {
      "id": "notif-160",
      "no": "NOTIFICATION No. 29/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (11).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (11).pdf"
    },
    {
      "id": "notif-161",
      "no": "NOTIFICATION No. 26/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (12).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (12).pdf"
    },
    {
      "id": "notif-162",
      "no": "NOTIFICATION No. 46/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (13).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (13).pdf"
    },
    {
      "id": "notif-163",
      "no": "NOTIFICATION No. 28/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (14).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (14).pdf"
    },
    {
      "id": "notif-164",
      "no": "NOTIFICATION No. 62/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (15).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (15).pdf"
    },
    {
      "id": "notif-165",
      "no": "NOTIFICATION No. 44/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (16).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (16).pdf"
    },
    {
      "id": "notif-166",
      "no": "NOTIFICATION No. 60/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (17).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (17).pdf"
    },
    {
      "id": "notif-167",
      "no": "NOTIFICATION No. 59/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (18).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (18).pdf"
    },
    {
      "id": "notif-168",
      "no": "NOTIFICATION No. 46/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (19).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (19).pdf"
    },
    {
      "id": "notif-169",
      "no": "NOTIFICATION No. 75/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (2).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (2).pdf"
    },
    {
      "id": "notif-170",
      "no": "NOTIFICATION No. 57/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (20).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (20).pdf"
    },
    {
      "id": "notif-171",
      "no": "NOTIFICATION No. 56/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (21).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (21).pdf"
    },
    {
      "id": "notif-172",
      "no": "NOTIFICATION No. 55/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (22).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (22).pdf"
    },
    {
      "id": "notif-173",
      "no": "NOTIFICATION No. 54/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (23).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (23).pdf"
    },
    {
      "id": "notif-174",
      "no": "NOTIFICATION No. 53/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (24).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (24).pdf"
    },
    {
      "id": "notif-175",
      "no": "NOTIFICATION No. 52/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (25).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (25).pdf"
    },
    {
      "id": "notif-176",
      "no": "NOTIFICATION No. 51/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (26).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (26).pdf"
    },
    {
      "id": "notif-177",
      "no": "NOTIFICATION No. 50/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (27).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (27).pdf"
    },
    {
      "id": "notif-178",
      "no": "NOTIFICATION No. 49/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (28).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (28).pdf"
    },
    {
      "id": "notif-179",
      "no": "NOTIFICATION No. 48/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (29).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (29).pdf"
    },
    {
      "id": "notif-180",
      "no": "NOTIFICATION No. 74/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (3).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (3).pdf"
    },
    {
      "id": "notif-181",
      "no": "NOTIFICATION No. 07/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (30).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (30).pdf"
    },
    {
      "id": "notif-182",
      "no": "NOTIFICATION No. 46/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (31).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (31).pdf"
    },
    {
      "id": "notif-183",
      "no": "NOTIFICATION No. 45/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (32).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (32).pdf"
    },
    {
      "id": "notif-184",
      "no": "NOTIFICATION No. 44/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (33).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (33).pdf"
    },
    {
      "id": "notif-185",
      "no": "NOTIFICATION No. 04/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (34).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (34).pdf"
    },
    {
      "id": "notif-186",
      "no": "NOTIFICATION No. 42/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (35).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (35).pdf"
    },
    {
      "id": "notif-187",
      "no": "NOTIFICATION No. 41/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (36).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (36).pdf"
    },
    {
      "id": "notif-188",
      "no": "NOTIFICATION No. 40/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (37).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (37).pdf"
    },
    {
      "id": "notif-189",
      "no": "NOTIFICATION No. 39/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (38).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (38).pdf"
    },
    {
      "id": "notif-190",
      "no": "NOTIFICATION No. 38/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (39).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (39).pdf"
    },
    {
      "id": "notif-191",
      "no": "NOTIFICATION No. 73/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (4).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (4).pdf"
    },
    {
      "id": "notif-192",
      "no": "NOTIFICATION No. 37/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (40).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (40).pdf"
    },
    {
      "id": "notif-193",
      "no": "NOTIFICATION No. 36/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (41).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (41).pdf"
    },
    {
      "id": "notif-194",
      "no": "NOTIFICATION No. 21/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (42).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (42).pdf"
    },
    {
      "id": "notif-195",
      "no": "NOTIFICATION No. 21/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (43).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (43).pdf"
    },
    {
      "id": "notif-196",
      "no": "NOTIFICATION No. 33/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (44).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (44).pdf"
    },
    {
      "id": "notif-197",
      "no": "NOTIFICATION No. 32/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (45).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (45).pdf"
    },
    {
      "id": "notif-198",
      "no": "NOTIFICATION No. 72/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (5).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (5).pdf"
    },
    {
      "id": "notif-199",
      "no": "NOTIFICATION No. 31/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (6).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (6).pdf"
    },
    {
      "id": "notif-200",
      "no": "NOTIFICATION No. 70/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (7).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (7).pdf"
    },
    {
      "id": "notif-201",
      "no": "NOTIFICATION No. 69/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (8).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (8).pdf"
    },
    {
      "id": "notif-202",
      "no": "NOTIFICATION No. 68/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download (9).pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download (9).pdf"
    },
    {
      "id": "notif-203",
      "no": "NOTIFICATION No. 77/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: download.pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/download.pdf"
    },
    {
      "id": "notif-204",
      "no": "NOTIFICATION No. 01/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: notfctn-01-central-tax-english-2019.pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/notfctn-01-central-tax-english-2019.pdf"
    },
    {
      "id": "notif-205",
      "no": "NOTIFICATION No. 02/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: notfctn-02-central-tax-english-2019.pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/notfctn-02-central-tax-english-2019.pdf"
    },
    {
      "id": "notif-206",
      "no": "NOTIFICATION No. 03/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: notfctn-03-central-tax-english-2019.pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/notfctn-03-central-tax-english-2019.pdf"
    },
    {
      "id": "notif-207",
      "no": "NOTIFICATION No. 04/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: notfctn-04-central-tax-english-2019.pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/notfctn-04-central-tax-english-2019.pdf"
    },
    {
      "id": "notif-208",
      "no": "NOTIFICATION No. 05/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: notfctn-05-central-tax-english-2019.pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/notfctn-05-central-tax-english-2019.pdf"
    },
    {
      "id": "notif-209",
      "no": "NOTIFICATION No. 06/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: notfctn-06-central-tax-english-2019.pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/notfctn-06-central-tax-english-2019.pdf"
    },
    {
      "id": "notif-210",
      "no": "NOTIFICATION No. 07/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: notfctn-07-central-tax-english-2019.pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/notfctn-07-central-tax-english-2019.pdf"
    },
    {
      "id": "notif-211",
      "no": "NOTIFICATION No. 08/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: notfctn-08-central-tax-english-2019.pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/notfctn-08-central-tax-english-2019.pdf"
    },
    {
      "id": "notif-212",
      "no": "NOTIFICATION No. 09/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: notfctn-09-central-tax-english-2019.pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/notfctn-09-central-tax-english-2019.pdf"
    },
    {
      "id": "notif-213",
      "no": "NOTIFICATION No. 10/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: notfctn-10-central-tax-english-2019.pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/notfctn-10-central-tax-english-2019.pdf"
    },
    {
      "id": "notif-214",
      "no": "NOTIFICATION No. 10/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: notfctn-10-central-tax-english-2019_corrgndm.pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/notfctn-10-central-tax-english-2019_corrgndm.pdf"
    },
    {
      "id": "notif-215",
      "no": "NOTIFICATION No. 11/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: notfctn-11-central-tax-english-2019.pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/notfctn-11-central-tax-english-2019.pdf"
    },
    {
      "id": "notif-216",
      "no": "NOTIFICATION No. 12/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: notfctn-12-central-tax-english-2019.pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/notfctn-12-central-tax-english-2019.pdf"
    },
    {
      "id": "notif-217",
      "no": "NOTIFICATION No. 13/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: notfctn-13-central-tax-english-2019.pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/notfctn-13-central-tax-english-2019.pdf"
    },
    {
      "id": "notif-218",
      "no": "NOTIFICATION No. 14/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: notfctn-14-central-tax-english-2019.pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/notfctn-14-central-tax-english-2019.pdf"
    },
    {
      "id": "notif-219",
      "no": "NOTIFICATION No. 15/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: notfctn-15-central-tax-english-2019.pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/notfctn-15-central-tax-english-2019.pdf"
    },
    {
      "id": "notif-220",
      "no": "NOTIFICATION No. 16/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: notfctn-16-central-tax-english-2019.pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/notfctn-16-central-tax-english-2019.pdf"
    },
    {
      "id": "notif-221",
      "no": "NOTIFICATION No. 17/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: notfctn-17-central-tax-english-2019.pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/notfctn-17-central-tax-english-2019.pdf"
    },
    {
      "id": "notif-222",
      "no": "NOTIFICATION No. 16/2018 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: notfctn-18-central-tax-english-2019.pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/notfctn-18-central-tax-english-2019.pdf"
    },
    {
      "id": "notif-223",
      "no": "NOTIFICATION No. 20/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: notfctn-20-central-tax-english-2019.pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/notfctn-20-central-tax-english-2019.pdf"
    },
    {
      "id": "notif-224",
      "no": "NOTIFICATION No. 02/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: notfctn-21-central-tax-english-2019.pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/notfctn-21-central-tax-english-2019.pdf"
    },
    {
      "id": "notif-225",
      "no": "NOTIFICATION No. 74/2018 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: notfctn-22-central-tax-english-2019.pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/notfctn-22-central-tax-english-2019.pdf"
    },
    {
      "id": "notif-226",
      "no": "NOTIFICATION No. 23/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: notfctn-23-central-tax-english-2019.pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/notfctn-23-central-tax-english-2019.pdf"
    },
    {
      "id": "notif-227",
      "no": "NOTIFICATION No. 24/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: notfctn-24-central-tax-english-2019.pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/notfctn-24-central-tax-english-2019.pdf"
    },
    {
      "id": "notif-228",
      "no": "NOTIFICATION No. 22/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: notfctn-25-central-tax-english-2019.pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/notfctn-25-central-tax-english-2019.pdf"
    },
    {
      "id": "notif-229",
      "no": "NOTIFICATION No. 66/2018 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: notfctn-26-central-tax-english-2019.pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/notfctn-26-central-tax-english-2019.pdf"
    },
    {
      "id": "notif-230",
      "no": "NOTIFICATION No. 27/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: notfctn-27-central-tax-english-2019.pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/notfctn-27-central-tax-english-2019.pdf"
    },
    {
      "id": "notif-231",
      "no": "NOTIFICATION No. 28/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: notfctn-28-central-tax-english-2019.pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/notfctn-28-central-tax-english-2019.pdf"
    },
    {
      "id": "notif-232",
      "no": "NOTIFICATION No. 29/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: notfctn-29-central-tax-english-2019.pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/notfctn-29-central-tax-english-2019.pdf"
    },
    {
      "id": "notif-233",
      "no": "NOTIFICATION No. 2019/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: notfctn-30-central-tax-english-2019.pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/notfctn-30-central-tax-english-2019.pdf"
    },
    {
      "id": "notif-234",
      "no": "NOTIFICATION No. 31/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: notfctn-31-central-tax-english-2019.pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/notfctn-31-central-tax-english-2019.pdf"
    },
    {
      "id": "notif-235",
      "no": "NOTIFICATION No. 78/2019 – CENTRAL TAX",
      "date": "2019-01-01",
      "topic": "CGST Notification in 2019",
      "summary": "Original PDF document: notfctn-78-central-tax-english-2019.pdf",
      "tags": [
        "Notification",
        "2019"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2019/notfctn-78-central-tax-english-2019.pdf"
    },
    {
      "id": "notif-236",
      "no": "NOTIFICATION No. 02/2018 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: download (77).pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/download (77).pdf"
    },
    {
      "id": "notif-237",
      "no": "NOTIFICATION No. 05/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-05-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-05-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-238",
      "no": "NOTIFICATION No. 06/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-06-central-tax-english-2020-corrigendum.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-06-central-tax-english-2020-corrigendum.pdf"
    },
    {
      "id": "notif-239",
      "no": "NOTIFICATION No. 06/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-06-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-06-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-240",
      "no": "NOTIFICATION No. 07/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-07-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-07-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-241",
      "no": "NOTIFICATION No. 08/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-08-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-08-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-242",
      "no": "NOTIFICATION No. 09/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-09-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-09-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-243",
      "no": "NOTIFICATION No. 10/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-10-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-10-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-244",
      "no": "NOTIFICATION No. 11/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-11-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-11-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-245",
      "no": "NOTIFICATION No. 12/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-12-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-12-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-246",
      "no": "NOTIFICATION No. 13/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-13-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-13-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-247",
      "no": "NOTIFICATION No. 14/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-14-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-14-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-248",
      "no": "NOTIFICATION No. 15/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-15-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-15-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-249",
      "no": "NOTIFICATION No. 16/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-16-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-16-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-250",
      "no": "NOTIFICATION No. 17/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-17-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-17-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-251",
      "no": "NOTIFICATION No. 18/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-18-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-18-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-252",
      "no": "NOTIFICATION No. 19/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-19-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-19-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-253",
      "no": "NOTIFICATION No. 20/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-20-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-20-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-254",
      "no": "NOTIFICATION No. 45/2019 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-21-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-21-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-255",
      "no": "NOTIFICATION No. 22/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-22-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-22-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-256",
      "no": "NOTIFICATION No. 23/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-23-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-23-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-257",
      "no": "NOTIFICATION No. 52/2019 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-24-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-24-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-258",
      "no": "NOTIFICATION No. 25/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-25-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-25-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-259",
      "no": "NOTIFICATION No. 29/2019 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-26-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-26-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-260",
      "no": "NOTIFICATION No. 27/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-27-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-27-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-261",
      "no": "NOTIFICATION No. 28/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-28-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-28-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-262",
      "no": "NOTIFICATION No. 29/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-29-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-29-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-263",
      "no": "NOTIFICATION No. 30/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-30-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-30-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-264",
      "no": "NOTIFICATION No. 13/2017 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-31-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-31-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-265",
      "no": "NOTIFICATION No. 76/2018 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-32-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-32-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-266",
      "no": "NOTIFICATION No. 04/2018 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-33-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-33-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-267",
      "no": "NOTIFICATION No. 21/2019 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-34-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-34-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-268",
      "no": "NOTIFICATION No. 05/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-35-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-35-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-269",
      "no": "NOTIFICATION No. 29/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-36-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-36-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-270",
      "no": "NOTIFICATION No. 31/2019 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-37-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-37-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-271",
      "no": "NOTIFICATION No. 38/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-38-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-38-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-272",
      "no": "NOTIFICATION No. 39/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-39-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-39-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-273",
      "no": "NOTIFICATION No. 40/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-40-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-40-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-274",
      "no": "NOTIFICATION No. 41/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-41-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-41-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-275",
      "no": "NOTIFICATION No. 42/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-42-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-42-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-276",
      "no": "NOTIFICATION No. 43/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-43-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-43-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-277",
      "no": "NOTIFICATION No. 44/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-44-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-44-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-278",
      "no": "NOTIFICATION No. 45/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-45-central-tax-english-2020-updated.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-45-central-tax-english-2020-updated.pdf"
    },
    {
      "id": "notif-279",
      "no": "NOTIFICATION No. 46/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-46-central-tax-english-2020-updated.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-46-central-tax-english-2020-updated.pdf"
    },
    {
      "id": "notif-280",
      "no": "NOTIFICATION No. 47/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-47-central-tax-english-2020-updated.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-47-central-tax-english-2020-updated.pdf"
    },
    {
      "id": "notif-281",
      "no": "NOTIFICATION No. 08/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-48-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-48-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-282",
      "no": "NOTIFICATION No. 49/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-49-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-49-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-283",
      "no": "NOTIFICATION No. 50/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-50-central-tax-english-2020-corr.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-50-central-tax-english-2020-corr.pdf"
    },
    {
      "id": "notif-284",
      "no": "NOTIFICATION No. 50/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-50-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-50-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-285",
      "no": "NOTIFICATION No. 13/2017 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-51-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-51-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-286",
      "no": "NOTIFICATION No. 76/2018 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-52-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-52-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-287",
      "no": "NOTIFICATION No. 53/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-53-central-tax-english-2020-corr.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-53-central-tax-english-2020-corr.pdf"
    },
    {
      "id": "notif-288",
      "no": "NOTIFICATION No. 04/2018 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-53-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-53-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-289",
      "no": "NOTIFICATION No. 54/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-54-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-54-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-290",
      "no": "NOTIFICATION No. 55/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-55-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-55-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-291",
      "no": "NOTIFICATION No. 56/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-56-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-56-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-292",
      "no": "NOTIFICATION No. 57/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-57-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-57-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-293",
      "no": "NOTIFICATION No. 58/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-58-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-58-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-294",
      "no": "NOTIFICATION No. 59/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-59-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-59-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-295",
      "no": "NOTIFICATION No. 60/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-60-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-60-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-296",
      "no": "NOTIFICATION No. 61/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-61-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-61-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-297",
      "no": "NOTIFICATION No. 2020/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-62-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-62-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-298",
      "no": "NOTIFICATION No. 63/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-63-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-63-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-299",
      "no": "NOTIFICATION No. 64/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-64-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-64-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-300",
      "no": "NOTIFICATION No. 65/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-65-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-65-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-301",
      "no": "NOTIFICATION No. 66/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-66-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-66-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-302",
      "no": "NOTIFICATION No. 67/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-67-central-tax-english-2020-corr.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-67-central-tax-english-2020-corr.pdf"
    },
    {
      "id": "notif-303",
      "no": "NOTIFICATION No. 67/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-67-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-67-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-304",
      "no": "NOTIFICATION No. 68/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-68-central-tax-english-2020-corr.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-68-central-tax-english-2020-corr.pdf"
    },
    {
      "id": "notif-305",
      "no": "NOTIFICATION No. 68/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-68-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-68-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-306",
      "no": "NOTIFICATION No. 69/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-69-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-69-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-307",
      "no": "NOTIFICATION No. 13/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-70-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-70-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-308",
      "no": "NOTIFICATION No. 71/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-71-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-71-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-309",
      "no": "NOTIFICATION No. 72/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-72-central-tax-english-2020-corr.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-72-central-tax-english-2020-corr.pdf"
    },
    {
      "id": "notif-310",
      "no": "NOTIFICATION No. 72/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-72-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-72-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-311",
      "no": "NOTIFICATION No. 73/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-73-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-73-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-312",
      "no": "NOTIFICATION No. 74/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-74-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-74-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-313",
      "no": "NOTIFICATION No. 2020/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-75-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-75-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-314",
      "no": "NOTIFICATION No. 76/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-76-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-76-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-315",
      "no": "NOTIFICATION No. 47/2019 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-77-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-77-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-316",
      "no": "NOTIFICATION No. 78/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-78-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-78-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-317",
      "no": "NOTIFICATION No. 2020/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-79-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-79-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-318",
      "no": "NOTIFICATION No. 41/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-80-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-80-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-319",
      "no": "NOTIFICATION No. 81/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-81-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-81-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-320",
      "no": "NOTIFICATION No. 72/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-82-central-tax-english-2020-corr.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-82-central-tax-english-2020-corr.pdf"
    },
    {
      "id": "notif-321",
      "no": "NOTIFICATION No. 2020/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-82-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-82-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-322",
      "no": "NOTIFICATION No. 83/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-83-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-83-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-323",
      "no": "NOTIFICATION No. 84/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-84-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-84-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-324",
      "no": "NOTIFICATION No. 85/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-85-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-85-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-325",
      "no": "NOTIFICATION No. 86/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-86-central-tax-english-2020-corr.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-86-central-tax-english-2020-corr.pdf"
    },
    {
      "id": "notif-326",
      "no": "NOTIFICATION No. 86/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-86-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-86-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-327",
      "no": "NOTIFICATION No. 04/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-87-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-87-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-328",
      "no": "NOTIFICATION No. 13/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-88-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-88-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-329",
      "no": "NOTIFICATION No. 89/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-89-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-89-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-330",
      "no": "NOTIFICATION No. 90/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-90-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-90-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-331",
      "no": "NOTIFICATION No. 91/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-91-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-91-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-332",
      "no": "NOTIFICATION No. 92/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-92-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-92-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-333",
      "no": "NOTIFICATION No. 93/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-93-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-93-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-334",
      "no": "NOTIFICATION No. 94/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-94-central-tax-corrigendum-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-94-central-tax-corrigendum-2020.pdf"
    },
    {
      "id": "notif-335",
      "no": "NOTIFICATION No. 2020/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-94-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-94-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-336",
      "no": "NOTIFICATION No. 95/2020 – CENTRAL TAX",
      "date": "2020-01-01",
      "topic": "CGST Notification in 2020",
      "summary": "Original PDF document: notfctn-95-central-tax-english-2020.pdf",
      "tags": [
        "Notification",
        "2020"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2020/notfctn-95-central-tax-english-2020.pdf"
    },
    {
      "id": "notif-337",
      "no": "NOTIFICATION No. 01/2021 – CENTRAL TAX",
      "date": "2021-01-01",
      "topic": "CGST Notification in 2021",
      "summary": "Original PDF document: notfctn-01-central-tax-english-2021.pdf",
      "tags": [
        "Notification",
        "2021"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2021/notfctn-01-central-tax-english-2021.pdf"
    },
    {
      "id": "notif-338",
      "no": "NOTIFICATION No. 02/2017 – CENTRAL TAX",
      "date": "2021-01-01",
      "topic": "CGST Notification in 2021",
      "summary": "Original PDF document: notfctn-02-central-tax-english-2021.pdf",
      "tags": [
        "Notification",
        "2021"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2021/notfctn-02-central-tax-english-2021.pdf"
    },
    {
      "id": "notif-339",
      "no": "NOTIFICATION No. 03/2021 – CENTRAL TAX",
      "date": "2021-01-01",
      "topic": "CGST Notification in 2021",
      "summary": "Original PDF document: notfctn-03-central-tax-english-2021.pdf",
      "tags": [
        "Notification",
        "2021"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2021/notfctn-03-central-tax-english-2021.pdf"
    },
    {
      "id": "notif-340",
      "no": "NOTIFICATION No. 04/2021 – CENTRAL TAX",
      "date": "2021-01-01",
      "topic": "CGST Notification in 2021",
      "summary": "Original PDF document: notfctn-04-central-tax-english-2021.pdf",
      "tags": [
        "Notification",
        "2021"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2021/notfctn-04-central-tax-english-2021.pdf"
    },
    {
      "id": "notif-341",
      "no": "NOTIFICATION No. 05/2021 – CENTRAL TAX",
      "date": "2021-01-01",
      "topic": "CGST Notification in 2021",
      "summary": "Original PDF document: notfctn-05-central-tax-english-2021.pdf",
      "tags": [
        "Notification",
        "2021"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2021/notfctn-05-central-tax-english-2021.pdf"
    },
    {
      "id": "notif-342",
      "no": "NOTIFICATION No. 06/2021 – CENTRAL TAX",
      "date": "2021-01-01",
      "topic": "CGST Notification in 2021",
      "summary": "Original PDF document: notfctn-06-central-tax-english-2021.pdf",
      "tags": [
        "Notification",
        "2021"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2021/notfctn-06-central-tax-english-2021.pdf"
    },
    {
      "id": "notif-343",
      "no": "NOTIFICATION No. 03/2017 – CENTRAL TAX",
      "date": "2021-01-01",
      "topic": "CGST Notification in 2021",
      "summary": "Original PDF document: notfctn-07-central-tax-english-2021.pdf",
      "tags": [
        "Notification",
        "2021"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2021/notfctn-07-central-tax-english-2021.pdf"
    },
    {
      "id": "notif-344",
      "no": "NOTIFICATION No. 08/2021 – CENTRAL TAX",
      "date": "2021-01-01",
      "topic": "CGST Notification in 2021",
      "summary": "Original PDF document: notfctn-08-central-tax-english-2021.pdf",
      "tags": [
        "Notification",
        "2021"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2021/notfctn-08-central-tax-english-2021.pdf"
    },
    {
      "id": "notif-345",
      "no": "NOTIFICATION No. 09/2021 – CENTRAL TAX",
      "date": "2021-01-01",
      "topic": "CGST Notification in 2021",
      "summary": "Original PDF document: notfctn-09-central-tax-english-2021.pdf",
      "tags": [
        "Notification",
        "2021"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2021/notfctn-09-central-tax-english-2021.pdf"
    },
    {
      "id": "notif-346",
      "no": "NOTIFICATION No. 10/2021 – CENTRAL TAX",
      "date": "2021-01-01",
      "topic": "CGST Notification in 2021",
      "summary": "Original PDF document: notfctn-10-central-tax-english-2021.pdf",
      "tags": [
        "Notification",
        "2021"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2021/notfctn-10-central-tax-english-2021.pdf"
    },
    {
      "id": "notif-347",
      "no": "NOTIFICATION No. 11/2021 – CENTRAL TAX",
      "date": "2021-01-01",
      "topic": "CGST Notification in 2021",
      "summary": "Original PDF document: notfctn-11-central-tax-english-2021.pdf",
      "tags": [
        "Notification",
        "2021"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2021/notfctn-11-central-tax-english-2021.pdf"
    },
    {
      "id": "notif-348",
      "no": "NOTIFICATION No. 12/2021 – CENTRAL TAX",
      "date": "2021-01-01",
      "topic": "CGST Notification in 2021",
      "summary": "Original PDF document: notfctn-12-central-tax-english-2021.pdf",
      "tags": [
        "Notification",
        "2021"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2021/notfctn-12-central-tax-english-2021.pdf"
    },
    {
      "id": "notif-349",
      "no": "NOTIFICATION No. 13/2021 – CENTRAL TAX",
      "date": "2021-01-01",
      "topic": "CGST Notification in 2021",
      "summary": "Original PDF document: notfctn-13-central-tax-english-2021.pdf",
      "tags": [
        "Notification",
        "2021"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2021/notfctn-13-central-tax-english-2021.pdf"
    },
    {
      "id": "notif-350",
      "no": "NOTIFICATION No. 14/2021 – CENTRAL TAX",
      "date": "2021-01-01",
      "topic": "CGST Notification in 2021",
      "summary": "Original PDF document: notfctn-14-central-tax-english-2021.pdf",
      "tags": [
        "Notification",
        "2021"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2021/notfctn-14-central-tax-english-2021.pdf"
    },
    {
      "id": "notif-351",
      "no": "NOTIFICATION No. 2021/2021 – CENTRAL TAX",
      "date": "2021-01-01",
      "topic": "CGST Notification in 2021",
      "summary": "Original PDF document: notfctn-15-central-tax-english-2021.pdf",
      "tags": [
        "Notification",
        "2021"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2021/notfctn-15-central-tax-english-2021.pdf"
    },
    {
      "id": "notif-352",
      "no": "NOTIFICATION No. 16/2021 – CENTRAL TAX",
      "date": "2021-01-01",
      "topic": "CGST Notification in 2021",
      "summary": "Original PDF document: notfctn-16-central-tax-english-2021.pdf",
      "tags": [
        "Notification",
        "2021"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2021/notfctn-16-central-tax-english-2021.pdf"
    },
    {
      "id": "notif-353",
      "no": "NOTIFICATION No. 17/2021 – CENTRAL TAX",
      "date": "2021-01-01",
      "topic": "CGST Notification in 2021",
      "summary": "Original PDF document: notfctn-17-central-tax-english-2021.pdf",
      "tags": [
        "Notification",
        "2021"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2021/notfctn-17-central-tax-english-2021.pdf"
    },
    {
      "id": "notif-354",
      "no": "NOTIFICATION No. 18/2021 – CENTRAL TAX",
      "date": "2021-01-01",
      "topic": "CGST Notification in 2021",
      "summary": "Original PDF document: notfctn-18-central-tax-english-2021.pdf",
      "tags": [
        "Notification",
        "2021"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2021/notfctn-18-central-tax-english-2021.pdf"
    },
    {
      "id": "notif-355",
      "no": "NOTIFICATION No. 19/2021 – CENTRAL TAX",
      "date": "2021-01-01",
      "topic": "CGST Notification in 2021",
      "summary": "Original PDF document: notfctn-19-central-tax-english-2021.pdf",
      "tags": [
        "Notification",
        "2021"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2021/notfctn-19-central-tax-english-2021.pdf"
    },
    {
      "id": "notif-356",
      "no": "NOTIFICATION No. 20/2021 – CENTRAL TAX",
      "date": "2021-01-01",
      "topic": "CGST Notification in 2021",
      "summary": "Original PDF document: notfctn-20-central-tax-english-2021.pdf",
      "tags": [
        "Notification",
        "2021"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2021/notfctn-20-central-tax-english-2021.pdf"
    },
    {
      "id": "notif-357",
      "no": "NOTIFICATION No. 21/2021 – CENTRAL TAX",
      "date": "2021-01-01",
      "topic": "CGST Notification in 2021",
      "summary": "Original PDF document: notfctn-21-central-tax-english-2021.pdf",
      "tags": [
        "Notification",
        "2021"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2021/notfctn-21-central-tax-english-2021.pdf"
    },
    {
      "id": "notif-358",
      "no": "NOTIFICATION No. 22/2021 – CENTRAL TAX",
      "date": "2021-01-01",
      "topic": "CGST Notification in 2021",
      "summary": "Original PDF document: notfctn-22-central-tax-english-2021.pdf",
      "tags": [
        "Notification",
        "2021"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2021/notfctn-22-central-tax-english-2021.pdf"
    },
    {
      "id": "notif-359",
      "no": "NOTIFICATION No. 13/2020 – CENTRAL TAX",
      "date": "2021-01-01",
      "topic": "CGST Notification in 2021",
      "summary": "Original PDF document: notfctn-23-central-tax-english-2021.pdf",
      "tags": [
        "Notification",
        "2021"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2021/notfctn-23-central-tax-english-2021.pdf"
    },
    {
      "id": "notif-360",
      "no": "NOTIFICATION No. 24/2021 – CENTRAL TAX",
      "date": "2021-01-01",
      "topic": "CGST Notification in 2021",
      "summary": "Original PDF document: notfctn-24-central-tax-english-2021.pdf",
      "tags": [
        "Notification",
        "2021"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2021/notfctn-24-central-tax-english-2021.pdf"
    },
    {
      "id": "notif-361",
      "no": "NOTIFICATION No. 25/2021 – CENTRAL TAX",
      "date": "2021-01-01",
      "topic": "CGST Notification in 2021",
      "summary": "Original PDF document: notfctn-25-central-tax-english-2021.pdf",
      "tags": [
        "Notification",
        "2021"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2021/notfctn-25-central-tax-english-2021.pdf"
    },
    {
      "id": "notif-362",
      "no": "NOTIFICATION No. 26/2021 – CENTRAL TAX",
      "date": "2021-01-01",
      "topic": "CGST Notification in 2021",
      "summary": "Original PDF document: notfctn-26-central-tax-english-2021.pdf",
      "tags": [
        "Notification",
        "2021"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2021/notfctn-26-central-tax-english-2021.pdf"
    },
    {
      "id": "notif-363",
      "no": "NOTIFICATION No. 27/2021 – CENTRAL TAX",
      "date": "2021-01-01",
      "topic": "CGST Notification in 2021",
      "summary": "Original PDF document: notfctn-27-central-tax-english-2021.pdf",
      "tags": [
        "Notification",
        "2021"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2021/notfctn-27-central-tax-english-2021.pdf"
    },
    {
      "id": "notif-364",
      "no": "NOTIFICATION No. 28/2021 – CENTRAL TAX",
      "date": "2021-01-01",
      "topic": "CGST Notification in 2021",
      "summary": "Original PDF document: notfctn-28-central-tax-english-2021.pdf",
      "tags": [
        "Notification",
        "2021"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2021/notfctn-28-central-tax-english-2021.pdf"
    },
    {
      "id": "notif-365",
      "no": "NOTIFICATION No. 29/2021 – CENTRAL TAX",
      "date": "2021-01-01",
      "topic": "CGST Notification in 2021",
      "summary": "Original PDF document: notfctn-29-central-tax-english-2021.pdf",
      "tags": [
        "Notification",
        "2021"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2021/notfctn-29-central-tax-english-2021.pdf"
    },
    {
      "id": "notif-366",
      "no": "NOTIFICATION No. 30/2021 – CENTRAL TAX",
      "date": "2021-01-01",
      "topic": "CGST Notification in 2021",
      "summary": "Original PDF document: notfctn-30-central-tax-english-2021.pdf",
      "tags": [
        "Notification",
        "2021"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2021/notfctn-30-central-tax-english-2021.pdf"
    },
    {
      "id": "notif-367",
      "no": "NOTIFICATION No. 31/2021 – CENTRAL TAX",
      "date": "2021-01-01",
      "topic": "CGST Notification in 2021",
      "summary": "Original PDF document: notfctn-31-central-tax-english-2021.pdf",
      "tags": [
        "Notification",
        "2021"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2021/notfctn-31-central-tax-english-2021.pdf"
    },
    {
      "id": "notif-368",
      "no": "NOTIFICATION No. 32/2021 – CENTRAL TAX",
      "date": "2021-01-01",
      "topic": "CGST Notification in 2021",
      "summary": "Original PDF document: notfctn-32-central-tax-english-2021.pdf",
      "tags": [
        "Notification",
        "2021"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2021/notfctn-32-central-tax-english-2021.pdf"
    },
    {
      "id": "notif-369",
      "no": "NOTIFICATION No. 33/2021 – CENTRAL TAX",
      "date": "2021-01-01",
      "topic": "CGST Notification in 2021",
      "summary": "Original PDF document: notfctn-33-central-tax-english-2021.pdf",
      "tags": [
        "Notification",
        "2021"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2021/notfctn-33-central-tax-english-2021.pdf"
    },
    {
      "id": "notif-370",
      "no": "NOTIFICATION No. 34/2021 – CENTRAL TAX",
      "date": "2021-01-01",
      "topic": "CGST Notification in 2021",
      "summary": "Original PDF document: notfctn-34-central-tax-english-2021.pdf",
      "tags": [
        "Notification",
        "2021"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2021/notfctn-34-central-tax-english-2021.pdf"
    },
    {
      "id": "notif-371",
      "no": "NOTIFICATION No. 35/2021 – CENTRAL TAX",
      "date": "2021-01-01",
      "topic": "CGST Notification in 2021",
      "summary": "Original PDF document: notfctn-35-central-tax-english-2021.pdf",
      "tags": [
        "Notification",
        "2021"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2021/notfctn-35-central-tax-english-2021.pdf"
    },
    {
      "id": "notif-372",
      "no": "NOTIFICATION No. 36/2021 – CENTRAL TAX",
      "date": "2021-01-01",
      "topic": "CGST Notification in 2021",
      "summary": "Original PDF document: notfctn-36-central-tax-english-2021.pdf",
      "tags": [
        "Notification",
        "2021"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2021/notfctn-36-central-tax-english-2021.pdf"
    },
    {
      "id": "notif-373",
      "no": "NOTIFICATION No. 37/2021 – CENTRAL TAX",
      "date": "2021-01-01",
      "topic": "CGST Notification in 2021",
      "summary": "Original PDF document: notfctn-37-central-tax-english-2021.pdf",
      "tags": [
        "Notification",
        "2021"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2021/notfctn-37-central-tax-english-2021.pdf"
    },
    {
      "id": "notif-374",
      "no": "NOTIFICATION No. 38/2021 – CENTRAL TAX",
      "date": "2021-01-01",
      "topic": "CGST Notification in 2021",
      "summary": "Original PDF document: notfctn-38-central-tax-english-2021.pdf",
      "tags": [
        "Notification",
        "2021"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2021/notfctn-38-central-tax-english-2021.pdf"
    },
    {
      "id": "notif-375",
      "no": "NOTIFICATION No. 39/2021 – CENTRAL TAX",
      "date": "2021-01-01",
      "topic": "CGST Notification in 2021",
      "summary": "Original PDF document: notfctn-39-central-tax-english-2021.pdf",
      "tags": [
        "Notification",
        "2021"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2021/notfctn-39-central-tax-english-2021.pdf"
    },
    {
      "id": "notif-376",
      "no": "NOTIFICATION No. 40/2021 – CENTRAL TAX",
      "date": "2021-01-01",
      "topic": "CGST Notification in 2021",
      "summary": "Original PDF document: notfctn-40-central-tax-english-2021.pdf",
      "tags": [
        "Notification",
        "2021"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2021/notfctn-40-central-tax-english-2021.pdf"
    },
    {
      "id": "notif-377",
      "no": "NOTIFICATION No. 03/2022 – CENTRAL TAX",
      "date": "2022-01-01",
      "topic": "CGST Notification in 2022",
      "summary": "Original PDF document: 03_2022_CT_Eng.pdf",
      "tags": [
        "Notification",
        "2022"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2022/03_2022_CT_Eng.pdf"
    },
    {
      "id": "notif-378",
      "no": "NOTIFICATION No. 04/2022 – CENTRAL TAX",
      "date": "2022-01-01",
      "topic": "CGST Notification in 2022",
      "summary": "Original PDF document: 04_2022_CT_Eng.pdf",
      "tags": [
        "Notification",
        "2022"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2022/04_2022_CT_Eng.pdf"
    },
    {
      "id": "notif-379",
      "no": "NOTIFICATION No. 05/2022 – CENTRAL TAX",
      "date": "2022-01-01",
      "topic": "CGST Notification in 2022",
      "summary": "Original PDF document: 05_2022_CT_Eng.pdf",
      "tags": [
        "Notification",
        "2022"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2022/05_2022_CT_Eng.pdf"
    },
    {
      "id": "notif-380",
      "no": "NOTIFICATION No. 06/2022 – CENTRAL TAX",
      "date": "2022-01-01",
      "topic": "CGST Notification in 2022",
      "summary": "Original PDF document: 06_2022_CT_Eng.pdf",
      "tags": [
        "Notification",
        "2022"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2022/06_2022_CT_Eng.pdf"
    },
    {
      "id": "notif-381",
      "no": "NOTIFICATION No. 07/2022 – CENTRAL TAX",
      "date": "2022-01-01",
      "topic": "CGST Notification in 2022",
      "summary": "Original PDF document: 07_2022_CT_Eng.pdf",
      "tags": [
        "Notification",
        "2022"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2022/07_2022_CT_Eng.pdf"
    },
    {
      "id": "notif-382",
      "no": "NOTIFICATION No. 08/2022 – CENTRAL TAX",
      "date": "2022-01-01",
      "topic": "CGST Notification in 2022",
      "summary": "Original PDF document: 08_2022_CT_Eng.pdf",
      "tags": [
        "Notification",
        "2022"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2022/08_2022_CT_Eng.pdf"
    },
    {
      "id": "notif-383",
      "no": "NOTIFICATION No. 09/2022 – CENTRAL TAX",
      "date": "2022-01-01",
      "topic": "CGST Notification in 2022",
      "summary": "Original PDF document: 09_2022_CT_Eng.pdf",
      "tags": [
        "Notification",
        "2022"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2022/09_2022_CT_Eng.pdf"
    },
    {
      "id": "notif-384",
      "no": "NOTIFICATION No. 10/2022 – CENTRAL TAX",
      "date": "2022-01-01",
      "topic": "SECTION 44 OF THE CENTRAL GOODS AND SERVICES TAX ACT, 2017 - ANNUAL RETURN - EXEMPTION FRO...",
      "summary": "Original PDF document: 10_2022_CT_Eng.pdf",
      "tags": [
        "Notification",
        "2022"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2022/10_2022_CT_Eng.pdf"
    },
    {
      "id": "notif-385",
      "no": "NOTIFICATION No. 11/2022 – CENTRAL TAX",
      "date": "2022-01-01",
      "topic": "SECTION 10, READ WITH SECTION 148 OF THE CENTRAL GOODS AND SERVICES TAX ACT, 2017 - COMPOS...",
      "summary": "Original PDF document: 11_2022_CT_Eng.pdf",
      "tags": [
        "Notification",
        "2022"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2022/11_2022_CT_Eng.pdf"
    },
    {
      "id": "notif-386",
      "no": "NOTIFICATION No. 73/2017 – CENTRAL TAX",
      "date": "2022-01-01",
      "topic": "SECTION 47, READ WITH SECTION 128 OF THE CENTRAL GOODS AND SERVICES TAX ACT, 2017 - RETURN...",
      "summary": "Original PDF document: 12_2022_CT_Eng.pdf",
      "tags": [
        "Notification",
        "2022"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2022/12_2022_CT_Eng.pdf"
    },
    {
      "id": "notif-387",
      "no": "NOTIFICATION No. 13/2022 – CENTRAL TAX",
      "date": "2022-01-01",
      "topic": "SECTION 168A OF THE CENTRAL GOODS AND SERVICES TAX ACT, 2017, READ WITH SECTION 20 OF THE ...",
      "summary": "Original PDF document: 13_2022_CT_Eng.pdf",
      "tags": [
        "Notification",
        "2022"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2022/13_2022_CT_Eng.pdf"
    },
    {
      "id": "notif-388",
      "no": "NOTIFICATION No. 14/2022 – CENTRAL TAX",
      "date": "2022-01-01",
      "topic": "CENTRAL GOODS AND SERVICES TAX (AMENDMENT) RULES, 2022 - AMENDMENT IN RULES 21A, 43, 46, 8...",
      "summary": "Original PDF document: 14_2022_CT_Eng.pdf",
      "tags": [
        "Notification",
        "2022"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2022/14_2022_CT_Eng.pdf"
    },
    {
      "id": "notif-389",
      "no": "NOTIFICATION No. 15/2022 – CENTRAL TAX",
      "date": "2022-01-01",
      "topic": "CGST Notification in 2022",
      "summary": "Original PDF document: 15-2022-ct-eng.pdf",
      "tags": [
        "Notification",
        "2022"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2022/15-2022-ct-eng.pdf"
    },
    {
      "id": "notif-390",
      "no": "NOTIFICATION No. 16/2022 – CENTRAL TAX",
      "date": "2022-01-01",
      "topic": "CGST Notification in 2022",
      "summary": "Original PDF document: 16-2022-ct-eng.pdf",
      "tags": [
        "Notification",
        "2022"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2022/16-2022-ct-eng.pdf"
    },
    {
      "id": "notif-391",
      "no": "NOTIFICATION No. 17/2022 – CENTRAL TAX",
      "date": "2022-01-01",
      "topic": "CGST Notification in 2022",
      "summary": "Original PDF document: 17-2022-ct-eng.pdf",
      "tags": [
        "Notification",
        "2022"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2022/17-2022-ct-eng.pdf"
    },
    {
      "id": "notif-392",
      "no": "NOTIFICATION No. 18/2022 – CENTRAL TAX",
      "date": "2022-01-01",
      "topic": "CGST Notification in 2022",
      "summary": "Original PDF document: 18-2022-ct-eng.pdf",
      "tags": [
        "Notification",
        "2022"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2022/18-2022-ct-eng.pdf"
    },
    {
      "id": "notif-393",
      "no": "NOTIFICATION No. 19/2022 – CENTRAL TAX",
      "date": "2022-01-01",
      "topic": "CGST Notification in 2022",
      "summary": "Original PDF document: 19-2022-ct-eng.pdf",
      "tags": [
        "Notification",
        "2022"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2022/19-2022-ct-eng.pdf"
    },
    {
      "id": "notif-394",
      "no": "NOTIFICATION No. 20/2018 – CENTRAL TAX",
      "date": "2022-01-01",
      "topic": "CGST Notification in 2022",
      "summary": "Original PDF document: 20-2022-ct-eng.pdf",
      "tags": [
        "Notification",
        "2022"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2022/20-2022-ct-eng.pdf"
    },
    {
      "id": "notif-395",
      "no": "NOTIFICATION No. 09/2022 – CENTRAL TAX",
      "date": "2022-01-01",
      "topic": "CGST Notification in 2022",
      "summary": "Original PDF document: 21-2022-ct-eng.pdf",
      "tags": [
        "Notification",
        "2022"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2022/21-2022-ct-eng.pdf"
    },
    {
      "id": "notif-396",
      "no": "NOTIFICATION No. 20/2022 – CENTRAL TAX",
      "date": "2022-01-01",
      "topic": "CGST Notification in 2022",
      "summary": "Original PDF document: corgndm_20ct_eng.pdf",
      "tags": [
        "Notification",
        "2022"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2022/corgndm_20ct_eng.pdf"
    },
    {
      "id": "notif-397",
      "no": "NOTIFICATION No. 22/2022 – CENTRAL TAX",
      "date": "2022-01-01",
      "topic": "CGST Notification in 2022",
      "summary": "Original PDF document: ct22-2022.pdf",
      "tags": [
        "Notification",
        "2022"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2022/ct22-2022.pdf"
    },
    {
      "id": "notif-398",
      "no": "NOTIFICATION No. 23/2022 – CENTRAL TAX",
      "date": "2022-01-01",
      "topic": "CGST Notification in 2022",
      "summary": "Original PDF document: ct23-2022.pdf",
      "tags": [
        "Notification",
        "2022"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2022/ct23-2022.pdf"
    },
    {
      "id": "notif-399",
      "no": "NOTIFICATION No. 24/2022 – CENTRAL TAX",
      "date": "2022-01-01",
      "topic": "CGST Notification in 2022",
      "summary": "Original PDF document: ct24-2022.pdf",
      "tags": [
        "Notification",
        "2022"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2022/ct24-2022.pdf"
    },
    {
      "id": "notif-400",
      "no": "NOTIFICATION No. 25/2022 – CENTRAL TAX",
      "date": "2022-01-01",
      "topic": "CGST Notification in 2022",
      "summary": "Original PDF document: ct25-2022.pdf",
      "tags": [
        "Notification",
        "2022"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2022/ct25-2022.pdf"
    },
    {
      "id": "notif-401",
      "no": "NOTIFICATION No. 26/2022 – CENTRAL TAX",
      "date": "2022-01-01",
      "topic": "CGST Notification in 2022",
      "summary": "Original PDF document: ct26-2022.pdf",
      "tags": [
        "Notification",
        "2022"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2022/ct26-2022.pdf"
    },
    {
      "id": "notif-402",
      "no": "NOTIFICATION No. 27/2022 – CENTRAL TAX",
      "date": "2022-01-01",
      "topic": "CGST Notification in 2022",
      "summary": "Original PDF document: ct27-2022.pdf",
      "tags": [
        "Notification",
        "2022"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2022/ct27-2022.pdf"
    },
    {
      "id": "notif-403",
      "no": "NOTIFICATION No. 01/2022 – CENTRAL TAX",
      "date": "2022-01-01",
      "topic": "CGST Notification in 2022",
      "summary": "Original PDF document: NN_01_2022_English.pdf",
      "tags": [
        "Notification",
        "2022"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2022/NN_01_2022_English.pdf"
    },
    {
      "id": "notif-404",
      "no": "NOTIFICATION No. 02/2022 – CENTRAL TAX",
      "date": "2022-01-01",
      "topic": "CGST Notification in 2022",
      "summary": "Original PDF document: NN_02_2022_English.pdf",
      "tags": [
        "Notification",
        "2022"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2022/NN_02_2022_English.pdf"
    },
    {
      "id": "notif-405",
      "no": "NOTIFICATION No. 01/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: 01-2023-ct-eng.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/01-2023-ct-eng.pdf"
    },
    {
      "id": "notif-406",
      "no": "NOTIFICATION No. 02/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: 02_ENG.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/02_ENG.pdf"
    },
    {
      "id": "notif-407",
      "no": "NOTIFICATION No. 03/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: 03_ENG.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/03_ENG.pdf"
    },
    {
      "id": "notif-408",
      "no": "NOTIFICATION No. 04/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: 04_ENG.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/04_ENG.pdf"
    },
    {
      "id": "notif-409",
      "no": "NOTIFICATION No. 27/2022 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: 05_ENG.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/05_ENG.pdf"
    },
    {
      "id": "notif-410",
      "no": "NOTIFICATION No. 06/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: 06_ENG.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/06_ENG.pdf"
    },
    {
      "id": "notif-411",
      "no": "NOTIFICATION No. 07/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: 07_ENG.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/07_ENG.pdf"
    },
    {
      "id": "notif-412",
      "no": "NOTIFICATION No. 08/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: 08_ENG.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/08_ENG.pdf"
    },
    {
      "id": "notif-413",
      "no": "NOTIFICATION No. 09/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: 09_ENG.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/09_ENG.pdf"
    },
    {
      "id": "notif-414",
      "no": "NOTIFICATION No. 10/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: 10ct_ENG.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/10ct_ENG.pdf"
    },
    {
      "id": "notif-415",
      "no": "NOTIFICATION No. 18/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: 18_ENG.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/18_ENG.pdf"
    },
    {
      "id": "notif-416",
      "no": "NOTIFICATION No. 19/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: 19_ENG.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/19_ENG.pdf"
    },
    {
      "id": "notif-417",
      "no": "NOTIFICATION No. 2023/2026 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: 2026_02_18T00_00_Case_Law____2026__39_Centax_11__S_C____27_01_2026_.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/2026_02_18T00_00_Case_Law____2026__39_Centax_11__S_C____27_01_2026_.pdf"
    },
    {
      "id": "notif-418",
      "no": "NOTIFICATION No. 20/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: 20_ENG.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/20_ENG.pdf"
    },
    {
      "id": "notif-419",
      "no": "NOTIFICATION No. 21/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: 21_ENG.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/21_ENG.pdf"
    },
    {
      "id": "notif-420",
      "no": "NOTIFICATION No. 22/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: 22_ENG.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/22_ENG.pdf"
    },
    {
      "id": "notif-421",
      "no": "NOTIFICATION No. 23/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: 23_ENG.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/23_ENG.pdf"
    },
    {
      "id": "notif-422",
      "no": "NOTIFICATION No. 24/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: 24_ENG.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/24_ENG.pdf"
    },
    {
      "id": "notif-423",
      "no": "NOTIFICATION No. 25/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: 25_ENG.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/25_ENG.pdf"
    },
    {
      "id": "notif-424",
      "no": "NOTIFICATION No. 26/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: 26_ENG.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/26_ENG.pdf"
    },
    {
      "id": "notif-425",
      "no": "NOTIFICATION No. 48/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: 48_ENG.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/48_ENG.pdf"
    },
    {
      "id": "notif-426",
      "no": "NOTIFICATION No. 49/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: 49_ENG.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/49_ENG.pdf"
    },
    {
      "id": "notif-427",
      "no": "NOTIFICATION No. 50/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: 50_ENG.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/50_ENG.pdf"
    },
    {
      "id": "notif-428",
      "no": "NOTIFICATION No. 51/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: 51_ENG.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/51_ENG.pdf"
    },
    {
      "id": "notif-429",
      "no": "NOTIFICATION No. 52/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: 52-2023-CT-Eng.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/52-2023-CT-Eng.pdf"
    },
    {
      "id": "notif-430",
      "no": "NOTIFICATION No. 11/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: gst-ct-11-2023.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/gst-ct-11-2023.pdf"
    },
    {
      "id": "notif-431",
      "no": "NOTIFICATION No. 12/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: gst-ct-12-2023.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/gst-ct-12-2023.pdf"
    },
    {
      "id": "notif-432",
      "no": "NOTIFICATION No. 13/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: gst-ct-13-2023.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/gst-ct-13-2023.pdf"
    },
    {
      "id": "notif-433",
      "no": "NOTIFICATION No. 83/2020 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: gst-ct-14-2023.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/gst-ct-14-2023.pdf"
    },
    {
      "id": "notif-434",
      "no": "NOTIFICATION No. 12/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: gst-ct-15-2023.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/gst-ct-15-2023.pdf"
    },
    {
      "id": "notif-435",
      "no": "NOTIFICATION No. 16/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: gst-ct-16-2023.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/gst-ct-16-2023.pdf"
    },
    {
      "id": "notif-436",
      "no": "NOTIFICATION No. 17/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: gst-ct-17-2023.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/gst-ct-17-2023.pdf"
    },
    {
      "id": "notif-437",
      "no": "NOTIFICATION No. 20/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: gst-ct-27-2023.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/gst-ct-27-2023.pdf"
    },
    {
      "id": "notif-438",
      "no": "NOTIFICATION No. 28/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: gst-ct-28-2023.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/gst-ct-28-2023.pdf"
    },
    {
      "id": "notif-439",
      "no": "NOTIFICATION No. 29/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: gst-ct-29-2023.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/gst-ct-29-2023.pdf"
    },
    {
      "id": "notif-440",
      "no": "NOTIFICATION No. 2023/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: gst-ct-30-2023.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/gst-ct-30-2023.pdf"
    },
    {
      "id": "notif-441",
      "no": "NOTIFICATION No. 31/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: gst-ct-31-2023.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/gst-ct-31-2023.pdf"
    },
    {
      "id": "notif-442",
      "no": "NOTIFICATION No. 32/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: gst-ct-32-2023.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/gst-ct-32-2023.pdf"
    },
    {
      "id": "notif-443",
      "no": "NOTIFICATION No. 33/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: gst-ct-33-2023.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/gst-ct-33-2023.pdf"
    },
    {
      "id": "notif-444",
      "no": "NOTIFICATION No. 34/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: gst-ct-34-2023.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/gst-ct-34-2023.pdf"
    },
    {
      "id": "notif-445",
      "no": "NOTIFICATION No. 5693/5335 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: gst-ct-35-2023.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/gst-ct-35-2023.pdf"
    },
    {
      "id": "notif-446",
      "no": "NOTIFICATION No. 36/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: gst-ct-36-2023.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/gst-ct-36-2023.pdf"
    },
    {
      "id": "notif-447",
      "no": "NOTIFICATION No. 37/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: gst-ct-37-2023.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/gst-ct-37-2023.pdf"
    },
    {
      "id": "notif-448",
      "no": "NOTIFICATION No. 38/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: gst-ct-38-2023.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/gst-ct-38-2023.pdf"
    },
    {
      "id": "notif-449",
      "no": "NOTIFICATION No. 39/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: gst-ct-39-2023.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/gst-ct-39-2023.pdf"
    },
    {
      "id": "notif-450",
      "no": "NOTIFICATION No. 40/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: gst-ct-40-2023.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/gst-ct-40-2023.pdf"
    },
    {
      "id": "notif-451",
      "no": "NOTIFICATION No. 41/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: gst-ct-41-2023.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/gst-ct-41-2023.pdf"
    },
    {
      "id": "notif-452",
      "no": "NOTIFICATION No. 42/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: gst-ct-42-2023.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/gst-ct-42-2023.pdf"
    },
    {
      "id": "notif-453",
      "no": "NOTIFICATION No. 43/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: gst-ct-43-2023.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/gst-ct-43-2023.pdf"
    },
    {
      "id": "notif-454",
      "no": "NOTIFICATION No. 44/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: gst-ct-44-2023.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/gst-ct-44-2023.pdf"
    },
    {
      "id": "notif-455",
      "no": "NOTIFICATION No. 45/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: gst-ct-45-2023.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/gst-ct-45-2023.pdf"
    },
    {
      "id": "notif-456",
      "no": "NOTIFICATION No. 46/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: gst-ct-46-2023.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/gst-ct-46-2023.pdf"
    },
    {
      "id": "notif-457",
      "no": "NOTIFICATION No. 47/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: gst-ct-47-2023.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/gst-ct-47-2023.pdf"
    },
    {
      "id": "notif-458",
      "no": "NOTIFICATION No. 53/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: gst-ct-53-2023.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/gst-ct-53-2023.pdf"
    },
    {
      "id": "notif-459",
      "no": "NOTIFICATION No. 54/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: gst-ct-54-2023.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/gst-ct-54-2023.pdf"
    },
    {
      "id": "notif-460",
      "no": "NOTIFICATION No. 27/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: gst-ct-55-2023.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/gst-ct-55-2023.pdf"
    },
    {
      "id": "notif-461",
      "no": "NOTIFICATION No. 56/2023 – CENTRAL TAX",
      "date": "2023-01-01",
      "topic": "CGST Notification in 2023",
      "summary": "Original PDF document: gst-ct-56-2023.pdf",
      "tags": [
        "Notification",
        "2023"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2023/gst-ct-56-2023.pdf"
    },
    {
      "id": "notif-462",
      "no": "NOTIFICATION No. 01/2024 – CENTRAL TAX",
      "date": "2024-01-01",
      "topic": "CGST Notification in 2024",
      "summary": "Original PDF document: 01-2024-ct-eng.pdf",
      "tags": [
        "Notification",
        "2024"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2024/01-2024-ct-eng.pdf"
    },
    {
      "id": "notif-463",
      "no": "NOTIFICATION No. 02/2024 – CENTRAL TAX",
      "date": "2024-01-01",
      "topic": "CGST Notification in 2024",
      "summary": "Original PDF document: 02-2024-ct-eng.pdf",
      "tags": [
        "Notification",
        "2024"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2024/02-2024-ct-eng.pdf"
    },
    {
      "id": "notif-464",
      "no": "NOTIFICATION No. 03/2024 – CENTRAL TAX",
      "date": "2024-01-01",
      "topic": "CGST Notification in 2024",
      "summary": "Original PDF document: 03-2024-ct-eng.pdf",
      "tags": [
        "Notification",
        "2024"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2024/03-2024-ct-eng.pdf"
    },
    {
      "id": "notif-465",
      "no": "NOTIFICATION No. 04/2024 – CENTRAL TAX",
      "date": "2024-01-01",
      "topic": "CGST Notification in 2024",
      "summary": "Original PDF document: 04-2024-ct-eng.pdf",
      "tags": [
        "Notification",
        "2024"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2024/04-2024-ct-eng.pdf"
    },
    {
      "id": "notif-466",
      "no": "NOTIFICATION No. 05/2024 – CENTRAL TAX",
      "date": "2024-01-01",
      "topic": "CGST Notification in 2024",
      "summary": "Original PDF document: 05-2024-ct-eng.pdf",
      "tags": [
        "Notification",
        "2024"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2024/05-2024-ct-eng.pdf"
    },
    {
      "id": "notif-467",
      "no": "NOTIFICATION No. 10/2024 – CENTRAL TAX",
      "date": "2024-01-01",
      "topic": "CGST Notification in 2024",
      "summary": "Original PDF document: 10_ENG.pdf",
      "tags": [
        "Notification",
        "2024"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2024/10_ENG.pdf"
    },
    {
      "id": "notif-468",
      "no": "NOTIFICATION No. 11/2024 – CENTRAL TAX",
      "date": "2024-01-01",
      "topic": "CGST Notification in 2024",
      "summary": "Original PDF document: 11-2024-ct-eng.pdf",
      "tags": [
        "Notification",
        "2024"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2024/11-2024-ct-eng.pdf"
    },
    {
      "id": "notif-469",
      "no": "NOTIFICATION No. 16/2024 – CENTRAL TAX",
      "date": "2024-01-01",
      "topic": "CGST Notification in 2024",
      "summary": "Original PDF document: 16-2024-ct-eng.pdf",
      "tags": [
        "Notification",
        "2024"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2024/16-2024-ct-eng.pdf"
    },
    {
      "id": "notif-470",
      "no": "NOTIFICATION No. 17/2024 – CENTRAL TAX",
      "date": "2024-01-01",
      "topic": "CGST Notification in 2024",
      "summary": "Original PDF document: 17-2024-ct-eng.pdf",
      "tags": [
        "Notification",
        "2024"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2024/17-2024-ct-eng.pdf"
    },
    {
      "id": "notif-471",
      "no": "NOTIFICATION No. 18/2024 – CENTRAL TAX",
      "date": "2024-01-01",
      "topic": "CGST Notification in 2024",
      "summary": "Original PDF document: 18-2024-ct-eng.pdf",
      "tags": [
        "Notification",
        "2024"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2024/18-2024-ct-eng.pdf"
    },
    {
      "id": "notif-472",
      "no": "NOTIFICATION No. 19/2024 – CENTRAL TAX",
      "date": "2024-01-01",
      "topic": "CGST Notification in 2024",
      "summary": "Original PDF document: 19-2024-ct-eng.pdf",
      "tags": [
        "Notification",
        "2024"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2024/19-2024-ct-eng.pdf"
    },
    {
      "id": "notif-473",
      "no": "NOTIFICATION No. 26/2024 – CENTRAL TAX",
      "date": "2024-01-01",
      "topic": "CGST Notification in 2024",
      "summary": "Original PDF document: 26-2024-ct-eng.pdf",
      "tags": [
        "Notification",
        "2024"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2024/26-2024-ct-eng.pdf"
    },
    {
      "id": "notif-474",
      "no": "NOTIFICATION No. 27/2024 – CENTRAL TAX",
      "date": "2024-01-01",
      "topic": "CGST Notification in 2024",
      "summary": "Original PDF document: 27-2024-ct-eng.pdf",
      "tags": [
        "Notification",
        "2024"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2024/27-2024-ct-eng.pdf"
    },
    {
      "id": "notif-475",
      "no": "NOTIFICATION No. 28/2024 – CENTRAL TAX",
      "date": "2024-01-01",
      "topic": "CGST Notification in 2024",
      "summary": "Original PDF document: 28-2024-ct-eng.pdf",
      "tags": [
        "Notification",
        "2024"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2024/28-2024-ct-eng.pdf"
    },
    {
      "id": "notif-476",
      "no": "NOTIFICATION No. 29/2024 – CENTRAL TAX",
      "date": "2024-01-01",
      "topic": "CGST Notification in 2024",
      "summary": "Original PDF document: 29-2024-ct-eng.pdf",
      "tags": [
        "Notification",
        "2024"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2024/29-2024-ct-eng.pdf"
    },
    {
      "id": "notif-477",
      "no": "NOTIFICATION No. 31/2024 – CENTRAL TAX",
      "date": "2024-01-01",
      "topic": "CGST Notification in 2024",
      "summary": "Original PDF document: 31-2024-ct-eng.pdf",
      "tags": [
        "Notification",
        "2024"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2024/31-2024-ct-eng.pdf"
    },
    {
      "id": "notif-478",
      "no": "NOTIFICATION No. 09/2024 – CENTRAL TAX",
      "date": "2024-01-01",
      "topic": "CGST Notification in 2024",
      "summary": "Original PDF document: central-tax-09_2024_eng_150424.pdf",
      "tags": [
        "Notification",
        "2024"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2024/central-tax-09_2024_eng_150424.pdf"
    },
    {
      "id": "notif-479",
      "no": "NOTIFICATION No. 12/2024 – CENTRAL TAX",
      "date": "2024-01-01",
      "topic": "CGST Notification in 2024",
      "summary": "Original PDF document: central-tax-12-2024-11072024.pdf",
      "tags": [
        "Notification",
        "2024"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2024/central-tax-12-2024-11072024.pdf"
    },
    {
      "id": "notif-480",
      "no": "NOTIFICATION No. 13/2024 – CENTRAL TAX",
      "date": "2024-01-01",
      "topic": "CGST Notification in 2024",
      "summary": "Original PDF document: central-tax-13-2024-11072024.pdf",
      "tags": [
        "Notification",
        "2024"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2024/central-tax-13-2024-11072024.pdf"
    },
    {
      "id": "notif-481",
      "no": "NOTIFICATION No. 14/2024 – CENTRAL TAX",
      "date": "2024-01-01",
      "topic": "CGST Notification in 2024",
      "summary": "Original PDF document: central-tax-14-2024-11072024.pdf",
      "tags": [
        "Notification",
        "2024"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2024/central-tax-14-2024-11072024.pdf"
    },
    {
      "id": "notif-482",
      "no": "NOTIFICATION No. 52/2018 – CENTRAL TAX",
      "date": "2024-01-01",
      "topic": "CGST Notification in 2024",
      "summary": "Original PDF document: central-tax-15-2024-11072024.pdf",
      "tags": [
        "Notification",
        "2024"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2024/central-tax-15-2024-11072024.pdf"
    },
    {
      "id": "notif-483",
      "no": "NOTIFICATION No. 30/2024 – CENTRAL TAX",
      "date": "2024-01-01",
      "topic": "CGST Notification in 2024",
      "summary": "Original PDF document: central-tax-notification-30-11122024.pdf",
      "tags": [
        "Notification",
        "2024"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2024/central-tax-notification-30-11122024.pdf"
    },
    {
      "id": "notif-484",
      "no": "NOTIFICATION No. 20/2024 – CENTRAL TAX",
      "date": "2024-01-01",
      "topic": "CGST Notification in 2024",
      "summary": "Original PDF document: CT-20-2024.pdf",
      "tags": [
        "Notification",
        "2024"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2024/CT-20-2024.pdf"
    },
    {
      "id": "notif-485",
      "no": "NOTIFICATION No. 21/2024 – CENTRAL TAX",
      "date": "2024-01-01",
      "topic": "CGST Notification in 2024",
      "summary": "Original PDF document: CT-21-2024.pdf",
      "tags": [
        "Notification",
        "2024"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2024/CT-21-2024.pdf"
    },
    {
      "id": "notif-486",
      "no": "NOTIFICATION No. 22/2024 – CENTRAL TAX",
      "date": "2024-01-01",
      "topic": "CGST Notification in 2024",
      "summary": "Original PDF document: CT-22-2024.pdf",
      "tags": [
        "Notification",
        "2024"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2024/CT-22-2024.pdf"
    },
    {
      "id": "notif-487",
      "no": "NOTIFICATION No. 23/2024 – CENTRAL TAX",
      "date": "2024-01-01",
      "topic": "CGST Notification in 2024",
      "summary": "Original PDF document: CT-23-2024.pdf",
      "tags": [
        "Notification",
        "2024"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2024/CT-23-2024.pdf"
    },
    {
      "id": "notif-488",
      "no": "NOTIFICATION No. 24/2024 – CENTRAL TAX",
      "date": "2024-01-01",
      "topic": "CGST Notification in 2024",
      "summary": "Original PDF document: CT-24-2024.pdf",
      "tags": [
        "Notification",
        "2024"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2024/CT-24-2024.pdf"
    },
    {
      "id": "notif-489",
      "no": "NOTIFICATION No. 25/2024 – CENTRAL TAX",
      "date": "2024-01-01",
      "topic": "CGST Notification in 2024",
      "summary": "Original PDF document: CT-25-2024.pdf",
      "tags": [
        "Notification",
        "2024"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2024/CT-25-2024.pdf"
    },
    {
      "id": "notif-490",
      "no": "NOTIFICATION No. 06/2024 – CENTRAL TAX",
      "date": "2024-01-01",
      "topic": "CGST Notification in 2024",
      "summary": "Original PDF document: gst-ct-06-2024.pdf",
      "tags": [
        "Notification",
        "2024"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2024/gst-ct-06-2024.pdf"
    },
    {
      "id": "notif-491",
      "no": "NOTIFICATION No. 07/2024 – CENTRAL TAX",
      "date": "2024-01-01",
      "topic": "CGST Notification in 2024",
      "summary": "Original PDF document: gst-ct-07-2024.pdf",
      "tags": [
        "Notification",
        "2024"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2024/gst-ct-07-2024.pdf"
    },
    {
      "id": "notif-492",
      "no": "NOTIFICATION No. 08/2024 – CENTRAL TAX",
      "date": "2024-01-01",
      "topic": "CGST Notification in 2024",
      "summary": "Original PDF document: gst-ct-08-2024.pdf",
      "tags": [
        "Notification",
        "2024"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2024/gst-ct-08-2024.pdf"
    },
    {
      "id": "notif-493",
      "no": "NOTIFICATION No. 01/2025 – CENTRAL TAX",
      "date": "2025-01-01",
      "topic": "CGST Notification in 2025",
      "summary": "Original PDF document: 01-2025-ct-eng.pdf",
      "tags": [
        "Notification",
        "2025"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2025/01-2025-ct-eng.pdf"
    },
    {
      "id": "notif-494",
      "no": "NOTIFICATION No. 02/2025 – CENTRAL TAX",
      "date": "2025-01-01",
      "topic": "CGST Notification in 2025",
      "summary": "Original PDF document: 02-2025-ct-eng.pdf",
      "tags": [
        "Notification",
        "2025"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2025/02-2025-ct-eng.pdf"
    },
    {
      "id": "notif-495",
      "no": "NOTIFICATION No. 03/2025 – CENTRAL TAX",
      "date": "2025-01-01",
      "topic": "CGST Notification in 2025",
      "summary": "Original PDF document: 03-2025-ct-eng.pdf",
      "tags": [
        "Notification",
        "2025"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2025/03-2025-ct-eng.pdf"
    },
    {
      "id": "notif-496",
      "no": "NOTIFICATION No. 04/2025 – CENTRAL TAX",
      "date": "2025-01-01",
      "topic": "CGST Notification in 2025",
      "summary": "Original PDF document: 04-2025-ct-eng.pdf",
      "tags": [
        "Notification",
        "2025"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2025/04-2025-ct-eng.pdf"
    },
    {
      "id": "notif-497",
      "no": "NOTIFICATION No. 05/2025 – CENTRAL TAX",
      "date": "2025-01-01",
      "topic": "CGST Notification in 2025",
      "summary": "Original PDF document: 05-2025-ct-eng.pdf",
      "tags": [
        "Notification",
        "2025"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2025/05-2025-ct-eng.pdf"
    },
    {
      "id": "notif-498",
      "no": "NOTIFICATION No. 06/2025 – CENTRAL TAX",
      "date": "2025-01-01",
      "topic": "CGST Notification in 2025",
      "summary": "Original PDF document: 06-2025-ct-eng.pdf",
      "tags": [
        "Notification",
        "2025"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2025/06-2025-ct-eng.pdf"
    },
    {
      "id": "notif-499",
      "no": "NOTIFICATION No. 09/2025 – CENTRAL TAX",
      "date": "2025-01-01",
      "topic": "CGST Notification in 2025",
      "summary": "Original PDF document: 09-2025-ct-eng.pdf",
      "tags": [
        "Notification",
        "2025"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2025/09-2025-ct-eng.pdf"
    },
    {
      "id": "notif-500",
      "no": "NOTIFICATION No. 19/2025 – CENTRAL TAX",
      "date": "2025-01-01",
      "topic": "CGST Notification in 2025",
      "summary": "Original PDF document: 19-2025-ct.pdf",
      "tags": [
        "Notification",
        "2025"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2025/19-2025-ct.pdf"
    },
    {
      "id": "notif-501",
      "no": "NOTIFICATION No. 20/2025 – CENTRAL TAX",
      "date": "2025-01-01",
      "topic": "CGST Notification in 2025",
      "summary": "Original PDF document: 20-2025-ct.pdf",
      "tags": [
        "Notification",
        "2025"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2025/20-2025-ct.pdf"
    },
    {
      "id": "notif-502",
      "no": "NOTIFICATION No. 13/2025 – CENTRAL TAX",
      "date": "2025-01-01",
      "topic": "CGST Notification in 2025",
      "summary": "Original PDF document: centaltax-13-2025.pdf",
      "tags": [
        "Notification",
        "2025"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2025/centaltax-13-2025.pdf"
    },
    {
      "id": "notif-503",
      "no": "NOTIFICATION No. 14/2025 – CENTRAL TAX",
      "date": "2025-01-01",
      "topic": "CGST Notification in 2025",
      "summary": "Original PDF document: centaltax-14-2025.pdf",
      "tags": [
        "Notification",
        "2025"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2025/centaltax-14-2025.pdf"
    },
    {
      "id": "notif-504",
      "no": "NOTIFICATION No. 15/2025 – CENTRAL TAX",
      "date": "2025-01-01",
      "topic": "CGST Notification in 2025",
      "summary": "Original PDF document: centaltax-15-2025.pdf",
      "tags": [
        "Notification",
        "2025"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2025/centaltax-15-2025.pdf"
    },
    {
      "id": "notif-505",
      "no": "NOTIFICATION No. 16/2025 – CENTRAL TAX",
      "date": "2025-01-01",
      "topic": "CGST Notification in 2025",
      "summary": "Original PDF document: centaltax-16-2025.pdf",
      "tags": [
        "Notification",
        "2025"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2025/centaltax-16-2025.pdf"
    },
    {
      "id": "notif-506",
      "no": "NOTIFICATION No. 07/2025 – CENTRAL TAX",
      "date": "2025-01-01",
      "topic": "CGST Notification in 2025",
      "summary": "Original PDF document: ct-07-2025.pdf",
      "tags": [
        "Notification",
        "2025"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2025/ct-07-2025.pdf"
    },
    {
      "id": "notif-507",
      "no": "NOTIFICATION No. 08/2025 – CENTRAL TAX",
      "date": "2025-01-01",
      "topic": "CGST Notification in 2025",
      "summary": "Original PDF document: ct-08-2025.pdf",
      "tags": [
        "Notification",
        "2025"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2025/ct-08-2025.pdf"
    },
    {
      "id": "notif-508",
      "no": "NOTIFICATION No. 10/2025 – CENTRAL TAX",
      "date": "2025-01-01",
      "topic": "CGST Notification in 2025",
      "summary": "Original PDF document: gst-ct-10-2025.pdf",
      "tags": [
        "Notification",
        "2025"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2025/gst-ct-10-2025.pdf"
    },
    {
      "id": "notif-509",
      "no": "NOTIFICATION No. 11/2025 – CENTRAL TAX",
      "date": "2025-01-01",
      "topic": "CGST Notification in 2025",
      "summary": "Original PDF document: gst-ct-11-2025.pdf",
      "tags": [
        "Notification",
        "2025"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2025/gst-ct-11-2025.pdf"
    },
    {
      "id": "notif-510",
      "no": "NOTIFICATION No. 12/2025 – CENTRAL TAX",
      "date": "2025-01-01",
      "topic": "CGST Notification in 2025",
      "summary": "Original PDF document: gst-ct-12-2025.pdf",
      "tags": [
        "Notification",
        "2025"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2025/gst-ct-12-2025.pdf"
    },
    {
      "id": "notif-511",
      "no": "NOTIFICATION No. 17/2025 – CENTRAL TAX",
      "date": "2025-01-01",
      "topic": "CGST Notification in 2025",
      "summary": "Original PDF document: gst-ct-17-2025.pdf",
      "tags": [
        "Notification",
        "2025"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2025/gst-ct-17-2025.pdf"
    },
    {
      "id": "notif-512",
      "no": "NOTIFICATION No. 18/2025 – CENTRAL TAX",
      "date": "2025-01-01",
      "topic": "CGST Notification in 2025",
      "summary": "Original PDF document: gst-ct-18-2025.pdf",
      "tags": [
        "Notification",
        "2025"
      ],
      "pdfPath": "MASTER DATA/NOTIFICATION/2025/gst-ct-18-2025.pdf"
    },
    {
      "id": "cir1",
      "no": "92/11/2019-GST",
      "date": "2019-03-07",
      "topic": "ITC eligibility on various input services",
      "summary": "Clarifies ITC eligibility on maintenance, repair, entry fees, subscription, and other specific services.",
      "tags": [
        "ITC",
        "input services"
      ]
    },
    {
      "id": "cir2",
      "no": "117/36/2019-GST",
      "date": "2019-09-11",
      "topic": "Place of supply for Information Technology Enabled Services (intermediary)",
      "summary": "Clarifies place of supply for intermediary services and B2B ITES. Intermediary PoS = location of supplier.",
      "tags": [
        "place of supply",
        "intermediary",
        "ITES"
      ]
    },
    {
      "id": "cir3",
      "no": "148/4/2021-GST",
      "date": "2021-05-18",
      "topic": "GST on liquidated damages, penalties, late payment charges",
      "summary": "Liquidated damages, forfeiture amounts received for breach of contract are NOT considered supply of service; hence not taxable.",
      "tags": [
        "liquidated damages",
        "penalty",
        "breach of contract",
        "GST applicability"
      ]
    },
    {
      "id": "cir4",
      "no": "178/10/2022-GST",
      "date": "2022-08-03",
      "topic": "GST on personal guarantee and corporate guarantee",
      "summary": "Clarifies GST implications on guarantees. Personal guarantee by director to bank = no GST (if without consideration). Corporate guarantee = taxable service.",
      "tags": [
        "guarantee",
        "personal guarantee",
        "corporate guarantee",
        "director",
        "banking"
      ]
    },
    {
      "id": "cir5",
      "no": "192/4/2023-GST",
      "date": "2023-07-17",
      "topic": "GST on online gaming, casinos, horse racing",
      "summary": "Online gaming (actionable claims) taxable at 28% on full face value (not net gaming revenue). Casino chips taxable at entry.",
      "tags": [
        "online gaming",
        "casino",
        "horse racing",
        "28%",
        "face value"
      ]
    },
    {
      "id": "cir6",
      "no": "204/16/2023-GST",
      "date": "2023-10-27",
      "topic": "Taxability of personal guarantee and corporate guarantee (revised)",
      "summary": "Revised position: corporate guarantee provided by related party = taxable at 18% GST on 1% of guaranteed amount (or actual consideration, whichever higher).",
      "tags": [
        "corporate guarantee",
        "related party",
        "18%",
        "taxability"
      ]
    },
    {
      "id": "cir7",
      "no": "212/6/2024-GST",
      "date": "2024-06-26",
      "topic": "GST on post-sale discounts — proof of ITC reversal",
      "summary": "For discount-linked credit notes, supplier must ensure receipt of confirmation that recipient has reversed ITC before issuing credit note.",
      "tags": [
        "post-sale discount",
        "credit note",
        "ITC reversal",
        "section 15"
      ]
    },
    {
      "id": "cir8",
      "no": "220/14/2024-GST",
      "date": "2024-08-29",
      "topic": "GST on ESOPs and employee services",
      "summary": "Explains GST treatment on Employee Stock Options (ESOPs) and services by employees. Genuine employer-employee services not taxable.",
      "tags": [
        "ESOP",
        "salary",
        "employee",
        "IPO",
        "stock options"
      ]
    },
    {
      "id": "not1",
      "no": "10/2017-Integrated Tax (Rate)",
      "date": "2017-06-28",
      "topic": "Services under Reverse Charge Mechanism",
      "summary": "Notifies specific categories of services where recipient must pay GST under RCM (e.g., GTA, legal services by advocate, director fees).",
      "tags": [
        "RCM",
        "reverse charge",
        "services",
        "GTA",
        "legal",
        "director fees"
      ]
    },
    {
      "id": "not2",
      "no": "12/2017-Central Tax (Rate)",
      "date": "2017-06-28",
      "topic": "Exempted Services under GST",
      "summary": "Comprehensive list of services exempted from GST including healthcare, education, religious services, government services.",
      "tags": [
        "exemption",
        "healthcare",
        "education",
        "government services"
      ]
    },
    {
      "id": "not3",
      "no": "13/2017-Central Tax (Rate)",
      "date": "2017-06-28",
      "topic": "Services under RCM by Government",
      "summary": "Services received from Government/Local Authority taxable under RCM by recipient.",
      "tags": [
        "government",
        "RCM",
        "local authority"
      ]
    },
    {
      "id": "not4",
      "no": "Notification 2/2019-Central Tax",
      "date": "2019-01-29",
      "topic": "Increase in registration threshold for goods",
      "summary": "Increased GST registration threshold for goods suppliers from ₹20L to ₹40L (not applicable to special category states).",
      "tags": [
        "registration",
        "threshold",
        "₹40L",
        "goods"
      ]
    },
    {
      "id": "not5",
      "no": "Circular No. 183/15/2022-GST",
      "date": "2022-12-27",
      "topic": "ITC on Demo Vehicles — automobile dealers",
      "summary": "ITC on vehicles purchased for demonstration purposes at automobile dealers is NOT blocked under Section 17(5) — available as input service.",
      "tags": [
        "ITC",
        "demo vehicles",
        "automobile dealer",
        "section 17(5)"
      ]
    }
  ],
  "scnTemplates": {
    "sec73_itc_mismatch": {
      "title": "Reply to SCN under Section 73 — ITC Mismatch (GSTR-2A/2B vs 3B)",
      "grounds": [
        {
          "id": "g1",
          "heading": "GSTR-2A is auto-populated, not verified statement of ITC",
          "text": "The GSTR-2A is an auto-populated and dynamic document generated based on suppliers' GSTR-1 filings. It is not a verified statement of purchases made by the recipient and cannot be the sole basis for denying ITC. Reference: Rule 36(4), Circular No.123/42/2019."
        },
        {
          "id": "g2",
          "heading": "Recipient not responsible for supplier default",
          "text": "The noticee is not responsible for failure of suppliers to file returns or pay tax. The noticee has fulfilled all conditions under Section 16(2) — possession of invoice, receipt of goods/services, and filing of returns. Ref: Telangana HC — [2022] 136 taxmann.com 234."
        },
        {
          "id": "g3",
          "heading": "Section 16(2)(c) requires tax paid by supplier — not specific invoice matching",
          "text": "The requirement under Section 16(2)(c) is that tax must have been paid by the supplier to the Government. This cannot be interpreted to mean GSTR-2A matching. If the tax has been deposited, the recipient is entitled to ITC."
        },
        {
          "id": "g4",
          "heading": "Amendment — CGST Amendment Act provides prospective restriction",
          "text": "The restriction relating to GSTR-2B matching was introduced only from October 9, 2019 vide CGST Amendment Act 2018. Any ITC claimed prior to this date cannot be denied on GSTR-2A mismatch grounds."
        },
        {
          "id": "g5",
          "heading": "Transaction genuineness proven by documentary evidence",
          "text": "The noticee submits herewith: (a) original tax invoices, (b) proof of payment to supplier, (c) e-way bills and GRNs, (d) transport documents evidencing actual receipt of goods. The supply is genuine and ITC is validly availed."
        }
      ]
    },
    "sec74_no_fraud": {
      "title": "Reply to SCN under Section 74 — Contesting Fraud/Suppression Allegation",
      "grounds": [
        {
          "id": "g1",
          "heading": "Section 74 not invocable without specific fraud allegations",
          "text": "The SCN invokes Section 74 alleging fraud and wilful misstatement. However, it fails to specify any particular act of fraud, suppression, or wilful misstatement. Mere use of the words \"fraud\" or \"suppression\" without particularity does not trigger Section 74. Reference: M/s Hindustan Steel Works, Supreme Court 2023."
        },
        {
          "id": "g2",
          "heading": "Burden of proof lies on Revenue to prove fraud",
          "text": "Section 74 cast the burden of proof squarely on the Revenue to establish fraud, wilful misstatement or suppression. The SCN contains no specific evidence establishing any of these three elements. In absence of proof, proceedings must be converted to Section 73."
        },
        {
          "id": "g3",
          "heading": "Bona fide difference in interpretation â‰  suppression",
          "text": "The issue in the SCN relates to a genuine difference of interpretation/classification — not any act of concealment. A bona fide belief, even if later found wrong, does not constitute suppression. Reference: Commissioner of Customs v. Calcutta Export Co. (2018) SC; numerous GST judgments post-2017."
        },
        {
          "id": "g4",
          "heading": "Extended limitation period not justified",
          "text": "The extended 5-year period under Section 74 is only available where fraud/suppression exists. Since there is no fraud, the proceedings must be governed by the 3-year limitation under Section 73. The demand is therefore time-barred under Section 73."
        },
        {
          "id": "g5",
          "heading": "Section 75(3) mandates conversion to Section 73 if fraud not established",
          "text": "Section 75(3) expressly provides that where a notice is issued under Section 74 and charges of fraud or wilful misstatement are not proved, the determination shall be made as if the notice was issued under Section 73. Applicable penalty accordingly will be 10% only."
        }
      ]
    },
    "sec73_classification": {
      "title": "Reply to SCN under Section 73 — Classification/Rate Dispute",
      "grounds": [
        {
          "id": "g1",
          "heading": "Classification must be based on essential character and primary use",
          "text": "The correct classification of the supply is based on its essential character as determined by its primary use, function, and the HSN/SAC code. The noticee has applied [HSN/SAC] which accurately reflects the nature of supply."
        },
        {
          "id": "g2",
          "heading": "Department interpretation is overly broad",
          "text": "The interpretation in the SCN applies a broader classification that does not align with the chapter notes, section notes, or explanatory notes to the Customs Tariff (as made applicable for GST). The principle of specific over general classification mandates the lower rate."
        },
        {
          "id": "g3",
          "heading": "Advance ruling/circular supports noticee's classification",
          "text": "The classification adopted by the noticee is supported by: [Advance Ruling No. / Circular reference]. Departmental circulars are binding on departmental officers. Reference: Paper Products Ltd. v. Commissioner (2012)."
        },
        {
          "id": "g4",
          "heading": "Composite supply — rate of principal supply applies",
          "text": "If multiple supplies are involved, this constitutes a composite supply naturally bundled in ordinary course of business. Under Section 8, the rate of the principal supply determines the tax rate for the entire composite supply."
        }
      ]
    },
    "sec129_transit": {
      "title": "Reply / Application for Release under Section 129 — Detention in Transit",
      "grounds": [
        {
          "id": "g1",
          "heading": "Minor/technical breach does not justify detention",
          "text": "The Delhi High Court has repeatedly held that Section 129 cannot be invoked for minor or technical breaches (such as typos in e-way bill, wrong vehicle number, minor quantity variance) where there is no evidence of fraudulent intent. Reference: ANWAR ENTERPRISES v. Commissioner, Delhi HC."
        },
        {
          "id": "g2",
          "heading": "Goods accompanied by valid invoice and e-way bill",
          "text": "The goods are accompanied by (i) a valid tax invoice bearing all required particulars under Rule 46, and (ii) a valid e-way bill. The consignment was within the validity of the e-way bill. Minor discrepancies do not vitiate the accompany documents."
        },
        {
          "id": "g3",
          "heading": "Penalty disproportionate to violation",
          "text": "The penalty proposed is disproportionate to the nature of the alleged breach (which is procedural). Section 126 mandates that penalties be commensurate with gravity of breach. A minor procedural error should attract at most a nominal penalty."
        },
        {
          "id": "g4",
          "heading": "Purchaser/Consignee valid registered person",
          "text": "The consignee is a duly registered person with GSTIN: [GSTIN]. The supply is genuine, the goods are being transported for business purposes, and all taxes on the supply have been/will be paid. No intent to evade GST exists."
        }
      ]
    },
    "refund_rejection": {
      "title": "Appeal against Refund Rejection Order",
      "grounds": [
        {
          "id": "g1",
          "heading": "All conditions for refund satisfied — rejection without cause",
          "text": "The refund application satisfies all conditions under Section 54: (i) excess tax/ITC accumulated due to zero-rated/inverted duty; (ii) application within 2 years; (iii) complete documentation submitted. The rejection order fails to specify valid grounds."
        },
        {
          "id": "g2",
          "heading": "Unjust enrichment: tax incidence borne by applicant",
          "text": "The applicant is the manufacturer/service provider and has borne the entire incidence of input tax. The tax has not been passed on to any customer. Declaration in Form RFD-01A is enclosed. Refund must be paid to applicant under Section 54(5)."
        },
        {
          "id": "g3",
          "heading": "Rule 89 calculation adopted is correct",
          "text": "The refund amount has been calculated strictly as per Rule 89(4)/(4A) formula as applicable. The department has erred in recomputing the Net ITC or turnover figures. Detailed reconciliation statement enclosed."
        },
        {
          "id": "g4",
          "heading": "Interest at 9% p.a. payable if refund delayed post appeal",
          "text": "If the refund is sanctioned pursuant to this appeal, interest at 9% per annum is mandated under Section 56 from the 61st day after the date of the refund application to the date of actual payment."
        }
      ]
    }
  },
  "deadlineRules": {
    "sec73": {
      "scn_from_return": {
        "months": 42,
        "label": "SCN Issue Limit (Sec 73)",
        "note": "From due date of annual return OR date of erroneous refund"
      },
      "order_from_scn": {
        "months": 12,
        "label": "Order Issue Limit (Sec 73)",
        "note": "From date of service of SCN; 3 months if officer below Commissioner"
      },
      "voluntary_before_scn": {
        "days": 0,
        "label": "Pay before SCN â†’ No penalty"
      },
      "voluntary_after_scn": {
        "days": 30,
        "label": "Pay within 30 days of SCN â†’ 25% penalty"
      }
    },
    "sec74": {
      "scn_from_return": {
        "months": 60,
        "label": "SCN Issue Limit (Sec 74)",
        "note": "5 years from due date of annual return"
      },
      "order_from_scn": {
        "months": 36,
        "label": "Order Issue Limit (Sec 74)",
        "note": "3 years from date of service of SCN"
      }
    },
    "sec107_appeal": {
      "taxpayer": {
        "months": 3,
        "label": "Appeal Filing (Taxpayer)",
        "note": "From date of communication of order"
      },
      "condone": {
        "months": 1,
        "label": "Condonation (if sufficient cause)",
        "note": "Additional 1 month"
      },
      "department": {
        "months": 6,
        "label": "Appeal Filing (Department)"
      },
      "pre_deposit_pct": 10,
      "pre_deposit_max_cr": 25
    },
    "sec112_gstat": {
      "appeal": {
        "months": 3,
        "label": "GSTAT Appeal",
        "note": "From Appellate Authority order"
      },
      "pre_deposit_pct": 20,
      "pre_deposit_max_cr": 50
    },
    "sec117_hc": {
      "appeal": {
        "days": 180,
        "label": "High Court Appeal",
        "note": "From GSTAT order (condonable)"
      }
    },
    "sec54_refund": {
      "application": {
        "months": 24,
        "label": "Refund Application Limit",
        "note": "2 years from relevant date"
      },
      "processing": {
        "days": 60,
        "label": "Processing Time",
        "note": "From complete application; interest thereafter"
      }
    }
  },
  "sampleClients": [
    { "id": "CL1", "name": "Sharma Textiles Pvt. Ltd.", "groupName": "Sharma Group", "reference": "REF/2024/MUM", "gstin": "27AAAPM0000M1ZE", "pan": "AAAPM0000M", "constitution": "Private Limited", "mobile": "9820012345", "email": "finance@sharmatextiles.com", "address": "Plot 45, MIDC Andheri East, Mumbai", "portalPassword": "Pass@123" },
    { "id": "CL2", "name": "Rajput Infrastructure Ltd.", "groupName": "Rajput Industries", "reference": "REF/2024/DEL", "gstin": "07AABPR0001K1ZL", "pan": "AABPR0001K", "constitution": "Public Limited", "mobile": "9910055443", "email": "legal@rajputinfra.com", "address": "Okhla Phase III, New Delhi", "portalPassword": "Pass@123" },
    { "id": "CL3", "name": "Green Planet Export House", "groupName": "None", "reference": "REF/2024/VKY", "gstin": "07AACHG0012P1ZT", "pan": "AACHG0012P", "constitution": "Partnership", "mobile": "9811022334", "email": "vicky@greenplanet.in", "address": "Janakpuri District Center, Delhi", "portalPassword": "Pass@123" }
  ],
  "sampleCases": [
    {
      "id": "CASE-2024-001",
      "caseNo": "CGST/2024/001",
      "taxpayerName": "Sharma Textiles Pvt. Ltd.",
      "gstin": "27AAAPM0000M1ZE",
      "pan": "AAAPM0000M",
      "section": "73",
      "period": "FY 2021-22",
      "demandAmount": 1250000,
      "interestAmount": 225000,
      "penaltyAmount": 125000,
      "issue": "ITC mismatch — GSTR-2A vs GSTR-3B discrepancy of ₹12.5L",
      "status": "reply-filed",
      "priority": "high",
      "jurisdiction": "CGST Ward 14, Mumbai",
      "scnDate": "2024-08-15",
      "scnRefNo": "CGST/SCN/2024/0234",
      "replyDate": "2024-09-14",
      "hearingDate": "2024-11-15",
      "notes": "Reply filed challenging ITC mismatch. Waiting for personal hearing under Sec 75(4). Evidence of genuine transactions submitted.",
      "hearings": [
        { "id": "H1", "date": "2026-05-15", "time": "11:00 AM", "authority": "Dy. Commissioner, Mumbai", "type": "Personal Hearing", "status": "Scheduled" }
      ],
      "pendingList": [
        { "id": "T1", "text": "Draft formal reply for ITC mismatch", "dueDate": "2026-05-10", "priority": "high", "status": "pending" },
        { "id": "T2", "text": "Collect bank statements for FY 2021-22", "dueDate": "2026-05-12", "priority": "medium", "status": "pending" }
      ],
      "documents": [],
      "createdAt": "2024-08-16"
    },
    {
      "id": "CASE-2024-002",
      "caseNo": "SGST/2024/047",
      "taxpayerName": "Rajput Infrastructure Ltd.",
      "gstin": "07AABPR0001K1ZL",
      "pan": "AABPR0001K",
      "section": "74",
      "period": "FY 2019-20 to 2021-22",
      "demandAmount": 48500000,
      "interestAmount": 15000000,
      "penaltyAmount": 48500000,
      "issue": "Fake invoice fraud — ITC wrongly availed through non-existent suppliers",
      "status": "appeal-filed",
      "priority": "critical",
      "jurisdiction": "SGST Zone 3, Delhi",
      "scnDate": "2023-12-01",
      "scnRefNo": "SGST/SCN/23/1187",
      "replyDate": "2024-01-10",
      "adjudicationDate": "2024-06-20",
      "appealDate": "2024-09-15",
      "appealRefNo": "CGST/APL/2024/0089",
      "preDeposit": 4850000,
      "notes": "Adjudication order adverse. Appeal filed before Commissioner (Appeals). Pre-deposit of ₹48.5L (10%) paid. Contested Sec 74 invocation — no specific fraud allegation in SCN.",
      "hearings": [
        { "id": "H2", "date": "2026-06-05", "time": "02:30 PM", "authority": "Commissioner (Appeals), Delhi", "type": "First Hearing", "status": "Scheduled" }
      ],
      "pendingList": [
        { "id": "T3", "text": "Prepare paper book for appeal", "dueDate": "2026-05-30", "priority": "high", "status": "pending" }
      ],
      "documents": [],
      "createdAt": "2023-12-02"
    },
    {
      "id": "CASE-2024-003",
      "caseNo": "CGST/2024/089",
      "taxpayerName": "Green Planet Export House",
      "gstin": "07AACHG0012P1ZT",
      "pan": "AACHG0012P",
      "section": "54",
      "period": "FY 2023-24 Q1",
      "demandAmount": 0,
      "refundAmount": 3200000,
      "issue": "Refund of ITC wrongly rejected — zero-rated export supplies",
      "status": "writ-filed",
      "priority": "medium",
      "jurisdiction": "CGST Commissionerate Delhi North",
      "scnDate": "2024-02-10",
      "rejectionDate": "2024-05-25",
      "writDate": "2024-07-18",
      "writRefNo": "W.P.(C) 8934/2024 (Delhi HC)",
      "notes": "Refund of ₹32L on export of services rejected citing \"unjust enrichment\" — incorrectly applied. Writ filed under Article 226. HC admitted matter. Next hearing: 2025-01-15.",
      "documents": [],
      "createdAt": "2024-02-11"
    },
    {
      "id": "CASE-2025-001",
      "caseNo": "CGST/2025/012",
      "taxpayerName": "Metro Logistics Pvt. Ltd.",
      "gstin": "27AADCM0088N1ZK",
      "pan": "AADCM0088N",
      "section": "129",
      "period": "Jan 2025",
      "demandAmount": 185000,
      "interestAmount": 0,
      "penaltyAmount": 185000,
      "issue": "Detention of goods in transit — e-way bill vehicle number mismatch",
      "status": "scn-received",
      "priority": "medium",
      "jurisdiction": "CGST Flying Squad, Pune",
      "scnDate": "2025-01-22",
      "scnRefNo": "FLY/2025/0044",
      "replyDueDate": "2025-02-22",
      "notes": "Goods detained for vehicle number mismatch on e-way bill (different vehicle used due to breakdown). Reply to be filed citing minor technical breach defence — Delhi HC rulings.",
      "documents": [],
      "createdAt": "2025-01-23"
    }
  ],
  "sampleNotices": [
    {
      "id": "NOT-2024-001",
      "noticeType": "SCN",
      "section": "73",
      "refNo": "CGST/SCN/2024/0234",
      "taxpayerName": "Sharma Textiles Pvt. Ltd.",
      "gstin": "27AAAPM0000M1ZE",
      "issuedDate": "2024-08-15",
      "dueDate": "2024-09-14",
      "respondedDate": "2024-09-14",
      "amount": 1600000,
      "status": "replied",
      "caseId": "CASE-2024-001"
    },
    {
      "id": "NOT-2024-002",
      "noticeType": "SCN",
      "section": "74",
      "refNo": "SGST/SCN/23/1187",
      "taxpayerName": "Rajput Infrastructure Ltd.",
      "gstin": "07AABPR0001K1ZL",
      "issuedDate": "2023-12-01",
      "dueDate": "2024-01-10",
      "respondedDate": "2024-01-10",
      "amount": 112000000,
      "status": "replied",
      "caseId": "CASE-2024-002"
    },
    {
      "id": "NOT-2024-003",
      "noticeType": "Audit-Memo",
      "section": "65",
      "refNo": "AUD/2024/0567",
      "taxpayerName": "Sharma Textiles Pvt. Ltd.",
      "gstin": "27AAAPM0000M1ZE",
      "issuedDate": "2024-11-01",
      "dueDate": "2024-11-22",
      "respondedDate": null,
      "amount": 0,
      "status": "pending",
      "caseId": "CASE-2024-001"
    },
    {
      "id": "NOT-2025-001",
      "noticeType": "Detention",
      "section": "129",
      "refNo": "FLY/2025/0044",
      "taxpayerName": "Metro Logistics Pvt. Ltd.",
      "gstin": "27AADCM0088N1ZK",
      "issuedDate": "2025-01-22",
      "dueDate": "2025-02-22",
      "respondedDate": null,
      "amount": 370000,
      "status": "pending",
      "caseId": "CASE-2025-001"
    },
    {
      "id": "NOT-2025-002",
      "noticeType": "ASMT-10",
      "section": "61",
      "refNo": "SCR/2025/0091",
      "taxpayerName": "Green Planet Export House",
      "gstin": "07AACHG0012P1ZT",
      "issuedDate": "2025-01-30",
      "dueDate": "2025-02-19",
      "respondedDate": null,
      "amount": 0,
      "status": "pending",
      "caseId": "CASE-2024-003"
    }
  ],
  "gstinRegex": {},
  "clauseBank": [
    {
      "id": "cb1",
      "topic": "Limitation Period (Section 73)",
      "heading": "Notice Issued Beyond Statutory Time Limit is Time-Barred and Void Ab Initio",
      "text": "It is respectfully submitted that the present Show Cause Notice has been issued beyond the statutory time limit prescribed under Section 73(10) of the CGST Act, 2017. As per the said Section, the order is required to be issued within three years from the due date of furnishing the annual return for the relevant financial year, and the SCN is required to be issued at least three months prior to the time limit specified for issuance of order. In the instant case, the SCN has been issued on [SCN Date], which is clearly beyond the permissible statutory timeline. The Hon'ble High Courts in numerous judgments, including the recent decision of the Hon'ble Patna High Court in S.S. Enterprises, have categorically held that demands raised beyond the limitation period are void ab initio. Therefore, the present proceedings are liable to be dropped forthwith."
    },
    {
      "id": "cb2",
      "topic": "Limitation Period (Section 74)",
      "heading": "Invocability of Extended Period of Limitation under Section 74 is Unjustified",
      "text": "The Noticee vehemently denies the invocation of the extended period of limitation under Section 74 of the CGST Act, 2017. The department has failed to adduce any positive evidence of 'fraud', 'wilful misstatement', or 'suppression of facts' with the specific 'intent to evade tax'. Mere difference in interpretation of law, classification disputes, or mismatch of data between various returns (which are available on the common portal) cannot, by any stretch of imagination, be equated with suppression. The Hon'ble Supreme Court in a catena of judgments, including Hindustan Steel Works Construction Ltd., has settled the law that the burden to prove fraud lies heavily on the Revenue, and in the absence of mens rea or deliberate withholding of information, the extended period cannot be invoked. Consequently, the demand is barred by limitation and must be set aside."
    },
    {
      "id": "cb3",
      "topic": "Natural Justice",
      "heading": "Violation of Principles of Natural Justice - Mandatory Personal Hearing Denied",
      "text": "The Noticee humbly submits that the present proceedings are vitiated on account of gross violation of the principles of natural justice. Section 75(4) of the CGST Act strictly mandates that an opportunity of personal hearing must be granted where a request is received in writing from the person chargeable with tax or penalty, or where any adverse decision is contemplated against such person. The Hon'ble Madras High Court in the case of Signet Industries Ltd. v. State Tax Officer (2024 TAXSCAN (HC) 2171) has unequivocally held that passing an adverse order without extending an opportunity of personal hearing is a fatal flaw rendering the order entirely unlawful. We hereby explicitly request that a personal hearing be granted before any adverse view is formed."
    },
    {
      "id": "cb4",
      "topic": "ITC Mismatch (2A/2B vs 3B)",
      "heading": "Denial of ITC merely on the basis of Mismatch with GSTR-2A/2B is Legally Untenable",
      "text": "The demand proposing to disallow the Input Tax Credit (ITC) solely on the ground of mismatch between the GSTR-3B filed by the Noticee and the auto-populated GSTR-2A/2B is legally unsustainable. The Noticee has satisfied all four fundamental conditions enshrined under Section 16(2) of the CGST Act, 2017, viz., possession of valid tax invoices, actual receipt of goods/services, payment of consideration to the supplier, and filing of the requisite returns. The Noticee cannot be penalized for the supplier's failure or delay in uploading the invoices on the GST portal, which is a procedural lapse beyond the Noticee's control. Relying on the doctrine of impossibility of performance (lex non cogit ad impossibilia) and various High Court rulings, the substantive right to ITC, which has accrued upon fulfillment of statutory conditions, cannot be denied merely due to vendor default."
    },
    {
      "id": "cb5",
      "topic": "Jurisdiction",
      "heading": "Lack of Proper Authority and Jurisdiction",
      "text": "At the outset, the Noticee challenges the assumption of jurisdiction by the Ld. Adjudicating Authority. It is submitted that the officer issuing the present Show Cause Notice lacks the requisite monetary/territorial jurisdiction or the proper authorization under the CGST Act and corresponding circulars issued by the CBIC (e.g., Circular No. 31/05/2018-GST). It is a settled legal proposition that proceedings initiated without jurisdiction are nullities in the eyes of the law, and any order passed pursuant to a defective SCN suffers from an incurable legal infirmity."
    },
    {
      "id": "cb6",
      "topic": "Penalty",
      "heading": "Imposition of General/Maximum Penalty is Unwarranted and Disproportionate",
      "text": "The proposal to levy a penalty equivalent to the tax amount or under the general penalty provisions is strongly contested. Section 126 of the CGST Act establishes general disciplines related to penalty, expressly prohibiting the imposition of severe penalties for minor breaches or where the taxpayer has voluntarily disclosed the facts. There is absolutely no contumacious conduct, intent to evade tax, or deliberate defiance of the law on the part of the Noticee. The discrepancies, if any, arose out of genuine interpretational issues or bona fide errors. Penal provisions are not mechanically attracted merely because an alleged demand is raised, as held in various landmark judicial pronouncements. Therefore, the proposal to impose penalty must be dropped."
    }
  ]
};

// Utility: format INR
function fmtINR(num) {
  if (!num && num !== 0) return '—';
  if (num >= 10000000) return '₹' + (num/10000000).toFixed(2) + ' Cr';
  if (num >= 100000) return '₹' + (num/100000).toFixed(2) + ' L';
  return '₹' + num.toLocaleString('en-IN');
}

// Utility: format date
function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'});
}

// Utility: days from now
function daysFromNow(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const now = new Date();
  return Math.round((d - now) / 86400000);
}
