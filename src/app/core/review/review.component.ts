import { Component, OnInit } from '@angular/core';
import { BackendService } from 'src/app/backend.service';
@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css']
})
export class ReviewComponent implements OnInit {

  constructor(private ds: BackendService) { }
  pageLoaded:boolean = false
  loadingMessage:string= " Loading cards to review..."
  inReview:boolean = false
  metadata:any
  ngOnInit(): void {
    this.pageLoaded = false
    //this.inReview
    this.loadList()
  }


  cards:any;

  async loadList(){
    this.metadata = await this.ds.getMetadata()
    this.inReview = false
    try {
      const list = await this.ds.reviewList()
      console.log(list)
      if(list.records.length>0){
        this.pageLoaded = true
        this.cards =  list
      } else{
        this.loadingMessage = "No cards to review as of yet. Refresh page or check back later."
        this.pageLoaded = false
      } 
    } catch (error) {
     console.log(error) 
    }
  }

  loadCardPreview:boolean = false
  reviewIds:any=[]
  currentIndex:number=-1

  startReview(query:string='all'){
    this.reviewIds = []
    this.currentIndex = 0
    const alldt:[any] = this.cards['records']
    const queries:any = {
      'all':()=>{
        alldt.forEach(itm=>{  this.reviewIds.push(itm['_id'])  })
      },
      'new':()=>{
        alldt.forEach(itm=>{ if(itm['data']['reviewDateUTC']==0){ this.reviewIds.push(itm['_id'])} })
      },
      'today':()=>{
        alldt.forEach(itm=>{ if(itm['data']['reviewDateUTC']!=0){ this.reviewIds.push(itm['_id'])} })
      }
    }

    queries[query]()

    this.inReview = true
    this.loadCardPreview = true
  }


  loadNextCard(){
    console.log("loffff")
    this.loadCardPreview = false
    if(this.currentIndex < (this.reviewIds.length-1) ){
      this.currentIndex++

      this.loadCardPreview = true
      // console.log('valid')
    }else{
      this.pageLoaded = false
      this.loadingMessage = " Review session done. Refresh page to see if there are new cards to review"
    }
  }

  handleAfterReview(data:any){
    console.log(data)
    this.loadNextCard()
  }

}
