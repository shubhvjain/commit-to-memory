import { Component, OnInit } from '@angular/core';
import { BackendService } from 'src/app/backend.service';
@Component({
  selector: 'app-new-card',
  templateUrl: './new-card.component.html',
  styleUrls: ['./new-card.component.css']
})
export class NewCardComponent implements OnInit {

  constructor(private ds:BackendService) { }
  displayPage:boolean = false;
  metadata:any

  ngOnInit(): void {
    this.loadPage()
  }

  async loadPage(){
    try {
      this.metadata = await this.ds.getMetadata() 
      this.displayPage = true
    } catch (error) {
      console.log(error)
    }    
  }

}
