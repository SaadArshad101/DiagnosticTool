const mongoose = require("mongoose");

const answerSchema = mongoose.Schema({
  id: String,
  text: String,
  value: Number,
  next: String,
});

const questionSchema = mongoose.Schema({
  id: String,
  text: String,
  description: String,
  resources: String,
  noteinst: String,
  answers: [answerSchema],
  answerType: String,
  tags: [Object],
  scorecardType: String,
  capability: String,
  expanded: Boolean,
});

questionSchema.add({
  children: [questionSchema],
});

const rubricSchema = mongoose.Schema({
  min: Number,
  max: Number,
  title: String,
  text: String,
  level: String,
  entity: String,
  expanded: Boolean,
});

const responseSchema = mongoose.Schema({
  id: String,
  answerId: String,
  notes: String,
});

const swotSchema = mongoose.Schema({
  strengths: [String],
  weaknesses: [String],
  opportunities: [String],
  threats: [String],
});

const themeSchema = mongoose.Schema({
  id: String,
  title: String,
  text: String,
  questions: [questionSchema],
  benefitsAndOutcomes: String,
  picturePath: String,
  expanded: Boolean,
  visible: Boolean,
  coreProcessId: String,
});

const userDiagnosticDataSchema = mongoose.Schema({
  userId: String,
  responses: Object,
  currentTheme: String,
  currentQuestions: Object,
  swot: swotSchema,
  diagnosticNotes: String,
  diagnostic: String,
});

const defaultDiagnosticSchema = mongoose.Schema({
  diagnosticId: {
    type: String,
    unique: true,
  },
});

const tagSchema = mongoose.Schema({
  value: String,
  capabilityId: String,
});

const scorecardQuestionSchema = mongoose.Schema({
  harveyBallText: [String],
  maturityIndicator: String,
  chosenAnswer: String,
});

const capabilitySchema = mongoose.Schema({
  title: String,
  capabilityId: String,
  keyEvidence: String, // This is stored a list of strings stored in <ul></ul> format
  keyEvidenceArray: [String],
  maturity: Number,
  questions: [scorecardQuestionSchema],
});

const scorecardSchema = mongoose.Schema({
  coreProcess: String,
  coreProcessId: String,
  maturity: Number,
  benefitsAndOutcomes: String,
  capabilities: [capabilitySchema],
  processFindings: String,
  processFindingsArray: [String],
  peopleFindings: String,
  peopleFindingsArray: [String],
  technologyFindings: String,
  technologyFindingsArray: [String],
  userAddedFindings1: String,
  userAddedFindingsArray1: [String],
  userAddedFindings2: String,
  userAddedFindingsArray2: [String],
  userAddedFindings3: String,
  userAddedFindingsArray3: [String],
  userAddedFindings4: String,
  userAddedFindingsArray4: [String],
  themeLabel: String,
});

const recommendationSchema = mongoose.Schema({
  recommendationId: String,
  text: String,
  urgency: String,
  impact: String,
  ccp: String,
  maturity: Number,
});

const inventorySchema = mongoose.Schema({
  recommendations: [recommendationSchema],
  name: String,
});

const diagnosticSchema = mongoose.Schema({
  title: String,
  owners: [String],
  text: String,
  picturePath: String,
  rubric: [rubricSchema],
  themes: [themeSchema],
  userData: [userDiagnosticDataSchema],
  roadmap: [[String]],
  showRoadmap: Boolean,
  lock: Boolean,
  isBento: Boolean,
  isDX: Boolean,
  isHarveyBall: Boolean,
  isSWOTVertical: Boolean,
  isScorecard: Boolean,
  hideReport: Boolean,
  tags: [tagSchema],
  aggregratedSwot: Object,
  scorecards: [scorecardSchema],
  aggregratedQuestionNotes: Object,
  aggregratedThemeQuestionNotes: Object,
  aggregatedDiagnosticNotes: String,
  inventory: [inventorySchema],
  inventoryLabels: [String],
  processLabel: String,
});

const templateSchema = mongoose.Schema({
  title: String,
  subtitle: String,
  diagnostic: diagnosticSchema,
});

// User-unique data: responses, currentTheme, currentQuestion

const userSchema = mongoose.Schema({
  email: {
    type: String,
    lowercase: true,
  },
  organization: String,
  organizationRole: String,
  role: String,
  password: String,
  passwordHash: String,
  firstName: String,
  lastName: String,
  diagnostics: [String],
  lastInteraction: Number,
});

module.exports = {
  theme: mongoose.model("Theme", themeSchema),
  diagnostic: mongoose.model("Diagnostic", diagnosticSchema),
  response: mongoose.model("Response", responseSchema),
  rubric: mongoose.model("Rubric", rubricSchema),
  question: mongoose.model("Question", questionSchema),
  swot: mongoose.model("Swot", swotSchema),
  user: mongoose.model("User", userSchema),
  userDiagnosticData: mongoose.model(
    "UserDiagnosticData",
    userDiagnosticDataSchema
  ),
  template: mongoose.model("Template", templateSchema),
  defaultDiagnostic: mongoose.model(
    "DefaultDiagnostic",
    defaultDiagnosticSchema
  ),
  tag: mongoose.model("Tag", tagSchema),
  capability: mongoose.model("Capability", capabilitySchema),
  scorecard: mongoose.model("Scorecard", scorecardSchema),
  scorecardQuestion: mongoose.model(
    "ScorecardQuestion",
    scorecardQuestionSchema
  ),
};
