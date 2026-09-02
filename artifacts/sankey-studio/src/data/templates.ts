export type Row = Record<string, string | number>;

export type DatasetTemplate = {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  columns: string[];
  rows: Row[];
  levels: string[];
};

const moneyRows: Row[] = [
  { Source: "Revenue", "Stage 1": "Gross margin", "Stage 2": "People", Value: 420 },
  { Source: "Revenue", "Stage 1": "Gross margin", "Stage 2": "Tools", Value: 185 },
  { Source: "Revenue", "Stage 1": "Gross margin", "Stage 2": "Operations", Value: 255 },
  { Source: "Revenue", "Stage 1": "Operating costs", "Stage 2": "Marketing", Value: 150 },
  { Source: "Revenue", "Stage 1": "Operating costs", "Stage 2": "Facilities", Value: 96 },
  { Source: "Revenue", "Stage 1": "Operating costs", "Stage 2": "Tax & fees", Value: 82 },
  { Source: "Revenue", "Stage 1": "Reinvestment", "Stage 2": "Product", Value: 212 },
  { Source: "Revenue", "Stage 1": "Reinvestment", "Stage 2": "Reserve", Value: 105 },
];

export const datasetTemplates: DatasetTemplate[] = [
  {
    id: "money",
    title: "Where does the money go?",
    eyebrow: "Finance / FY24",
    description: "A clean read on how revenue becomes operating decisions.",
    columns: ["Source", "Stage 1", "Stage 2", "Value"],
    rows: moneyRows,
    levels: ["Source", "Stage 1", "Stage 2"],
  },
  {
    id: "time",
    title: "Where does the time go?",
    eyebrow: "Operations / Weekly",
    description: "Find the quiet hours hiding inside a busy week.",
    columns: ["Source", "Stage 1", "Stage 2", "Value"],
    rows: [
      { Source: "Team week", "Stage 1": "Build", "Stage 2": "Deep work", Value: 116 },
      { Source: "Team week", "Stage 1": "Build", "Stage 2": "Reviews", Value: 42 },
      { Source: "Team week", "Stage 1": "Run", "Stage 2": "Support", Value: 82 },
      { Source: "Team week", "Stage 1": "Run", "Stage 2": "Meetings", Value: 68 },
      { Source: "Team week", "Stage 1": "Grow", "Stage 2": "Learning", Value: 34 },
      { Source: "Team week", "Stage 1": "Grow", "Stage 2": "Planning", Value: 26 },
    ],
    levels: ["Source", "Stage 1", "Stage 2"],
  },
  {
    id: "stuck",
    title: "Where does the work get stuck?",
    eyebrow: "Delivery / Q3",
    description: "The handoffs that turn momentum into waiting.",
    columns: ["Source", "Stage 1", "Stage 2", "Value"],
    rows: [
      { Source: "Requests", "Stage 1": "Triage", "Stage 2": "Waiting for context", Value: 46 },
      { Source: "Requests", "Stage 1": "Triage", "Stage 2": "Ready", Value: 71 },
      { Source: "Requests", "Stage 1": "Build", "Stage 2": "Review queue", Value: 38 },
      { Source: "Requests", "Stage 1": "Build", "Stage 2": "In progress", Value: 64 },
      { Source: "Requests", "Stage 1": "Launch", "Stage 2": "QA", Value: 27 },
      { Source: "Requests", "Stage 1": "Launch", "Stage 2": "Released", Value: 51 },
    ],
    levels: ["Source", "Stage 1", "Stage 2"],
  },
  {
    id: "revenue",
    title: "Where does revenue disappear?",
    eyebrow: "Commercial / H1",
    description: "Trace the distance between a signed deal and collected cash.",
    columns: ["Source", "Stage 1", "Stage 2", "Value"],
    rows: [
      { Source: "Booked revenue", "Stage 1": "Discounts", "Stage 2": "Promotions", Value: 124 },
      { Source: "Booked revenue", "Stage 1": "Discounts", "Stage 2": "Credits", Value: 46 },
      { Source: "Booked revenue", "Stage 1": "Churn", "Stage 2": "Early exits", Value: 82 },
      { Source: "Booked revenue", "Stage 1": "Churn", "Stage 2": "Contraction", Value: 58 },
      { Source: "Booked revenue", "Stage 1": "Collection", "Stage 2": "Collected", Value: 610 },
      { Source: "Booked revenue", "Stage 1": "Collection", "Stage 2": "Overdue", Value: 94 },
    ],
    levels: ["Source", "Stage 1", "Stage 2"],
  },
  {
    id: "rework",
    title: "Where does rework happen?",
    eyebrow: "Quality / Monthly",
    description: "See which decisions make their way back upstream.",
    columns: ["Source", "Stage 1", "Stage 2", "Value"],
    rows: [
      { Source: "Tickets", "Stage 1": "Intake", "Stage 2": "Clear first pass", Value: 92 },
      { Source: "Tickets", "Stage 1": "Intake", "Stage 2": "Clarify", Value: 31 },
      { Source: "Tickets", "Stage 1": "Design", "Stage 2": "Approved", Value: 66 },
      { Source: "Tickets", "Stage 1": "Design", "Stage 2": "Revised", Value: 24 },
      { Source: "Tickets", "Stage 1": "Build", "Stage 2": "Passed QA", Value: 72 },
      { Source: "Tickets", "Stage 1": "Build", "Stage 2": "Returned", Value: 19 },
    ],
    levels: ["Source", "Stage 1", "Stage 2"],
  },
  {
    id: "data",
    title: "Where does the data go?",
    eyebrow: "Data / Current",
    description: "Make the movement from capture to decision legible.",
    columns: ["Source", "Stage 1", "Stage 2", "Value"],
    rows: [
      { Source: "Events", "Stage 1": "Collection", "Stage 2": "Warehouse", Value: 380 },
      { Source: "Events", "Stage 1": "Collection", "Stage 2": "Dropped", Value: 22 },
      { Source: "Events", "Stage 1": "Enrichment", "Stage 2": "CRM", Value: 142 },
      { Source: "Events", "Stage 1": "Enrichment", "Stage 2": "Models", Value: 96 },
      { Source: "Events", "Stage 1": "Activation", "Stage 2": "Reports", Value: 188 },
      { Source: "Events", "Stage 1": "Activation", "Stage 2": "Alerts", Value: 74 },
    ],
    levels: ["Source", "Stage 1", "Stage 2"],
  },
  {
    id: "ai",
    title: "What is AI changing?",
    eyebrow: "Work / Scenario",
    description: "Compare the shape of work before and after assistance.",
    columns: ["Source", "Stage 1", "Stage 2", "Value"],
    rows: [
      { Source: "Weekly work", "Stage 1": "Before AI", "Stage 2": "Drafting", Value: 92 },
      { Source: "Weekly work", "Stage 1": "Before AI", "Stage 2": "Searching", Value: 56 },
      { Source: "Weekly work", "Stage 1": "With AI", "Stage 2": "Drafting", Value: 38 },
      { Source: "Weekly work", "Stage 1": "With AI", "Stage 2": "Reviewing", Value: 73 },
      { Source: "Weekly work", "Stage 1": "With AI", "Stage 2": "Thinking", Value: 84 },
    ],
    levels: ["Source", "Stage 1", "Stage 2"],
  },
  {
    id: "depend",
    title: "Who does the organization depend on?",
    eyebrow: "People / Risk map",
    description: "A quiet way to see concentration before it becomes a risk.",
    columns: ["Source", "Stage 1", "Stage 2", "Value"],
    rows: [
      { Source: "Critical work", "Stage 1": "Product", "Stage 2": "Mina K.", Value: 84 },
      { Source: "Critical work", "Stage 1": "Product", "Stage 2": "Noah R.", Value: 42 },
      { Source: "Critical work", "Stage 1": "Revenue", "Stage 2": "Leila S.", Value: 68 },
      { Source: "Critical work", "Stage 1": "Revenue", "Stage 2": "Owen T.", Value: 31 },
      { Source: "Critical work", "Stage 1": "Operations", "Stage 2": "Inez P.", Value: 57 },
      { Source: "Critical work", "Stage 1": "Operations", "Stage 2": "Sam W.", Value: 36 },
    ],
    levels: ["Source", "Stage 1", "Stage 2"],
  },
];

export const defaultTemplate = datasetTemplates[0];