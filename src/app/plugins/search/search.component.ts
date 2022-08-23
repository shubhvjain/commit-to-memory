import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';

import { BackendService } from 'src/app/backend.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  constructor(public ngxSmartModalService: NgxSmartModalService, public ds: BackendService) { }

  query:string = ""
  async search(){
    // TODO only fetch fields required for displaying,  instead of fetching the whole record 
    const results = await this.ds.searchRecords(this.query)

    console.log(results)
    this.results = results
  }
  results:[] = []


  showEdit:boolean= false
  editId:any
  openEdit(id:string){
    this.editId = id
    this.showEdit = true
    this.ngxSmartModalService.getModal('editCard').open()

  }
  closeEdit(){
    this.showEdit = false
    this.ngxSmartModalService.getModal('editCard').close()

  }
  showPreview:boolean = false
  preivewId:any
  openPreview(id:string){
    this.preivewId = id
    this.showPreview = true
    this.ngxSmartModalService.getModal('previewCard').open()
  }
  closePreview(){
    this.showPreview = false
    this.ngxSmartModalService.getModal('previewCard').close()
  }

  ngOnInit(): void {
  }

}
