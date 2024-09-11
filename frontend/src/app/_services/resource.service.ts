import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwotSerializer, ThemeSerializer, RubricSerializer, ResponseSerializer,
         DiagnosticSerializer, QuestionSerializer, AnswerSerializer, Serializer, UserSerializer,
         TemplateSerializer, DefaultDiagnosticSerializer, TagSerializer } from './serializer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

import { Resource, Swot, Question, Answer,
  Diagnostic, Theme, Rubric, Response, User, Template, DefaultDiagnostic, Tag} from '../_models/http_resource';

const apiUrl = environment.apiUrl;
const responseEndpoint = environment.responseEndpoint;
const questionEndpoint = environment.questionEndpoint;
const answerEndpoint = environment.answerEndpoint;
const rubricEndpoint = environment.rubricEndpoint;
const diagnosticEndpoint = environment.diagnosticEndpoint;
const themeEndpoint = environment.themeEndpoint;
const userEndpoint = environment.userEndpoint;
const swotEndpoint = environment.swotEndpoint;
const templateEndpoint = environment.templateEndpoint;
const defaultDiagnosticEndpoint = environment.defaultDiagnosticEndpoint;
const tagEndpoint = environment.tagEndpoint;

export class ResourceService<T extends Resource> {

  constructor(private httpClient: HttpClient,
              private url: string,
              private endpoint: string,
              private serializer: Serializer) { }

  public create(item: T): Observable<T> {
    return this.httpClient
    .post<T>(`${this.url}/${this.endpoint}`, this.serializer.toJson(item))
    .pipe(map(data => this.serializer.fromJson(data) as T));
  }

  public update(item: T): Observable<T> {
    return this.httpClient
      .put<T>(`${this.url}/${this.endpoint}/${item.id}`,
        this.serializer.toJson(item))
      .pipe(map(data => this.serializer.fromJson(data) as T));
  }

  read(id: string): Observable<T> {

    // //This is to return null if a resource doesn't exist on the backend
    // this.httpClient
    //   .get(`${this.url}/${this.endpoint}/${id}`).subscribe(response => {
    //     if (response === null) {
    //       return null;
    //     }
    //   });
    return this.httpClient
      .get(`${this.url}/${this.endpoint}/${id}`)
      .pipe(map((data: any) => this.serializer.fromJson(data) as T));
  }

  readAll(): Observable<T[]> {
    return this.httpClient
      .get(`${this.url}/${this.endpoint}`)
      .pipe(map(list => this.convertData(list) as T[]));
  }

  delete(id: string) {
    return this.httpClient.delete(`${this.url}/${this.endpoint}/${id}`, {responseType: 'text'});
  }

  /*
  Converts list of json objects to list of typescript class objects
  */
  private convertData(data: any): T[] {
    const arr = [];

    data.forEach(element => {
      arr.push(JSON.parse(JSON.stringify(this.serializer.fromJson(element))));
    });

    return arr;
  }
}

@Injectable({
  providedIn: 'root'
})
export class SwotService extends ResourceService<Swot> {
  constructor(httpClient: HttpClient) {
    super(
      httpClient,
      apiUrl,
      swotEndpoint,
      SwotSerializer);
  }
}

@Injectable({
  providedIn: 'root'
})
export class ResponseService extends ResourceService<Response> {
  constructor(httpClient: HttpClient) {
    super(
      httpClient,
      apiUrl,
      responseEndpoint,
      ResponseSerializer);
  }
}

@Injectable({
  providedIn: 'root'
})
export class RubricService extends ResourceService<Rubric> {
  constructor(httpClient: HttpClient) {
    super(
      httpClient,
      apiUrl,
      rubricEndpoint,
      RubricSerializer);
  }
}

@Injectable({
  providedIn: 'root'
})
export class AnswerService extends ResourceService<Answer> {
  constructor(httpClient: HttpClient) {
    super(
      httpClient,
      apiUrl,
      answerEndpoint,
      AnswerSerializer);
  }
}

@Injectable({
  providedIn: 'root'
})
export class QuestionService extends ResourceService<Question> {
  constructor(httpClient: HttpClient) {
    super(
      httpClient,
      apiUrl,
      questionEndpoint,
      QuestionSerializer);
  }
}

@Injectable({
  providedIn: 'root'
})
export class DiagnosticService extends ResourceService<Diagnostic> {
  constructor(httpClient: HttpClient) {
    super(
      httpClient,
      apiUrl,
      diagnosticEndpoint,
      DiagnosticSerializer);
  }
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService extends ResourceService<Theme> {
  constructor(httpClient: HttpClient) {
    super(
      httpClient,
      apiUrl,
      themeEndpoint,
      ThemeSerializer);
  }
}

@Injectable({
  providedIn: 'root'
})
export class UserService extends ResourceService<User> {
  constructor(httpClient: HttpClient) {
    super(
      httpClient,
      apiUrl,
      userEndpoint,
      UserSerializer);
  }
}

@Injectable({
  providedIn: 'root'
})
export class TemplateService extends ResourceService<Template> {
  constructor(httpClient: HttpClient) {
    super(
      httpClient,
      apiUrl,
      templateEndpoint,
      TemplateSerializer);
  }
}

@Injectable({
  providedIn: 'root'
})
export class DefaultDiagnosticService extends ResourceService<DefaultDiagnostic> {
  constructor(httpClient: HttpClient) {
    super(
      httpClient,
      apiUrl,
      defaultDiagnosticEndpoint,
      DefaultDiagnosticSerializer);
  }
}

@Injectable({
  providedIn: 'root'
})
export class TagService extends ResourceService<Tag> {
  constructor(httpClient: HttpClient) {
    super(
      httpClient,
      apiUrl,
      tagEndpoint,
      TagSerializer);
  }
}

// If needed, add services for scorecard and capability