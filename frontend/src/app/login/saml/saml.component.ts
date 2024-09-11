import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JwtService } from '../../_services/jwt.service';
import { DataService } from '../../_services/data.service';
import addCredentialsToLocalStorageDictionary from '../login.component';

@Component({
  selector: 'app-saml',
  templateUrl: './saml.component.html',
  styleUrls: ['./saml.component.css']
})
export class SamlComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jwt: JwtService,
    private dataService: DataService
  ) { }

  ngOnInit() {
    const token = this.route.snapshot.paramMap.get('jwt');
    const id = this.jwt.decode(token).id;
    localStorage.setItem('jwt', token);
    localStorage.setItem('diagnosticUser', id);

    this.dataService.getUser(id).subscribe(user => {
      addCredentialsToLocalStorageDictionary(id, token, user.email, user.firstName, user.lastName);
    });

    this.router.navigate(['/dashboard']);
  }
}
