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
    this.display = { title: "New flashcard", action: "Add New" }
    this.mode = "new"
    this.initialRelation = ""
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
      this.metadata = await this.ds.getMetadata()
    }
    console.log(this.metadata)
    //mode = new
    if (this.mode == 'new') {
      this.loadNewCard()
    } else {
      // mode = edit or preview
      await this.loadSavedCard()
      
      if (this.mode == 'preview') {
        await this.loadCardPreview()
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

  changeNewCardType(newCardType: Event) {
    this.formData = []
    let dt: any = newCardType.target
    const cardTypes: [any] = this.metadata['cardTypes']
    const cardMetadata = cardTypes.find(itm => { return itm['name'] == dt['value'] })
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
    "enum": (defValue:any) => { return  {default : "none" , items : defValue.split(",") } }
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
          resize()
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

        const reviewData = {
          input: ${JSON.stringify(dataInput)},
          cardTypeMetadata:  ${JSON.stringify(cardTypeMetaData)}
        }
          ${cardTypeMetaData["display"]}
        }
        </script>`;
    let qw = defHTML + jsPart;
    return qw;
  }

  previewIframeName="cardPreviewIframe"

  async loadCardPreview() {
    //console.log("sampe")
    const meta = this.getCardTypeMetadata()
    const preview = this.generateFlashcardView(meta,this.cardData['content'],{iframeName:this.previewIframeName})
    if(!this.displayCard){console.log(1);setTimeout(()=>{console.log("...done waiting")},75)}

    const ifr:any = document.getElementById("cardPreviewIframe")
        if (ifr) {
          var code = ifr['contentWindow'].document;
          code.open();
          code.write(preview);
          code.close();
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
      this.display = { title: "Edit card", action: "Save" }
      const rData:any = await this.ds.getRecord(this.id)
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
        const result = await this.ds.newRecord({ data: this.cardData, metadata: { initialRelations: this.initialRelation } })
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

  async loadCardReview(){
    // get review algorithm metadata feedbackInput
    const alg:any = this.getReviewAlgorithmData()
    const rd = this.convertInputToFormData(alg['feedbackInput'])
    this.reviewForm = rd.formData
    this.reviewData = rd.data
    const ang = this
    setTimeout(async function(){
      await ang.loadCardPreview()
    },200)
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
          const reviewedData = reviewMethod()
          this.validateReviewedData(reviewedData)
          this.cardData['reviewHistory'].push(reviewedData['history'])
          const dataToSave = {
            review : JSON.parse(JSON.stringify(this.combineCardData(this.cardData['review'],reviewedData['review']))),
            reviewHistory: this.cardData['reviewHistory'],
            reviewDateUTC: reviewedData['reviewDateUTC']
          }
          console.log(dataToSave)
          const result = await this.ds.updateRecord(this.id,dataToSave)
          // save the review results   
        } catch (error) {
          console.log(error)
          throw error
        }    
  }
}
