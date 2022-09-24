import { Component, OnInit, Input } from '@angular/core';
import { BackendService } from 'src/app/backend.service';

@Component({
  selector: 'question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})
export class QuestionComponent implements OnInit {
  @Input() mode: string;
  @Input() display: any;
  @Input() metadata: any;
  @Input() record: any
  @Input() id: any

  initialRelation: string;
  previewIframeName:string;

  queData: any;
  formData: any;
  displayQue: boolean = false;

  constructor(public ds: BackendService) { 
    this.display = { title: "New Question", action: "Add New" }
    this.mode = "new"
    this.initialRelation = ""
    this.previewIframeName = this.setRandomId()
  }
  

  ngOnInit(): void {
    this.loadQuestion()
  }

  async loadQuestion() {
    this.displayQue = false;
    if (!this.metadata) {
      const mdata = await this.ds.getMetadata()
      this.metadata = mdata.question
    }
    //console.log(this.metadata)
    //mode = new
    if (this.mode == 'new') {
      this.loadNewQuestion()
    } else {
      await this.loadSavedQuestion()
      
      if (this.mode == 'preview') {
        const ang = this
        setTimeout(async function(){
          await ang.loadQuestionPreview()
        },100)
        
      }
      if (this.mode == 'practice'){
        await this.loadQuestionPractice()
      }
    }
  }

  async loadSavedQuestion() {
    try {
      this.display = { title: "Edit Question", action: "Save" }
      let rData:any;
      if(this.record){
        console.log("data was provided")
        console.log(this.record)
        rData = this.record['data']
      }else{
        rData = await this.ds.getRecord(this.id)
        //console.log(rData)
      }
      if(rData){
        this.loadSavedQuestionForm(rData)
        this.displayQue = true
      }else{
        this.displayMessage("danger","Question not found. <a href='/'>Home</a>")
      }
    } catch (error) {
        console.log(error)
        this.displayMessage("danger","Question not found. <a href='/'>Home</a>")
    }
  }

  loadSavedQuestionForm(savedData:any) {
    this.formData = []
    let dt: any = savedData['questionType']
    const questionTypes: [any] = this.metadata['questionTypes']
    const questionMetadata = questionTypes.find(itm => { return itm['name'] == dt })
    this.updateQuestionHelp(questionMetadata)
    if (questionMetadata) {
      this.queData = savedData
      const newData = this.createFormDataFromQuestionMetadata(questionMetadata)
      this.formData = newData['formData']
    } else {
      if (dt == 'none') {
        this.queData['content'] = this.combineQueData(this.queData['content'], {})
        this.queData['questionType'] = dt
      }else{
        throw new Error("Invalid question type")
      }
    }
  }
  combineQueData(oldData: any, newData: any) {
    // combine fields from old data and new data 
    // in case of same field , get data from oldData 
    let data = { ...newData, ...oldData }
    return data
  }

  validInputTypes: any = {
    "boolean": (defValue: any) => { return {  default: defValue ? defValue == 'true' : false} },
    "text": (defValue: any) => { return { default: defValue ? defValue : ""} },
    "text1": (defValue: any) => { return { default: defValue ? defValue : ""} },
    "enum": (defValue:any) => { return  {default : "none" , items : defValue.split(",") } },
    "tags": (defValue:any) => { return {defualt:defValue?defValue.split(","):[]} }
  }

  convertInputToFormData(inputs:[string]){
    let data: any = {}
      let formData: any = []
      inputs.map(itm => {
        const parts = itm.split(":")
        let fieldMetadata = this.validInputTypes[parts.length >= 2 ? parts[1] : "text"](parts.length == 3 ? parts[2] : null) 
        let fieldValue = fieldMetadata["default"]
        data[parts[0]] = fieldValue
  
        formData.push({ title: parts[0], type: parts.length >= 2 ? parts[1] : "text" , ...fieldMetadata })
      })
      return { data: data, formData }
  }

  createFormDataFromQuestionMetadata(queMetadata: any) {
    if(queMetadata){
      const inputs: [string] = queMetadata.inputs
      const dt = this.convertInputToFormData(inputs)
      return dt
    }else{
      return {data:{},formData:[]}
    }
  }

  
  questionHelp=""
  updateQuestionHelp(questionMetadata:any){
    //console.log(metadata)
    if(questionMetadata){
      this.questionHelp = `**How to use this question?** 
${questionMetadata.displayHelp}
${questionMetadata.inputHelp}`
    }else{
      this.questionHelp = ""
    }
  }

  loadQuestionPreview(){
    
  }

  getQuestionTypeMetadata(){
    const qTypes: [any] = this.metadata['questionTypes']
    const queMetadata = qTypes.find(itm => { return itm['name'] == this.queData['questionType'] })
    return queMetadata
  }

  loadQuestionPractice(){
    
  }

  resetFormData(){
    this.formData = []
  }

  loadNewQuestion(){
    this.resetFormData()
    this.queData = this.ds.newRecordObject('question')
    this.displayQue = true
  }

  setRandomId(){
    return "previewIframe-"+Math.floor(Math.random() * (10000) + 1)
  }



  showMessage: boolean = false;
  message: { type: string, text: string } = { text: "", type: "" }
  clearMessage() {
    this.showMessage = false;
  }
  displayMessage(type: string = "info", text: string = "Alert...", fade: number = 0) {
    this.message.text = text
    this.message.type = type
    this.showMessage = true

  }

  changeNewQuestionType(newQueType: Event) {
    this.formData = []
    let dt: any = newQueType.target
    const qTypes: [any] = this.metadata['questionTypes']
    const qMetadata = qTypes.find(itm => { return itm['name'] == dt['value'] })
    this.updateQuestionHelp(qMetadata)
    if (qMetadata) {
      const newData = this.createFormDataFromQuestionMetadata(qMetadata)
      this.formData = newData['formData']
      this.queData['content'] = this.combineQueData(this.queData['content'], newData['data'])
      this.queData['questionType'] = dt['value']
    } else {
      if (dt['value'] == 'none') {
        this.queData['content'] = this.combineQueData(this.queData['content'], {})
        this.queData['questionType'] = dt['value']
      }else{
        throw new Error("Invalid question type")
      }
    }
  }

  async handleQueAction() {
    try {
      this.clearMessage()
      if (this.mode == "new") {
        const result = await this.ds.newRecord('question',{ data: this.queData, metadata: { initialRelations: this.initialRelation } },this.getQuestionTypeMetadata())
        this.displayMessage(result.type,result.message)
        this.resetAfterInsertNew()
      }else if (this.mode== "edit"){
        const result = await this.ds.updateRecord(this.id,{content:this.queData['content'] , tags:this.queData['tags'], reviewEnabled: this.queData['reviewEnabled']})
        this.displayMessage(result.type,result.message)
      }
    } catch (error: any) {
      console.log(error)
      this.displayMessage("danger", error.message)
    }
  }

  resetAfterInsertNew(){
    // retain metadata
    const dataToRetain = {
      tags : this.queData['tags'],
    }
    this.loadNewQuestion()
    this.queData['tags'] = dataToRetain.tags
  }

}
