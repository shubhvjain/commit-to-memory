import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServerDataService {
  constructor(private http: HttpClient) { }

  // base:string = "https://svja.in.net" 
  base:string = "http://localhost:4020" 

  getConfigs(){
    const configs = {
      mediaBaseUrl:"http://localhost:4020",
      dataBaseUrl:"http://localhost:4020",
      staticFilesUrl:"https://static.svja.in"
    }
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

  async getMetaData(){
    const req:any = await lastValueFrom(this.http.post(this.base+"/service/"+this.getUserToken().user+"/resetSettings",{},this.getSecureHeader()))
    return req['data']
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

  async searchRecord(criteria:any={"structure":"flashcard"}){
    criteria['structure']="flashcard"
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
}
