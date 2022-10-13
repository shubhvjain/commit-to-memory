import { Component, OnInit } from '@angular/core';
import { BackendService } from 'src/app/backend.service';

@Component({
  selector: 'app-practice',
  templateUrl: './practice.component.html',
  styleUrls: ['./practice.component.css']
})
export class PracticeComponent implements OnInit {
  pageLoaded:boolean = false
  loadingMessage:string= " Loading..."
  inPractice:boolean = false
  metadata:any
  loadQuestionPreview:boolean = false
  currentIndex:number=-1
  practiceId:string="";
  newPractice:any 
  questionIds:[] = []

  constructor(private ds: BackendService) { }

  ngOnInit(): void {
    this.pageLoaded = false
    this.loadActicePractice()
    this.newPractice = {}
    this.setNewPractice()
  }

  cards:any;
  activePractice = []
async loadActicePractice(){  
  const mdata = await this.ds.getMetadata()
  this.metadata = mdata.question
  const acticePracticeDt = await this.ds.searchRecords({'structure':'practice-session','data.active':true}) 
  console.log(acticePracticeDt)
  this.activePractice = acticePracticeDt
  this.pageLoaded = true

}

  newPracticeSession(){

  }

  async checkQuery(){
    // for fetching questions 
    let query:any = {
      structure:"question",
    }
    if(this.newPractice.query.tags.length>0){
      query['data.tags'] = { "$in":this.newPractice.query.tags }
    }
    if(this.newPractice.query.questionType.length > 0){
      query['data.questionType'] = { "$in":this.newPractice.query.questionType }
    }
    const res:any[] = await this.ds.searchRecords(query)
    let qlist:any = []
    res.map(r=>{qlist.push(r._id)})
    console.log(res)
    this.newPractice.questions = qlist
  }

  setNewPractice(){
    const newSessionName = ` Session-${new Date().toLocaleString()}`
    this.newPractice = {  
      title:newSessionName,
      active:true,
      query:{
        tags:[],
        questionType:[]
      },
      questions:[],
      flags: {
        randomOrder:true,
        timed: false
      },
      settings: {
        recTim:0
      },
      stats: {
        start: new Date().toLocaleString(),
        questions:{},
      }
    }
  }

  currentSession:any

  async createNewSession(){
    if(this.newPractice['questions'].length>0){
      const newSession = await this.ds.newRecord('practice-session',{data:this.newPractice,metadata:{}})
      console.log(newSession)
      this.startSession({_id: newSession['newId'], data: this.newPractice})
      this.setNewPractice()
    }
  }

  resumeSession(sData:any){
    console.log(sData)
    this.startSession(sData)
  }

  startSession(sData:any){
    this.currentSession = sData
    const dData = sData['data']
    if(dData.flags.randomOrder){
      let qids:any = dData.questions
      qids = qids.sort(() => Math.random() - 0.5);
      this.questionIds = qids
    }else{
      this.questionIds = dData.questions
    }
    this.currentIndex++
    this.practiceId = sData["_id"]
    this.inPractice = true
    this.loadQuestionPreview = true
  }

  async savePracticeStats(stats:any){
    const dataToSave = {stats: stats}
    const dt = await this.ds.updateRecord(this.practiceId,dataToSave)
    //console.log(dt)
  }

  async handleAfterPractice(data:any){
    console.log(data)
    if(data){
      let statObj = this.currentSession['data']['stats']
      if(!statObj['question']){
        statObj['question'] = {}
      }
      statObj['question'][this.questionIds[this.currentIndex]] = data
      //console.log(statObj)
      this.currentSession['data']['stats'] = statObj
      await this.savePracticeStats(statObj)
    }
    console.log(this.currentSession)
  }

  loadPreviousQuestion(){
    if(this.currentIndex > 0 ){
      this.loadQuestionPreview = false
      this.currentIndex--
      this.loadQuestionPreview = true
    }
  }

  loadNextQuestion(){
    if(this.currentIndex < (this.questionIds.length-1) ){
      this.loadQuestionPreview = false
      this.currentIndex++
      this.loadQuestionPreview = true
    }
  }
  resetPractice(){
    this.questionIds = []
    this.practiceId = ''
    this.currentSession = {}
    this.inPractice = false
    this.loadQuestionPreview = false
    this.currentIndex = -1
    this.loadActicePractice()
  }

  async finishPractice(){
    if(window.confirm("Sure ?")){
      const dataToSave = {active: false , finishedOn: new Date().toUTCString() }
      const dt = await this.ds.updateRecord(this.practiceId,dataToSave)
      console.log(dt)
      this.resetPractice()
    }
  }

}
