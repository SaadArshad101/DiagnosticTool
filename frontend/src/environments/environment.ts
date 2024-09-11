// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: 'http://localhost/api',
  swotEndpoint: 'swot',
  answerEndpoint: 'answer',
  questionEndpoint: 'question',
  diagnosticEndpoint: 'diagnostic',
  themeEndpoint: 'theme',
  responseEndpoint: 'response',
  rubricEndpoint: 'rubric',
  userEndpoint: 'user',
  loginEndpoint: 'login',
  loginSAMLEndpoint: 'loginSAML',
  templateEndpoint: 'template',
  defaultDiagnosticEndpoint: 'defaultDiagnostic',
  tagEndpoint: 'tag',
  userEmailsAndNamesEndpoint: 'userId',
  addDiagnosticToUserEndpoint: 'addDiagnosticToUser',
  removeDiagnosticFromUserEndpoint: 'removeDiagnosticFromUser',
  logoutTimeout: 3600,
  socketUrl: 'ws://localhost:8080'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
