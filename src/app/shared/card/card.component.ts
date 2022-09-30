import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BackendService } from 'src/app/backend.service';

@Component({
  selector: 'flash-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {
  @Input() mode: string;
  @Input() display: any;
  @Input() metadata: any;
  @Input() record: any
  @Input() id: any
  @Output() afterReviewDone = new EventEmitter<any>();

  cardData: any;
  formData: any;
  displayCard: boolean = false;

  constructor(public ds: BackendService) {
    this.display = { title: "New Flashcard", action: "Add New" }
    this.mode = "new"
    this.initialRelation = ""
    this.setRandomId()

  }
  setRandomId(){
    this.previewIframeName = "previewIframe-"+Math.floor(Math.random() * (10000) + 1)
    console.log(this.previewIframeName)
  }
  ngOnInit(): void {
    //console.log()
    // load metadata
    // initialize data 
    this.loadCard()

  }
  ngOnChanges(){
    this.loadCard()
  }

  async loadCard() {
    this.displayCard = false;
    if (!this.metadata) {
      const mdata = await this.ds.getMetadata()
      this.metadata = mdata.flashcard
    }
    //console.log(this.metadata)
    //mode = new
    if (this.mode == 'new') {
      this.loadNewCard()
    } else {
      // mode = edit or preview
      await this.loadSavedCard()
      
      if (this.mode == 'preview') {
        const ang = this
        setTimeout(async function(){
          await ang.loadCardPreview()
        },100)
        
      }
      if (this.mode == 'review'){
        await this.loadCardReview()
      }
    }
  }

  // things realted to new card
  newCardType: any;
  initialRelation: string;

  resetFormData(){
    this.formData = []
  }

  loadNewCard() {
    //const samp = this.metadata.cardTypes[0]
    //console.log(this.createFormDataFromCardMetadata(samp))
    this.resetFormData()
    this.cardData = this.ds.newRecordObject()
    this.displayCard = true
  }

  getCardTypeMetadata(){
    const cardTypes: [any] = this.metadata['cardTypes']
    const cardMetadata = cardTypes.find(itm => { return itm['name'] == this.cardData['cardType'] })
    return cardMetadata
  }

  cardHelp=""
  updateCardHelp(metadata:any){
    //console.log(metadata)
    if(metadata){
      this.cardHelp = `**How to use this card?** 
${metadata.displayHelp}
${metadata.inputHelp}`
    }else{
      this.cardHelp = ""
    }
  }

  changeNewCardType(newCardType: Event) {
    this.formData = []
    let dt: any = newCardType.target
    const cardTypes: [any] = this.metadata['cardTypes']
    const cardMetadata = cardTypes.find(itm => { return itm['name'] == dt['value'] })
    this.updateCardHelp(cardMetadata)
    if (cardMetadata) {
      const newData = this.createFormDataFromCardMetadata(cardMetadata)
      this.formData = newData['formData']
      this.cardData['content'] = this.combineCardData(this.cardData['content'], newData['data'])
      this.cardData['cardType'] = dt['value']
    } else {
      if (dt['value'] == 'none') {
        this.cardData['content'] = this.combineCardData(this.cardData['content'], {})
        this.cardData['cardType'] = dt['value']
      }else{
        throw new Error("Invalid card type")
      }
    }
  }

  changeNewCardReviewAlgorithm(newAlgorithm: Event) {
    let dt: any = newAlgorithm.target
    const reviewTypes: [any] = this.metadata['reviewAlgorithms']
    const reviewData = reviewTypes.find(itm => { return itm['name'] == dt['value'] })
    if (reviewData) {
      this.cardData['reviewAlgorithm'] = dt['value']
    } else {
      throw new Error("Invalid card type")
    }
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

  createFormDataFromCardMetadata(cardMetadata: any) {
    if(cardMetadata){
      const inputs: [string] = cardMetadata.inputs
      const dt = this.convertInputToFormData(inputs)
      return dt
    }else{
      return {data:{},formData:[]}
    }
  }

  combineCardData(oldData: any, newData: any) {
    // combine fields from old data and new data 
    // in case of same field , get data from oldData 
    let data = { ...newData, ...oldData }
    return data
  }

  generateFlashcardView(cardTypeMetaData:any, fcData:any, options:{iframeName:string}) {
    const serverConfig = this.ds.getServerConfig()
    const dataInput = fcData;
    let defHTML = ` 
        <script src="${serverConfig.staticFilesUrl}/scripts/codescripts.js"> </script>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css">
        <div id='result'></div>  `;
    let jsPart = `  
        <script type='text/javascript'> 
        var height;
        resize = () => {
          if (height !== document.getElementById('result').offsetHeight) {
            let iframeName = "${options.iframeName}"
            height = document.getElementById('result').offsetHeight;
            window.parent.postMessage({
              frameHeight: height,
              iframeName: iframeName
            }, '*');
          }
        }
        window.onresize = () => resize();
        window.onload= async function(){
        function print(data=""){
          let pr = data;
          if(typeof data== "object"){pr = "<pre>"+JSON.stringify(data,null,1)+'<\pre>'}
          document.getElementById("result").innerHTML += pr
        resize()
        }
        async function loadJS(file){
          return new Promise((resolve,reject)=>{
              let a = this;let myScript = document.createElement("script");myScript.setAttribute("src",file);document.body.appendChild(myScript);myScript.addEventListener("load", scriptLoaded, false);
              function scriptLoaded() {resolve()}
          })
        }
        function loadCSS(file){var fileref = document.createElement("link");fileref.rel = "stylesheet";fileref.type = "text/css";fileref.href = file;document.getElementsByTagName("head")[0].appendChild(fileref);}
        function mdToHTML(text){if(marked){return marked.parse(text)}}
        function renderMaths(){if(MathJax){MathJax.Hub.Queue(["Typeset", MathJax.Hub])}
      }
      const reviewData = {
        input: ${JSON.stringify(dataInput)},
        cardTypeMetadata:  ${JSON.stringify(cardTypeMetaData)}
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
      ${cardTypeMetaData["display"]}
    }
    </script>`;
    let qw = defHTML + jsPart;
    return qw;
  }

  previewIframeName="cardPreviewIframe"
  
  getCurrentTimeUtc(){
    return Math.floor(new Date().getTime() / 1000)
  }
  
  previewLoadTime:any

  async loadCardPreview() {
    const meta = this.getCardTypeMetadata()
    const preview = this.generateFlashcardView(meta,this.cardData['content'],{iframeName:this.previewIframeName})
    // if(!this.displayCard){console.log(1);setTimeout(()=>{console.log("...done waiting")},75)}

    const ifr:any = document.getElementById(this.previewIframeName)
        if (ifr) {
          var code = ifr['contentWindow'].document;
          code.open();
          code.write(preview);
          code.close();
          this.previewLoadTime = this.getCurrentTimeUtc()
        }
  }

  resetAfterInsertNew(){
    // retain metadata
    const dataToRetain = {
      tags : this.cardData['tags'],
      reviewAlgorithm : this.cardData['reviewAlgorithm'],
    }
    this.loadNewCard()
    this.cardData['tags'] = dataToRetain.tags
    this.cardData['reviewAlgorithm'] = dataToRetain.reviewAlgorithm
    // also inital relation but that is anyways stored seperately 

  }


  loadSavedCardForm(savedData:any) {
    this.formData = []
    let dt: any = savedData['cardType']
    const cardTypes: [any] = this.metadata['cardTypes']
    const cardMetadata = cardTypes.find(itm => { return itm['name'] == dt })
    this.updateCardHelp(cardMetadata)
    if (cardMetadata) {
      this.cardData = savedData
      const newData = this.createFormDataFromCardMetadata(cardMetadata)
      this.formData = newData['formData']
      //this.cardData['content'] = savedData['content']
      //this.cardData['cardType'] = dt
    } else {
      if (dt == 'none') {
        this.cardData['content'] = this.combineCardData(this.cardData['content'], {})
        this.cardData['cardType'] = dt
      }else{
        throw new Error("Invalid card type")
      }
    }
  }

  async loadSavedCard() {
    try {
      this.display = { title: "Edit Flashcard", action: "Save" }
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
        this.loadSavedCardForm(rData)
        this.displayCard = true
      }else{
        this.displayMessage("danger","Card not found. <a href='/'>Home</a>")
      }
    } catch (error) {
        console.log(error)
        this.displayMessage("danger","Card not found. <a href='/'>Home</a>")
    }
  }

  async handleCardAction() {
    try {
      //console.log(this.cardData)
      this.clearMessage()
      if (this.mode == "new") {
        const result = await this.ds.newRecord('flashcard',{ data: this.cardData, metadata: { initialRelations: this.initialRelation } },this.getCardTypeMetadata())
        this.displayMessage(result.type,result.message)
        this.resetAfterInsertNew()
      }else if (this.mode== "edit"){
        const result = await this.ds.updateRecord(this.id,{content:this.cardData['content'] , tags:this.cardData['tags'], reviewEnabled: this.cardData['reviewEnabled']})
        this.displayMessage(result.type,result.message)
      }
    } catch (error: any) {
      console.log(error)
      this.displayMessage("danger", error.message)
    }
  }

  // Use this for common messaging 
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

  reviewForm:any = []
  reviewData:any = {}
  reviewDone:boolean = false;

  getReviewAlgorithmData(){
    const cardTypes: [any] = this.metadata['reviewAlgorithms']
    // console.log(this.cardData)
    const cardMetadata = cardTypes.find(itm => { return itm['name'] == this.cardData['reviewAlgorithm'] })
    return cardMetadata
  }

  getEditTagsObjectForReview(){
    let allEditTags:[any] = this.metadata['options']['reviewEditTags']
    let initalEditFlags:any = {}
    allEditTags.map(flag=>{ initalEditFlags[flag] = false })
    return initalEditFlags
  }

  convertEditTagObjectToTags(editObj:any){
    let allEditTags:[any] = this.metadata['options']['reviewEditTags']
    let tags:any = []
    allEditTags.map(flag=>{ if(editObj[flag]){tags.push(`review-${flag}`)}})
    return tags
  }


  async loadCardReview(){
    // get review algorithm metadata feedbackInput
    const alg:any = this.getReviewAlgorithmData()
    let fbInputs = alg['feedbackInput']
    if(!fbInputs.includes("note:text")){
      fbInputs.push("note:text")
    }

    const rd = this.convertInputToFormData(fbInputs)
    // defualt fields
    rd['data']['editTags'] = this.getEditTagsObjectForReview()

    this.reviewForm = rd.formData
    this.reviewData = rd.data
    // console.log(this.reviewData)
    const ang = this
    setTimeout(async function(){
      await ang.loadCardPreview()
    },100)
  }

  async saveReview() {
    try {
      await this.processReview()
      this.afterReviewDone.emit({ reviewDone: true })
    } catch (error:any) {
      this.displayMessage("danger",error.message)
    }
  }

  getUtilityFunction(){
    const utils = ` {
      addDaysToDate: (date, dayToAdd) => {
        var someDate = new Date(date);
        someDate.setDate(someDate.getDate() + dayToAdd);
        return someDate;
      },
      convertToUTC : (date) => {
        return Math.floor(new Date(date).getTime() / 1000)
      }
    }`
    return utils
  }

  validateReviewedData(data:any){
    const reqFields = ['reviewDateUTC','review','history']
    reqFields.map(i=>{if(!data[i]){throw 'Validation error' }})
  }
  updateTagsAfterReview(allTags:[any]){
    allTags.map(tag=>{ 
      if(!this.cardData['tags'].includes(tag)){
        this.cardData['tags'].push(tag)
      }
    })
  }

  async processReview() {
        // get the review function
        const reviewScript = this.getReviewAlgorithmData()['process']
        const fullSrcipt = `
        const input = {
          cardData: ${JSON.stringify(this.cardData)},
          reviewInput: ${JSON.stringify(this.reviewData)}
        }
        const util = ${this.getUtilityFunction()}
        ${reviewScript}`
        // run the review function 
        try {
          const reviewMethod = new Function(fullSrcipt);
          let reviewedData = reviewMethod()
          this.validateReviewedData(reviewedData)

          const newTags:[any] = this.convertEditTagObjectToTags(reviewedData['history']['inputFeedback']['editTags'])
          const atg:any = [...newTags,...reviewedData['history']['suggestedTags']]
          this.updateTagsAfterReview(atg)
          reviewedData['history']['inputFeedback']['editTags'] = newTags


          // track time taken to review
          const rightnow = this.getCurrentTimeUtc()
          const diff = rightnow - this.previewLoadTime
          reviewedData['history']['inputFeedback']['timeTakenSec'] = diff

          this.cardData['reviewHistory'].push(reviewedData['history'])
          const dataToSave = {
            review : reviewedData['review'],
            reviewHistory: this.cardData['reviewHistory'],
            reviewDateUTC: reviewedData['reviewDateUTC'],
            tags: this.cardData['tags']
          }
          console.log(dataToSave)
          const result = await this.ds.updateRecord(this.id,dataToSave)
          // save the review results   
        } catch (error) {
          console.log(error)
          alert("Error in saving review")
          throw error
        }    
  }
  jsonToString(input:any){
    return `<pre>${JSON.stringify(input,null,2)}</pre>`
  }
}
