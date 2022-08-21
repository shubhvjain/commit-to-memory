import { Component, OnInit, Input, Output } from '@angular/core';
import { BackendService } from 'src/app/backend.service';

@Component({
  selector: 'flash-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {
  @Input() mode:string;
  @Input() display :any;
  @Input() metadata:any;
  @Input() record:any
  
  cardData:any;
  formData:any;
  displayCard:boolean = false;
  
  constructor(public ds:BackendService) {
    this.display = { title:"New flashcard", action:"Add New" } 
    this.mode = "new"
   }
   items=[]
  ngOnInit(): void {
    // load metadata
    // initialize data 
    this.loadCard()
    
  }
  async loadCard(){
    if(!this.metadata){
      this.metadata = await this.ds.getMetadata()
    }
    // console.log(this.metadata)
    //mode = new
    if(this.mode == 'new'){
      this.loadNewCard()
    }else{
      // mode = edit or preview
      await this.loadSavedCard()
      if(this.mode=='preview'){
        await this.loadCardPreview()
      }
    }
  }

  // things realted to new card
  newCardType:any;
  loadNewCard(){    
    const samp = this.metadata.cardTypes[0]
    console.log(this.createFormDataFromCardMetadata(samp))
    this.cardData = {}
    this.displayCard = true
  }

  changeNewCardType(newCardType:Event){
    let dt:any = newCardType.target
    const cardTypes:[any] = this.metadata['cardTypes']
    const cardMetadata = cardTypes.find(itm=>{return itm['name']==dt['value']})
    if(cardMetadata){
      const newData = this.createFormDataFromCardMetadata(cardMetadata)     
      this.formData = newData['formData']
      this.cardData = newData['data']
    }else{
      throw new Error("Invalid card type")
    } 
  }

  async loadSavedCard(){

  }
  
  changeSavedCardType(newCardType:Event){

  }

  createFormDataFromCardMetadata(cardMetadata:any){
    const validInputTypes:any = {
      "boolean":(defValue:any)=>{ return defValue?defValue=='true':false },
      "text":(defValue:any)=>{ return defValue?defValue:""}
    }
    const inputs:[string] = cardMetadata.inputs
    let data:any =  {}
    let formData:any = []
    inputs.map(itm=>{
      const parts = itm.split(":")
      let fieldValue = validInputTypes[parts.length>=2?parts[1]:"text"](parts.length==3?parts[2]:null)
      data[parts[0]] = fieldValue
      formData.push({ title: parts[0], type: parts.length>=2?parts[1]:"text" })
    })
    return {data: data, formData}
  }

  combineCardData(oldData:any,newData:any){
    // combine fields from old data and new data 
    // in case of same field , get data from oldData 
    let data = { ...newData, ...oldData }
    return data
  }

  async loadCardPreview(){

  }


}
