import { Injectable } from '@angular/core';
import { SampleDataService } from './sample-data.service';
@Injectable({
  providedIn: 'root'
})
export class BackendService {

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

  async newRecord(){

  }
}