import { Component, OnInit } from '@angular/core'
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { HttpClient } from '@angular/common/http'


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  username = new FormControl('', Validators.compose([
    Validators.required,
  ]));

  password = new FormControl('', Validators.compose([
    Validators.required,
  ]));

  form: FormGroup = this.fb.group({
    username: this.username,
    password: this.password
  });

  error: string = '';

  constructor(private fb: FormBuilder, private router: Router, private http: HttpClient) { }

  ngOnInit () {
    const session_id = localStorage.getItem('session_id')
    if (session_id) {
      this.http.post(`https://dev.opendrive.com/api/v1/session/exists.json`, {
        session_id: session_id,
      }).subscribe(data => {
        if (data['result']) {
          this.router.navigateByUrl('')
        }
      }, err => {
        this.error = err.error.error.message
      })
    }
  }

  login () {
    this.error = !this.username.value || !this.password.value ? 'Please enter your username and password' : ''
    if (!this.error) {
      this.http.post(`https://dev.opendrive.com/api/v1/session/login.json`, {
        username: this.username.value,
        passwd: this.password.value
      }).subscribe(data => {
        localStorage.setItem('session_id', data['SessionID'])
        this.router.navigateByUrl('')
      }, err => {
        this.error = err.error.error.message
      })
    }
  }

}
