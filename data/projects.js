const projects = [
  {
    id: "001",
    title: "Automated Form Intake",
    area: "automation",
    tags: ["Make", "Tally", "Google Sheets", "Gmail"],
    description: "Small businesses manually handling customer inquiries lose time and miss leads. This automates the entire capture and acknowledgment process — from form submission to logged data to confirmation email, zero manual work.",
    overview: "Small businesses manually handling customer inquiries lose time and miss leads. This automates the entire capture and acknowledgment process — from form submission to logged data to confirmation email, zero manual work.",
    how_it_works: [
      "Customer fills a Tally form with Name, Email, and Message",
      "Make triggers automatically on form submission via webhook",
      "Data logs instantly to a Google Sheets row",
      "Customer receives a confirmation email automatically via Gmail"
    ],
    learnings: "Built this to understand how automated systems are actually pieced together. Learned how Make, Tally, Gmail, and Google Sheets each serve a distinct function in a workflow — not interchangeable, each with its own role. Got hands-on with webhooks and APIs, and what it actually means for one system to talk to another. The most practical lesson came from breaking things — renaming a sheet or disconnecting a module collapses the whole flow, which taught me to respect dependencies and document every connection before touching anything in production.",
    status: "live",
    date: "2025-01",
    thumbnail: null,
    link: null
  },
  {
    id: "002",
    title: "Smart Lead Follow-Up",
    area: "automation",
    tags: ["Make", "Tally", "Google Sheets", "Gmail"],
    description: "A single acknowledgment email isn't enough. This build adds a 5-minute delayed follow-up sequence and live status tracking — showing who responded, who didn't, all automatically.",
    overview: "A single acknowledgment email isn't enough. This build extends 001 with a delayed follow-up sequence and live lead status tracking. After the first email fires, the system waits 300 seconds then sends a second touchpoint automatically — no manual chasing, no missed leads.",
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
    id: "003",
    title: "Client Onboarding System",
    area: "automation",
    tags: ["Make", "Tally", "Google Sheets", "Gmail"],
    description: "Small business owners miss inquiries not because they don't care, but because they're busy. This system makes sure no inquiry goes cold — logging every submission, checking if the owner replied, and sending a warm follow-up if they didn't.",
    overview: "Small business owners miss inquiries not because they don't care, but because they're busy running the business. A customer fills a form, gets no response for hours, and moves on to a competitor. This automation makes sure no inquiry goes cold without at least an acknowledgment — buying the owner time to respond properly while keeping the customer warm.",
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