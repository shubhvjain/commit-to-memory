import { Injectable } from '@angular/core';
import { SampleDataService } from './sample-data.service';
import { ServerDataService } from './server-data.service';
@Injectable({
  providedIn: 'root'
})
export class BackendService {
  constructor(public sd: SampleDataService, public sds: ServerDataService) { }

  async login(u: string, p: string) {
    await this.sds.handleLogin(u, p)
  }

  async getMetadata() {
    const metadata = await this.sds.getMetaData()
    return metadata

  }

  async searchRecords(criteria:any) {
    const records = await this.sds.searchRecord(criteria)
    return records
  }

  async loadCardsWithTag(text: string) {
    const query = { "data.tags": { "$in": text.split(",") } }
    const records = await this.sds.searchRecord(query)
    return records
  }

  async updateMetadata() {

  }

  async getRecord(id: string, fullRecord = false) {
    if (fullRecord) {
      const recordData: any = await this.sds.getFullRecord(id)
      return recordData
    } else {
      const recordData: any = await this.sds.getRecord(id)
      return recordData
    }
  }

  async updateRecord(id: string, data: any) {
    const editUpdate = await this.sds.editRecord(id, { data })
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

  newRecordObject(type = 'flashcard') {
    let blank: any = {
      flashcard: {
        cardType: "none",
        content: {},
        tags: [],
        reviewAlgorithm: "none",
        reviewEnabled: true,
        reviewDateUTC: 0,
        review: {},
        reviewHistory: [],
      },
      question:{
        title:"",
        questionType:"none",
        content: {},
        tags: [],
        practiceHistory:[]
      }
    }
    return blank[type]
  }

  validateNewRecord(type:string,newRecordData: any,customValidationFn="",mode='new') {
    let check: { error: boolean, list: [any] } = { error: false, list: ["Validation errors : "] }
    // data check
    // cardType should be present 
    if(type=='flashcard'){
      if (!newRecordData['data'].cardType || newRecordData['data'].cardType == "none") {
        check.error = true; check.list.push("Invalid card type")
      }
      // reviewAlg should be present    
      if (!newRecordData['data'].reviewAlgorithm || newRecordData['data'].reviewAlgorithm == "none") {
        check.error = true; check.list.push("Invalid review algorithm")
      }
    }
    if(type=='question'){
      if (!newRecordData['data'].questionType || newRecordData['data'].questionType == "none") {
        check.error = true; check.list.push("Invalid question type")
      }
      if(!newRecordData['data']['title']){
        check.error = true; check.list.push("Question title not provided")
      }
    }
    if (check.error) {
      throw new Error(check.list.join(", "))
    }

    if(customValidationFn){
      const fullSrcipt = `const input = {data: ${JSON.stringify(newRecordData['data'])},mode: "${mode}"}
      ${customValidationFn}`
      const validateMethod = new Function(fullSrcipt);
      validateMethod()
    }
  }

  validateExistingRecord() {
  }

  async newRecord(type:string, fullData: { data: any, metadata: any },typeMetadata:any={}) {
    let meta: any = { initialRelations: [] }
    if (fullData.metadata['initialRelations']) {
      const parts: [] = fullData.metadata['initialRelations'].split(",")
      parts.map(part => { meta.initialRelations.push({ resourceId: part, recNodeType: "node1", label: type }) })
    }

    const requestData = { data: fullData.data, structure: type, metadata: meta }
    this.validateNewRecord(type,requestData,typeMetadata['dataValidation'],'new')
    const newRecord: any = await this.sds.newRecord(requestData)
    return { newId: newRecord['data']['newId'] ,type: 'success', message: `New ${type} created. <a href="/core/edit/${newRecord['data']['newId']}" target="_blank" rel="noopener noreferrer">Edit</a> , <a href="/core/preview/${newRecord['data']['newId']}" target="_blank" rel="noopener noreferrer">Preview</a>` }
  }

  async reviewList() {
    const rec = await this.sds.reviewList({})
    return rec
  }

  getServerConfig() {
    return this.sds.getConfigs()
  }

  getAdditionalServerConfig(key:string) {
    return this.sds.getAdditionalSettions(key)
  }

  async deleteCard(id: string) {
    const req = await this.sds.deleteCard(id)
    return req
  }

}