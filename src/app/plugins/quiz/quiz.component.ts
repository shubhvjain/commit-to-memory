import { Component, OnInit } from '@angular/core';
import { BackendService } from 'src/app/backend.service';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit {

  constructor(public ds: BackendService) { }
  query:string=""
  results:any=[]
  metadata:any
  displayPage:boolean = false;

  ngOnInit(): void {
    this.loadPage()
  }
  async search(){
    if(this.query !=""){
      this.results= []
      this.current = -1
      this.loadCard = false
      const results =  await this.ds.loadCardsWithTag(this.query)
      console.log(results)
      this.results = results
      this.next()
    }
  }
  async loadPage(){
    try {
      const mdata = await this.ds.getMetadata()
      this.metadata = mdata.flashcard
      this.displayPage = true
    } catch (error) {
      console.log(error)
    }    
  }
  current:number = -1
  loadCard = false
  next(){
    if(this.current < this.results.length-1){
      this.loadCard = false
      this.current++
      this.loadCard = true
    }
  }
  back(){
    if(this.current >= 1){
      this.loadCard = false
      this.current--
      this.loadCard = false

    }
  }

}
