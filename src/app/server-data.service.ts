import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../environments/environment';
import { Router } from '@angular/router'

@Injectable({
  providedIn: 'root'
})
export class ServerDataService {
  constructor(private http: HttpClient,private router: Router,) { 
    this.base = environment.backendServerUrl
  }
  base:string = "" 

  getNormalHeaders() {
    return { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
  }
  async handleLogin(u:string,p:string){
    let login = false
    try {
      const logReq:any = await lastValueFrom(this.http.post(this.base + "/user1/login", {username: u, password: p, remember: true}, this.getNormalHeaders()))
      console.log(logReq)
      if(logReq['success']){
        this.saveLoggedinUserData(u,logReq['data']['token'])
        login = true
        this.redirectTo(['']);
      }
      return  {login}
    } catch (error:any) {
      return {login, message:error.message}
    }
  }

  saveLoggedinUserData(user:string, token:string) {
    localStorage.setItem('user', user);
    localStorage.setItem('token', token);
  }

  getConfigs(){
    const configs = environment.serverConfigs
    return configs
  }

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

  checkErrorForAuthentication(err:any){
    if (err.error && err.error.error.code) {
      if (err['status'] == 403 || err['error']['error']['code'] == 'unauthorized' || err['error']['error']['message'] == "Unauthorized access") {
        this.redirectTo(['core','login']);
      }
    }
  }

  redirectTo(page:string[]) {
    this.router.navigate(page);
  }

  async getMetaData(){
    try {
      const req:any = await lastValueFrom(this.http.post(this.base+"/service/"+this.getUserToken().user+"/resetSettings",{},this.getSecureHeader()))
      return { flashcard:   req['data']['flashcard']['data'] , question: req['data']['question']['data']  }
    } catch (error) {
      this.checkErrorForAuthentication(error)
      throw error
    }
  }

  async newRecord(data:any){
    const dt = await lastValueFrom(this.http.put(this.base+"/record/",data, this.getSecureHeader()));
    return dt
  }
 
  async getRecord(id:string){
    try {
      const dt:any = await lastValueFrom(this.http.get(this.base+"/record/"+id, this.getSecureHeader()));
      return dt['data']['data']  
    } catch (error) {
      return {}
    }
  }

  async getFullRecord(id:string){
    try {
      const dt:any = await lastValueFrom(this.http.get(this.base+"/record/"+id, this.getSecureHeader()));
      return dt['data']  
    } catch (error) {
      return {}
    }
  }

  async searchRecord(criteria:any={"structure":"flashcard"}){
    if(!criteria['structure']){
      criteria['structure']="flashcard"
    }
    const dt:any = await lastValueFrom( this.http.post(this.base+"/record",criteria, this.getSecureHeader()))
    return dt['data']['results']
  }

  async editRecord(id:string,newData:any){
    try {
      const update = await lastValueFrom(this.http.put(this.base+"/record/"+id,newData,this.getSecureHeader()))
      return { type: "success", message: "Saved"}
    } catch (error:any) {
      return { type:"danger", message: error.message  }
    }
  }

  async reviewList(data:any={}){
    try {
      const req:any = await lastValueFrom(this.http.post(this.base+"/service/"+this.getUserToken().user+"/reviewCardList",data,this.getSecureHeader()))
      return req['data']
    } catch (error:any) {
      return { type: "danger", message: error.message}
    }
  }

  async deleteCard(id:string){
    const req = await lastValueFrom(this.http.delete(this.base+"/record/"+id ,this.getSecureHeader()))
    return req
  }

  async getAdditionalSettions(key:string){
    try {
      const req:any = await lastValueFrom(this.http.post(this.base+"/service/"+this.getUserToken().user+"/practiceAppSettings",{key:key},this.getSecureHeader()))
      return req['data']
    } catch (error:any) {
      return { type: "danger", message: error.message}
    }
  }
}
