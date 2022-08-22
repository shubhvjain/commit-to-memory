import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SampleDataService {

  constructor() { }

  sampleData:any = {
    "metadata": {
      "data": {
        "cardTypes": [
          {
            "name": "German",
            "active": true,
            "inputs": [
              "english:text:some word",
              "german:text:word",
              "learnSpelling:boolean:false"
            ],
            "display": "await loadJS(\"https://cdn.jsdelivr.net/npm/vue@2\")\nconst getRandomIntegerBetween = (max,min)=> Math.floor(Math.random() * (max - min + 1) ) + min\nprint(`\n<style> .fbg { font-size:larger }</style>\n<div id=\"projApp\"  class=\"\">\n<div class=\"card\">\n\t<div class=\"card-body\">\n        <span v-html=\"display.question\"></span>\n\t\t<div v-if=\"display.spell\">\n        \t<br>\n            <div class=\"form-group row\">\n    \t\t\t<label for=\"inputSpell\" class=\"col-sm-3 col-form-label\">Also, try spelling  it :</label>\n    \t\t\t<div class=\"col-sm-9\">\n      \t\t\t\t<input \n                    type=\"text\" \n                    v-model=\"spelling.input\" \n                    v-on:input=\"checkSpelling()\" \n                    class=\"form-control\"   \n                    :class=\"{ 'is-invalid': !spelling.correct , 'is-valid': spelling.correct }\"  \n                    id=\"inputSpell\">\n    \t\t\t</div>\n  \t\t\t</div>  \n        </div>\n        <br>\n\t\t<button v-on:click=\"revealAnswer()\" class=\"btn btn-sm btn-dark p-1 m-2\">Reveal</button>\n\t</div>\n</div>\n<div v-if=\"showAnswer\">\n<br>\n<div class=\"card\">\n\t<div class=\"card-body\">\n\t\t<div class=\"card-title\"> <b>Answer</b></div>\n        <span v-html=\"display.answer\"></span>\n\t</div>\n</div>\n</div>\n</div>\n`)\n\nconst app = new Vue({\n  el: '#projApp',\n  data: {\n    showAnswer:false,\n    display: {question:\"\",answer:\"\",spell:false,correctSpelling:\"\"},\n    spelling : {input:\"\",correct:false}\n  },\n  mounted: function (){\n    \n    const randomNumber = getRandomIntegerBetween(1,10)\n    const showInEnglish = !(randomNumber%3 == 0)\n    // pick a random integer between 1 and 10. show in English if it is not a mulitple of 3. there are more chances of getting english--> german\n    let temp = { quePhrase:\"\", queToLanguage:\"\",answer:\"\"}\n    \n\ttemp.quePhrase = showInEnglish ? reviewData.input.english :  reviewData.input.german\n    temp.queToLanguage = showInEnglish ? \"German\" :  \"English\"\n    temp.answer = showInEnglish ? reviewData.input.german : reviewData.input.english \n\n    if(showInEnglish){      \n      // also see if spelling check is required for the phrase only if the question is in English\n      if(reviewData.input.learnSpelling){\n    \tthis.display.spell = true\n      \tthis.display.correctSpelling = reviewData.input.german\n      }  \n    }\n    this.display.question = `What is <code class=\"fbg\"> ${temp.quePhrase} </code> in ${temp.queToLanguage} ?   `\n    this.display.answer = ` It is  : <code class=\"fbg\"> ${temp.answer} </code>  `    \n    \n  },\n  methods: {\n  \trevealAnswer: function(){\n    \tthis.showAnswer = true\n      resize()\n    },\n    checkSpelling: function(){\n    \tthis.spelling.correct = this.display.correctSpelling == this.spelling.input\n    }\n  },\n})\n",
            "inputHelp": "Use this flashcard to review words/phrases in German. \nCreation : add the phrase in English , then add the equivalent phrase in German. Put only the actual phrase. They will be asked as question during the review. The question will be generated randomly. It can either ask for the German phrase of given English phrase or vice versa. ",
            "displayHelp": "Read the question and try to recall the answer. Click on \"Reveal\" to display the correct answer. You might also see a box where you can try spelling the phrase (the box turns green if you spell it correctly!)",
            "storePreview": false,
            "test": {
              "input": "english: welcome\ngerman: willkommen\nlearnSpelling: true\n",
              "diplay": ""
            }
          }
        ],
        "reviewAlgorithms": [
          {
            active:true,
            name: "Sample",
            process: "process described here",
            descr: "this is a test",
            feedbackInput: [],
            initialValue: "return {dateUTC: utils.dateObjToUTC(new Date()).dateUTC } ",
            test: { feedbackInput: "", review: "" },
          }
        ],
        "options": {
          "startReviewByDefault": true,
          "defaultReviewAlgorithm":"Sample"
        }
      }
    }

  }

  getSample(key:string){
    return this.sampleData[key]
  }

}
