import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

import { Swot } from './swot.model';

const uri = 'http://localhost:3000/api/swot/';

@Injectable({
  providedIn: 'root'
})
export class SwotService {

  private swot: Swot = {
    id: null,
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: []
  };
  public swotSubject = new Subject<Swot>();

  constructor(private http: HttpClient) { }

  getSwotUpdateListener() {
    return this.swotSubject.asObservable();
  }

  addSwot(strengths: string[], weaknesses: string[], opportunities: string[], threats: string[]) {
    const swot: Swot = {
      id: null,
      strengths: strengths,
      weaknesses: weaknesses,
      opportunities: opportunities,
      threats: threats
    };

    this.http.post<any>(uri, swot)
    .subscribe(res => {
      swot.id = res._id;

      // To create a deep copy for observable use
      this.swot = JSON.parse(JSON.stringify(swot));

      this.swotSubject.next(this.swot);
    });
  }

  // Todo: integrate add with update to reduce dupe code
  updateSwot(id: string, strengths: string[], weaknesses: string[], opportunities: string[], threats: string[]) {
    const swot: Swot = {
      id: id,
      strengths: strengths,
      weaknesses: weaknesses,
      opportunities: opportunities,
      threats: threats
    };

    this.http.put<any>(uri + id, swot)
    .subscribe(res => {

      // To create a deep copy for observable use
      this.swot = JSON.parse(JSON.stringify(swot));

      this.swotSubject.next(this.swot);
    });
  }

  getSwot(id: string) {
    this.http.get<any>(uri + id)
    .subscribe(res => {
      this.swot.id = res._id;
      this.swot.strengths = res.strengths;
      this.swot.weaknesses = res.weaknesses;
      this.swot.opportunities = res.opportunities;
      this.swot.threats = res.threats;

      // To create a deep copy for observable use
      this.swot = JSON.parse(JSON.stringify(this.swot));
      this.swotSubject.next(this.swot);
    });

    return this.swot;
  }
}
