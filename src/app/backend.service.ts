import { Injectable } from '@angular/core';
import { SampleDataService } from './sample-data.service';
@Injectable({
  providedIn: 'root'
})
export class BackendService {

  server:any = {
    url:""
  }

  constructor(public sd: SampleDataService) { }
  
  async getMetadata(){
    const metadata = this.sd.getSample("metadata")
    return metadata["data"]
  }

  async updateMetadata(){

  }

  async getRecord(){

  }

  async updateRecord(){

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
      review: {},
      reviewHistory: [],
    }
  }

  validateNewRecord(newRecordData:any){
    let check:{error:boolean, list:[any]} = {  error:false, list:["Validation errors : "] }
    // data check
    // cardType should be present 
    // reviewAlg should be present
    // console.log(newRecordData)
    if(!newRecordData['data'].cardType || newRecordData['data'].cardType=="none"){
      check.error = true; check.list.push("Invalid card type")
    }
    
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
      parts.map(part=>{
        meta.initialRelations.push({resourceId:part,recNodeType:"node1",label:"flashcard"})
      })
    }
    const requestData = { data:fullData.data,  structure: "flashcard", metadata: meta }
    //console.log(requestData)
    this.validateNewRecord(requestData)

  }
}