import { v4 as uuid } from "uuid";

export abstract class Resource {
  id: string = null;
}

export class Swot extends Resource {
  strengths: string[] = [];
  weaknesses: string[] = [];
  opportunities: string[] = [];
  threats: string[] = [];
}

export class Rubric extends Resource {
  min: number = null;
  max: number = null;
  title = "";
  text = "";
  level = "Diagnostic";
  entity = "";
  expanded = true;
}

export class Answer extends Resource {
  id = uuid();
  text = "";
  value: number = null;
  next = "";
}

export class Question extends Resource {
  id = uuid();
  text: string = null;
  description: string = null;
  resources: string = null;
  noteinst: string = null;
  answers: Answer[] = [new Answer()];
  answerType: string = null;
  tags: object[] = [];
  scorecardType = "";
  capability: string = "";
  children: Question[] = [];
  expanded: boolean;
}

export class Response extends Resource {
  id: string = uuid();
  answerId: string = null;
  notes: string = null;
}

export class Theme extends Resource {
  id = uuid();
  title = "";
  text = "";
  questions: Question[] = [];
  benefitsAndOutcomes = "";
  picturePath = "";
  expanded = true;
  visible = true;
  coreProcessId = "";
}

export class UserDiagnosticData extends Resource {
  userId: string = null;
  // These object initializations are because mongodb is not storing empty objects for some reason
  responses = { s: "s" };
  currentQuestions = {};
  currentTheme = "";
  swot: Swot = new Swot();
  diagnosticNotes: string = "";
  diagnostic;
}

export class Diagnostic extends Resource {
  title = "New Diagnostic";
  text = "";
  themes: Theme[] = [new Theme()];
  rubric: Rubric[] = [new Rubric()];
  roadmap: string[][] = [];
  showRoadmap = true;
  picturePath = "";
  owners: string[] = [];
  userData: UserDiagnosticData[] = [];
  lock = false;
  isBento = false;
  isDX = false;
  isHarveyBall = false;
  isSWOTVertical = false;
  hideReport = false;
  associatedEmails: string[] = [];
  isScorecard = true;
  tags: Tag[] = [];
  scorecards: Scorecard[] = [];
  // Has strengths, weaknesses, opportunities and threats fields, they are strings instead of string[] though
  aggregratedSwot: object = null;
  aggregratedQuestionNotes: object = null;
  aggregratedThemeQuestionNotes: object = null;
  aggregatedDiagnosticNotes = "";
  inventory: Inventory[] = [];
  inventoryLabels: string[] = ["Weak", "", "", "", "Strong"];
  processLabel: string = "Process";
}

export class Template extends Resource {
  title = "New Template";
  subtitle = "Template Description";
  diagnostic: Diagnostic = null;
}

export class User extends Resource {
  email: string = null;
  role: string = "Taker";
  organizationRole: string = null;
  organization: string = null;
  password: string = null;
  passwordHash: string = null;
  firstName: string = null;
  lastName: string = null;
  diagnostics: string[] = [];
  lastInteraction: number = Date.now();
  // These are used in the user-management component for the sole purpose of being used as filter criteria
  associatedDiagnosticNames: string[] = [];
  convertedRoleName: string;
}

export class DefaultDiagnostic extends Resource {
  diagnosticId: string = null;
}

export class Tag extends Resource {
  value: string = null;
  capabilityId: string = null;
}

export class Scorecard extends Resource {
  coreProcess = "";
  coreProcessId = "";
  // This is percent from 0 - 100
  maturity: number;
  benefitsAndOutcomes = "";
  capabilities: Capability[] = [];
  processFindings = "";
  processFindingsArray = [];
  peopleFindings = "";
  peopleFindingsArray = [];
  technologyFindings = "";
  technologyFindingsArray = [];
  userAddedFindings1 = "";
  userAddedFindingsArray1 = [];
  userAddedFindings2 = "";
  userAddedFindingsArray2 = [];
  userAddedFindings3 = "";
  userAddedFindingsArray3 = [];
  userAddedFindings4 = "";
  userAddedFindingsArray4 = [];
  themeLabel = "";
}

export class Capability extends Resource {
  title = "";
  capabilityId = "";
  maturity: number;
  keyEvidence = "";
  keyEvidenceArray = [];
  questions: ScorecardQuestion[] = [];
}

// This is a question within a capability that will be displayed in the scorecard
export class ScorecardQuestion extends Resource {
  maturityIndicator = "";
  harveyBallText = [];
  chosenAnswer = ""; // This is the text of the answer chosen.
}

export class Recommendation extends Resource {
  recommendationId = "1";
  text = "";
  urgency = "";
  impact = "";
  ccp = "";
  maturity = 0;
}

export class Inventory extends Resource {
  recommendations: Recommendation[] = [];
  name: string = "";
}
