import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';

import { BackendService } from 'src/app/backend.service';
import { UtilsService } from 'src/app/utils.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  constructor(public ngxSmartModalService: NgxSmartModalService, public ds: BackendService, private ut: UtilsService) { }

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


  removeFromResults(id:string){
    const index  = this.results.findIndex(item=>{return item['_id']==id})
    if (index > -1) {
      this.results.splice(index, 1);
    }
  }

  async delete(id:string){
    try {
      if (window.confirm('Are you sure ?')) {
        const res = await this.ds.deleteCard(id)
        this.removeFromResults(id)
      } 
    } catch (error) {
      console.log(error) 
    }
  }

  ngOnInit(): void {
    this.loadSearchFilters()
  }


  queries:any[] = []
  async loadSearchFilters(){
    const addSettings:any[]= await this.ds.getAdditionalServerConfig("searchFilters")
    console.log(addSettings)
    addSettings.forEach(itm=>{
      itm['showForm'] = false
      const fd = this.ut.convertInputToFormData(itm['data']['input']?itm['data']['input']:[])
      itm['inputForm'] = fd.formData
      itm['inputData'] = fd.data
    })
    addSettings.sort((a, b) => {return a.data.orderNo - b.data.orderNo;})
    this.queries  = addSettings
  }

  openForm(index:number){
    if(this.queries[index]['data']['input'].length >0){
      this.queries[index]['showForm'] = true
    }else{
      this.runQuery(index)
    } 
  }

  closeForm(index:number){
    this.queries[index]['showForm'] = false
  }

  toggleForm(index:number){
    if(this.queries[index]['data']['input'] && this.queries[index]['data']['input'].length >0){
      this.queries[index]['showForm'] = !this.queries[index]['showForm'] 
    }else{
      this.runQuery(index)
    } 
  }

  clearResults(){
    this.results = []
  }

  generateQuery(script:string,input:any){
    try {
      const ifn = `
       const input = ${JSON.stringify(input)}
        ${script}
      `
      const scriptMethod = new Function(ifn);
      const queryData = scriptMethod()   
      console.log(queryData)
      return  queryData  
    } catch (error) {
      console.log(error)
    }
  }

  async runQuery(index:number){
    try {
      const f = this.queries[index]
      // console.log(f)
      this.clearResults()
      const q = this.generateQuery(f['data']['query'],f['inputData'])

      if(f['data']['db']=='record'){
        const res = await this.ds.searchRecords(q)
        // console.log(res) 
        this.results = res
      }
      // console.log(q) 
    } catch (error) {
      console.log(error)
    }
  }

}
