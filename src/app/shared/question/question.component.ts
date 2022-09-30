import { Component, OnInit, Input , Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { BackendService } from 'src/app/backend.service';

@Component({
  selector: 'question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})
export class QuestionComponent implements OnInit, OnChanges {
  @Input() mode: string;
  @Input() display: any;
  @Input() metadata: any;
  @Input() record: any;
  @Input() id: any;
  @Input() practiceId: any
  @Output() afterPracticeDone = new EventEmitter<any>();


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

  setWindowFn(){
    const w:any = window
    let ang = this
    w['recordQuestionReview'] = (data:any)=>{
      ang.savePraticeResponse(data)
    }
  }

  ngOnInit(): void {
    this.loadQuestion()
    this.setWindowFn()
  }

  ngOnChanges(sm:SimpleChanges):void{
    console.log(sm)
    this.id = sm['id'].currentValue
    this.loadQuestion()
    this.setWindowFn()
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
      
      //if (this.mode == 'preview') {
        const ang = this
        setTimeout(async function(){
          await ang.loadQuestionPreview()
        },100)
      //}
      if (this.mode == 'practice'){
        // await this.loadQuestionPractice()
        if(!this.practiceId){
          throw new Error("Practice Id not provided ")
        }
        this.checkIfAlreadyReviewed()
      }
    }
  }

  checkIfPracticeSessionExists(){
    const history:any[] = this.queData['practiceHistory']
    const p = history.find(itm=>{ return itm['practiceId'] == this.practiceId })
    return p
  }

  checkIfAlreadyReviewed(){
    // if practice id already exists display error with 
    const p = this.checkIfPracticeSessionExists()
    if(p){
      const msg = `You have already reviewed this question during this practice session. <br> Answer : ${p.correct} `
      this.displayMessage('success', msg )
    }else{
      this.clearMessage()
    }
  }

  async loadSavedQuestion() {
    try {
      this.display = { title: "Edit Question", action: "Save" }
      let rData:any;
      if(this.record){
        console.log("data was provided")
        //console.log(this.record)
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

  getQuestionTypeMetadata(){
    const qTypes: [any] = this.metadata['questionTypes']
    const queMetadata = qTypes.find(itm => { return itm['name'] == this.queData['questionType'] })
    return queMetadata
  }

  generateQuestionView(meta:any,data:any,options:{iframeName:string}){
    const serverConfig = this.ds.getServerConfig()
    const staticUrl = serverConfig.staticFilesUrl
    let iframeName = options.iframeName
    let configs1 = {
       token: localStorage.getItem('token'),
       user: localStorage.getItem('user'),
       baseURL: serverConfig.dataBaseUrl +"/service",
       baseURL1:serverConfig.dataBaseUrl 
     }
     // console.log(configs1)
     localStorage.setItem("codeConfig", JSON.stringify(configs1))
     let qw = " ";
     let defHTML = ` 
     <script src="${staticUrl}/scripts/codescripts.js"> </script>
     <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css">
     <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
     <div id='result'></div>  `;
     let defStyle = ` `
     let jsPart = `  
     <script type='text/javascript'> 
     var height;
 resize = () => {
 if (height !== document.getElementById('result').offsetHeight) {
   let iframeName = "${iframeName}"
   height = document.getElementById('result').offsetHeight;
   window.parent.postMessage({
     frameHeight: height,
     iframeName: iframeName
   }, '*');
 }
 }
     window.onresize = () => resize();
     window.onload= async function(){
       resize()
       function print(data=""){
         let pr = data
   if(typeof data== "object"){
     pr = "<pre>"+JSON.stringify(data,null,1)+'<\pre>'
   }
   document.getElementById("result").innerHTML += pr
   resize()
       }
       async function loadJS(file){
         return new Promise((resolve,reject)=>{
           let a = this;
           let myScript = document.createElement("script");
           myScript.setAttribute("src",file);
           document.body.appendChild(myScript);
           myScript.addEventListener("load", scriptLoaded, false);
           function scriptLoaded() {resolve()}
         })
     }
     function loadCSS(file){
       var fileref = document.createElement("link");
       fileref.rel = "stylesheet";
       fileref.type = "text/css";
       fileref.href = file;
       document.getElementsByTagName("head")[0].appendChild(fileref)
     }
     function mdToHTML(text){
      return marked.parse(text)
    }
    function renderMaths(){
      MathJax.Hub.Queue(["Typeset", MathJax.Hub])
    }
    function  savePracticeSessionResult(data){
      if(window.parent.recordQuestionReview){
        window.parent.recordQuestionReview(data);
      }else{
        console.log("recordQuestionReview not found")
      }
    }
    function getCurrentTimeUTC(){
      return Math.floor(new Date().getTime() / 1000)
    }

    const reviewData = {
      input: ${JSON.stringify(data)},
      questionMetadata:  ${JSON.stringify(meta)}
     }
     await loadJS('https://cdn.jsdelivr.net/npm/marked/marked.min.js')
     await loadJS('https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.2/MathJax.js?config=TeX-MML-AM_CHTML')
     MathJax.Hub.Config({
       showMathMenu: true,
       tex2jax: { inlineMath: [["$", "$"]],displayMath:[["$$", "$$"]] },
       menuSettings: { zoom: "Double-Click", zscale: "150%" },
       CommonHTML: { linebreaks: { automatic: true } },
       "HTML-CSS": { linebreaks: { automatic: true } },
       SVG: { linebreaks: { automatic: true } }
     });
    ${meta["question"]}
    }
     </script>`
     qw = defHTML + defStyle + jsPart
     return qw

  }
//   generateFlashcardView(cardTypeMetaData:any, fcData:any, options:{iframeName:string}) {

  loadQuestionPreview(){
    const meta = this.getQuestionTypeMetadata()
    const preview = this.generateQuestionView(meta,this.queData['content'],{iframeName:this.previewIframeName})
    const ifr:any = document.getElementById(this.previewIframeName)
        if (ifr) {
          var code = ifr['contentWindow'].document;
          code.open();
          code.write(preview);
          code.close();
        }
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
    return "queIframe-"+Math.floor(Math.random() * (10000) + 1)
  }

  showMessage: boolean = false;
  message: { type: string, text: string } = { text: "", type: "" }
  clearMessage() {
    this.message.text = ''
    this.message.type=''
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

  async storePracticeHistoryInDB(){
    const dataToSave = {
      practiceHistory: this.queData['practiceHistory'],
      tags: this.queData['tags']
    }
    const result = await this.ds.updateRecord(this.id,dataToSave)
  }

  async savePraticeResponse(data:any){
    // data validatiomn
    if(!data.hasOwnProperty('correct')){throw new Error("'correct' value not provided")}
    if(!data.hasOwnProperty('timeTaken')){throw new Error("'timeTaken' value not provided")}
    let practice = {
      ...data,
      practiceId: this.mode=='practice'? this.practiceId: 'randomReview',
      onLocal: new Date(),
      practiceDateUTC: new Date().toUTCString()
    }

    if(this.mode=='practice'){
      if(this.checkIfPracticeSessionExists()){
        this.displayMessage('danger',"You have already reviewed this question in this practice session")
        this.afterPracticeDone.emit(null)

      }else{
        this.queData['practiceHistory'].push(practice)
        await this.storePracticeHistoryInDB()
        this.afterPracticeDone.emit(practice)
      }
    }else{
      // still store the result for later analysis 
      //this.queData['practiceHistory'].push(practice)
      //await this.storePracticeHistoryInDB()
    }
    //console.log(this.queData)
  }

  loadPreviewForEdit(){
    this.loadQuestionPreview()
  }
}
