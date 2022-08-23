import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BackendService } from 'src/app/backend.service';


@Component({
  selector: 'app-edit-card',
  templateUrl: './edit-card.component.html',
  styleUrls: ['./edit-card.component.css']
})
export class EditCardComponent implements OnInit {

  constructor(private ds:BackendService,private _Activatedroute:ActivatedRoute) { this.id="" }
  displayPage:boolean = false;
  metadata:any
  id:any;
  ngOnInit(): void {
    
    this._Activatedroute.paramMap.subscribe(params => { 
      //console.log(params);
      this.id = params.get('id'); 
      this.loadPage()      
   });
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
