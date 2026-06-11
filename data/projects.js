const projects = [
  {
    id: "A01",
    title: "Automated Client Capture & Follow-Up",
    area: "automation",
    tags: ["Make", "Tally", "Google Sheets", "Gmail"],
    description: "Small businesses lose customers not from lack of interest, but from slow response. This pipeline captures every inquiry the moment it arrives, logs it, sends an immediate acknowledgment, and if the owner hasn't responded within 3 hours — follows up automatically to keep the customer warm.",
    overview: "Small businesses lose customers not from lack of interest, but from slow response. This pipeline captures every inquiry the moment it arrives, logs it, sends an immediate acknowledgment, and if the owner hasn't responded within 3 hours — follows up automatically to keep the customer warm. No missed leads, no cold inquiries, no manual work.",
    phases: [
      {
        label: "Phase 1 — Capture & Acknowledge",
        id: "A01a",
        steps: [
          "Customer fills a Tally form with Name, Email, and Message",
          "Make triggers automatically on form submission via webhook",
          "Data logs instantly to a Google Sheets row as a structured record",
          "Customer receives an immediate confirmation email via Gmail"
        ]
      },
      {
        label: "Phase 2 — Smart Follow-Up",
        id: "A01b",
        steps: [
          "Make waits 3 hours via the Sleep module after initial capture",
          "Make searches the owner's Gmail sent folder — did they reply to that customer?",
          "If no reply found → sends the customer a warm follow-up acknowledgment email",
          "If reply found → flow stops quietly, no duplicate sent"
        ]
      }
    ],
    use_cases: [
      {
        title: "Appointment-based businesses",
        desc: "Salons, clinics, consultants — the follow-up email becomes a booking link instead of a plain acknowledgment."
      },
      {
        title: "E-commerce",
        desc: "Form becomes an order inquiry, Sheets becomes an order log, follow-up includes product availability or pricing."
      },
      {
        title: "Agencies",
        desc: "Intake form captures project type and budget, Sheets tags leads by service category, follow-up is personalized per service."
      },
      {
        title: "Event planners",
        desc: "Form captures event date and type, system checks if date is within 30 days and escalates follow-up urgency automatically."
      },
      {
        title: "Multi-staff businesses",
        desc: "Sheets logs which staff member the inquiry was routed to, follow-up only fires if that specific person hasn't replied."
      }
    ],
    learnings: "Two builds, one pipeline. Phase 1 taught how automated systems are pieced together — how Make, Tally, Gmail, and Google Sheets each serve a distinct function, not interchangeable. Got hands-on with webhooks, APIs, and what it means for one system to talk to another. Phase 2 introduced sequencing and conditional logic — the Router module splits a flow into paths based on real data, not just firing linearly. Using Gmail Search to query a sent folder programmatically was unexpected and powerful. The biggest lesson across both: the trigger module must be actively listening before data is sent, and breaking things — renaming a sheet, disconnecting a module — collapses the whole flow. Respect dependencies, document every connection.",
    status: "live",
    date: "2025-01",
    thumbnail: null,
    link: null
  },
  {
    id: "A02",
    title: "Smart Lead Follow-Up",
    area: "automation",
    tags: ["Make", "Tally", "Google Sheets", "Gmail"],
    description: "A single acknowledgment email isn't enough. This build adds a 5-minute delayed follow-up sequence and live status tracking — showing who responded, who didn't, all automatically.",
    overview: "A single acknowledgment email isn't enough. This build extends the intake system with a delayed follow-up sequence and live lead status tracking. After the first email fires, the system waits 300 seconds then sends a second touchpoint automatically — no manual chasing, no missed leads.",
    phases: null,
    use_cases: null,
    how_it_works: [
      "Tally form submission triggers Make via webhook",
      "Make logs the lead to Google Sheets and sends an initial email via Gmail",
      "Sleep module waits 300 seconds (5 minutes)",
      "A second follow-up email fires automatically to the same lead"
    ],
    learnings: "This build was about understanding sequencing inside an automated flow. The Sleep module introduced the concept of timed delays — and its 300 second cap on Make's free plan was a real constraint to work around. Connecting multiple Gmail modules in one scenario showed how the same tool can serve different functions at different points in a flow. Status tracking in Sheets made the whole system visible — not just automated, but auditable.",
    status: "live",
    date: "2025-02",
    thumbnail: null,
    link: null
  },
  {
    id: "A03",
    title: "Client Onboarding System",
    area: "automation",
    tags: ["Make", "Tally", "Google Sheets", "Gmail"],
    description: "Small business owners miss inquiries not because they don't care, but because they're busy. This system makes sure no inquiry goes cold — logging every submission, checking if the owner replied, and sending a warm follow-up if they didn't.",
    overview: "Small business owners miss inquiries not because they don't care, but because they're busy running the business. A customer fills a form, gets no response for hours, and moves on to a competitor. This automation makes sure no inquiry goes cold without at least an acknowledgment — buying the owner time to respond properly while keeping the customer warm.",
    phases: null,
    use_cases: null,
    how_it_works: [
      "Customer fills the Tally form with their name, phone, email, and message",
      "Make instantly logs the inquiry to Google Sheets as a structured record",
      "Make waits 3 hours (60 seconds in test mode) via the Sleep module",
      "Make searches the owner's Gmail sent folder — did they reply to that customer?",
      "If no reply found → sends the customer a follow-up acknowledgment email",
      "If reply found → flow stops quietly, no duplicate sent"
    ],
    learnings: "This was the most complex build so far. Connecting a Tally webhook and mapping form fields into Make taught me how structured data moves between tools. The Router module was new — splitting a flow into conditional paths based on logic rather than just firing linearly. Using Gmail Search to query a sent folder programmatically was unexpected and powerful. The biggest lesson was that the trigger module must be actively listening before data is sent, otherwise the scenario misses the submission entirely — learned that the hard way.",
    status: "live",
    date: "2025-03",
    thumbnail: null,
    link: null
  }
];