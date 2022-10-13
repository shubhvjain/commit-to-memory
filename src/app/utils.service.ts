import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }
  
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

}
