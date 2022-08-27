import { Injectable } from '@angular/core';
import { SampleDataService } from './sample-data.service';
import { ServerDataService } from './server-data.service';
@Injectable({
  providedIn: 'root'
})
export class BackendService {
  constructor(public sd: SampleDataService, public sds: ServerDataService) { }

  async login(u:string,p:string){
    await this.sds.handleLogin(u,p)
  }

  async getMetadata(){
    const metadata = await this.sds.getMetaData()
    return metadata

  }

  async searchRecords(text:string){
    const records = await this.sds.searchRecord({})
    return records
  }

  async updateMetadata(){

  }

  async getRecord(id:string){
    const recordData:any = await this.sds.getRecord(id)
    return recordData
  }

  async updateRecord(id:string, data:any){
    const editUpdate = await this.sds.editRecord(id,{data})
    return editUpdate
  }

  getCurrentDate() {
    let dt = new Date();
    let ds = dt.toISOString().split("T");
    return {
      dataUTC: ds[0],
      timeUTC: ds[1],
    };
  }

  newRecordObject(){
    return {
      cardType: "none",
      content: {},
      tags: [],
      reviewAlgorithm: "none",
      reviewEnabled: true,
      reviewDateUTC:0,
      review: {},
      reviewHistory: [],
    }
  }

  validateNewRecord(newRecordData:any){
    let check:{error:boolean, list:[any]} = {  error:false, list:["Validation errors : "] }
    // data check
    // cardType should be present 
    if(!newRecordData['data'].cardType || newRecordData['data'].cardType=="none"){
      check.error = true; check.list.push("Invalid card type")
    }
    // reviewAlg should be present    
    if(!newRecordData['data'].reviewAlgorithm || newRecordData['data'].reviewAlgorithm=="none"){
      check.error = true; check.list.push("Invalid review algorithm")
    }

    if(check.error){
      throw new Error( check.list.join(", ")  )
    }
  }

  validateExistingRecord(){
  }

  async newRecord(fullData:{data:any, metadata:any}){
    let meta:any = { initialRelations:[] }
    if(fullData.metadata['initialRelations']){
      const parts:[] = fullData.metadata['initialRelations'].split(",")
      parts.map(part=>{meta.initialRelations.push({resourceId:part,recNodeType:"node1",label:"flashcard"})})
    }
    const requestData = { data:fullData.data,  structure: "flashcard", metadata: meta }
    this.validateNewRecord(requestData)
    const newRecord:any = await this.sds.newRecord(requestData)
    return { type:'success', message: ` Card created. <a href="/core/edit/${newRecord['data']['newId']}" target="_blank" rel="noopener noreferrer">Edit</a>`}
  }

  async reviewList(){
    const rec = await this.sds.reviewList({})
    return rec
  }

  getServerConfig(){
    return this.sds.getConfigs()
  }

  async deleteCard(id:string){
   const req =  await this.sds.deleteCard(id)
   return req
  }
}