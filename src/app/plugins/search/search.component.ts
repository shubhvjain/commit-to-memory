import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  constructor(public ngxSmartModalService: NgxSmartModalService) { }

  query:string = ""
  search(){

  }
  results:[] = []
  pageSplits:any  


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
