import { Component, OnInit, Input, Output } from '@angular/core';
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

  cardData: any;
  formData: any;
  displayCard: boolean = false;

  constructor(public ds: BackendService) {
    this.display = { title: "New flashcard", action: "Add New" }
    this.mode = "new"
    this.initialRelation = ""
  }
  ngOnInit(): void {
    // load metadata
    // initialize data 
    this.loadCard()

  }
  async loadCard() {
    if (!this.metadata) {
      this.metadata = await this.ds.getMetadata()
    }
    // console.log(this.metadata)
    //mode = new
    if (this.mode == 'new') {
      this.loadNewCard()
    } else {
      // mode = edit or preview
      await this.loadSavedCard()
      if (this.mode == 'preview') {
        await this.loadCardPreview()
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
  createFormDataFromCardMetadata(cardMetadata: any) {
    if(cardMetadata){
      const validInputTypes: any = {
        "boolean": (defValue: any) => { return {  default: defValue ? defValue == 'true' : false} },
        "text": (defValue: any) => { return { default: defValue ? defValue : ""} },
        "enum": (defValue:any) => { return  {default : "none" , items : defValue.split(",") } }
      }
      const inputs: [string] = cardMetadata.inputs
      let data: any = {}
      let formData: any = []
      inputs.map(itm => {
        const parts = itm.split(":")
        let fieldMetadata = validInputTypes[parts.length >= 2 ? parts[1] : "text"](parts.length == 3 ? parts[2] : null) 
        let fieldValue = fieldMetadata["default"]
        data[parts[0]] = fieldValue
  
        formData.push({ title: parts[0], type: parts.length >= 2 ? parts[1] : "text" , ...fieldMetadata })
      })
      return { data: data, formData }
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

  async loadCardPreview() {
    
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

}
