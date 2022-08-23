import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServerDataService {
  constructor(private http: HttpClient) { }

  base:string = "https://svja.in.net" 

  checkLogin(){
    const localCheck = this.getUserToken()
    return localCheck.exists
  }
  
  getUserToken(){
    return { exists: localStorage.getItem('token')?true:false, token: localStorage.getItem('token'), user: localStorage.getItem('user') }
  }
  
  getSecureHeader(recKey="") {
    if (localStorage.getItem('token')) {
      let heads:any = { 'Content-Type': 'application/json', 'user-access-token': this.getUserToken().token }
      if(recKey){heads["record-key"]=recKey}
      const httpOptionsSecure = {headers: new HttpHeaders(heads)}
      return httpOptionsSecure;
    } else {
      return { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'user-access-token': 'undefined' }) }
    }
  }

  async getMetaData(){

  }

  async newRecord(data:any){
    const dt = await lastValueFrom(this.http.put(this.base+"/record/",data, this.getSecureHeader()));
    return dt
  }
 
  async getRecord(id:string){

  }

  async searchRecord(criteria:any={"structure":"flashcard"}){
    const dt = await lastValueFrom( this.http.post(this.base+"/record",criteria, this.getSecureHeader()))
    return dt 
  }

  async editRecord(id:string,newData:any){

  }
}
