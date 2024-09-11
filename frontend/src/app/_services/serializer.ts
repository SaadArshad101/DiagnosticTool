import { Resource, Swot, Question, Answer,
  Diagnostic, Theme, Rubric, Response, User, Template, DefaultDiagnostic, Tag, Scorecard, Capability, ScorecardQuestion } from '../_models/http_resource';


export interface Serializer {
  fromJson(json: any): Resource;
  toJson(resource: Resource): any;
}

export class GenericSerializer implements Serializer {
  constructor(private attributes: string[], private newlyInitResource: Resource) {}

  fromJson(json: any): Resource {
    const resource = this.newlyInitResource;

    if (json === null) {
      return null;
    }

    resource.id = json['_id'];
    this.attributes.forEach(attribute => {
      resource[attribute] = json[attribute];
    });

    return resource;
  }

  toJson(resource: Resource): any {
    const json = {};

    if (resource.id != null) {
      json['_id'] = resource.id;
    }

    this.attributes.forEach(attribute => {
      json[attribute] = resource[attribute];
    });

    return json;
  }
}

function propertyHelper(resourceType: object) {
  return Object.getOwnPropertyNames(resourceType).filter(name => name !== 'id');
}

/** These exports are specific serializers that convert json outputted from HTTP response to respective objects */

export class SwotExample extends GenericSerializer {
  constructor() {
    super(propertyHelper(new Swot()), new Swot());
  }
}

/** Alternative way of creating serializers from below:
 ** You need to create a new instance of the serializer in the host class however

export class SwotSerializer extends GenericSerializer {
  constructor() {
    super(propertyHelper(new Swot()), new Swot());
  }
}

*/
export const SwotSerializer = new GenericSerializer(propertyHelper(new Swot()), new Swot());
export const ThemeSerializer = new GenericSerializer(propertyHelper(new Theme()), new Theme());
export const AnswerSerializer = new GenericSerializer(propertyHelper(new Answer()), new Answer());
export const QuestionSerializer = new GenericSerializer(propertyHelper(new Question()), new Question());
export const RubricSerializer = new GenericSerializer(propertyHelper(new Rubric()), new Rubric());
export const DiagnosticSerializer = new GenericSerializer(propertyHelper(new Diagnostic()), new Diagnostic());
export const ResponseSerializer = new GenericSerializer(propertyHelper(new Response()), new Response());
export const UserSerializer = new GenericSerializer(propertyHelper(new User()), new User());
export const TemplateSerializer = new GenericSerializer(propertyHelper(new Template()), new Template());
export const DefaultDiagnosticSerializer = new GenericSerializer(propertyHelper(new DefaultDiagnostic()), new DefaultDiagnostic());
export const TagSerializer = new GenericSerializer(propertyHelper(new Tag()), new Tag());
export const ScorecardSerializer = new GenericSerializer(propertyHelper(new Scorecard()), new Scorecard());
export const CapabilitySerializer = new GenericSerializer(propertyHelper(new Capability()), new Capability());
export const ScorecardQuestionSerializer = new GenericSerializer(propertyHelper(new ScorecardQuestion()), new ScorecardQuestion());
