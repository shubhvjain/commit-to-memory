import { Component, OnInit } from '@angular/core';
import { BackendService } from 'src/app/backend.service';
@Component({
  selector: 'app-new-card',
  templateUrl: './new-card.component.html',
  styleUrls: ['./new-card.component.css']
})
export class NewCardComponent implements OnInit {

  constructor(private ds:BackendService) { this.newType='flashcard' }
  displayPage:boolean = false;
  metadata:any
  newType:string
  ngOnInit(): void {
    this.loadPage()
  }

  async loadPage(){
    try {
      const mdata = await this.ds.getMetadata()
      this.metadata = mdata
      this.displayPage = true
    } catch (error) {
      console.log(error)
    }    
  }

}
