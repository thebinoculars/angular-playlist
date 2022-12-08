import { Component, OnInit } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Router } from '@angular/router'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  menu: any[]

  constructor(private http: HttpClient, private router: Router) {
  }

  ngOnInit () {
    const session_id = localStorage.getItem('session_id')
    this.http.get(`https://dev.opendrive.com/api/v1/folder/list.json/${session_id}/0`).subscribe(data => {
      this.menu = data['Folders']
    }, err => {
      this.router.navigateByUrl('login')
    })
  }

  logout () {
    localStorage.removeItem('session_id')
    this.router.navigateByUrl('login')
  }
}
