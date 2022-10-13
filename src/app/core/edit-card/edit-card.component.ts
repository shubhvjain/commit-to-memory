import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BackendService } from 'src/app/backend.service';


@Component({
  selector: 'app-edit-card',
  templateUrl: './edit-card.component.html',
  styleUrls: ['./edit-card.component.css']
})
export class EditCardComponent implements OnInit {

  constructor(private ds:BackendService,private _Activatedroute:ActivatedRoute) { this.id="";this.recordType="" }
  displayPage:boolean = false;
  metadata:any
  id:any;
  mode:any;
  recordType:string
  recordData:any
  iframeMode:boolean = false
  ngOnInit(): void {
    
    this._Activatedroute.paramMap.subscribe(params => { 
      //console.log(params);
      this.id = params.get('id'); 
      this.mode = params.get('mode');

      this._Activatedroute.queryParams.subscribe(params=>{
        this.iframeMode = params['iframeMode']=='true'
      })

      this.loadPage()      
   });
  }

  async loadPage(){
    try {
      const mdata = await this.ds.getMetadata()
      this.metadata = mdata
      const recordData = await this.ds.getRecord(this.id,true)
      this.recordType = recordData['structure']
      this.recordData = recordData
      this.displayPage = true
    } catch (error) {
      console.log(error)
    }    
  }

}
