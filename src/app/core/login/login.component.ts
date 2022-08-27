import { Component, OnInit } from '@angular/core';
import { BackendService } from 'src/app/backend.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  u:string;
  p:string;
  constructor(private bs:BackendService) { 
    this.p = ""
    this.u = ""
  }

  ngOnInit(): void {
  }

  async login(){
    await this.bs.login(this.u,this.p)
  }

}
