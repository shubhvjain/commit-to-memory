import { Component, OnInit } from '@angular/core';

import { BackendService } from 'src/app/backend.service';
import { UtilsService } from 'src/app/utils.service';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent implements OnInit {

  constructor(public ds: BackendService, private util: UtilsService) { }

  loaded:boolean = false;
  scripts:any[] = []

  ngOnInit() {
    this.loadFrontendScripts()    
  }
  async loadFrontendScripts(){
    try {
      this.loaded = false
      const q = {"structure":"frontend-script","data.tags":{"$in":["dashboard"]}}   
      //const res = await this.ds.searchRecords(q)
      const addSettings:any[]= await this.ds.getAdditionalServerConfig("reportScripts")
      // console.log(addSettings)
      let filters:any[] = addSettings
      filters.forEach(itm=>{
        itm['showForm'] = false
        const fd = this.util.convertInputToFormData(itm['data']['input'])
        itm['inputForm'] = fd.formData
        itm['inputData'] = fd.data
      })
      this.scripts = filters
      this.loaded = true
      //console.log(this.scripts)
    } catch (error) {
      console.log(error)
    }
  }

  openForm(index:number){
    if(this.scripts[index]['data']['input'].length >0){
      this.scripts[index]['showForm'] = true
    }else{
      this.runQuery(index)
    } 
  }

  closeForm(index:number){
    this.scripts[index]['showForm'] = false
  }

  toggleForm(index:number){
    if(this.scripts[index]['data']['input'].length >0){
      this.scripts[index]['showForm'] = !this.scripts[index]['showForm'] 
    }else{
      this.runQuery(index)
    } 
  }

  generateQuery(input:any,script:string){
   const serverConfig = this.ds.getServerConfig()
   const staticUrl = serverConfig.staticFilesUrl
   let iframeName ="thisistheiframetouse"

   let configs1 = {
      token: localStorage.getItem('token'),
      user: localStorage.getItem('user'),
      baseURL: serverConfig.dataBaseUrl +"/service",
      baseURL1:serverConfig.dataBaseUrl 
    }
    // console.log(configs1)
    localStorage.setItem("codeConfig", JSON.stringify(configs1))
    let qw = " ";
    let defHTML = ` 
    <script src="${staticUrl}/scripts/codescripts.js"> </script>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css">
    <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
    <div id='result'></div>  `;
    let defStyle = ` `
    let jsPart = `  
    <script type='text/javascript'> 
    var height;
resize = () => {
if (height !== document.getElementById('result').offsetHeight) {
  let iframeName = "${iframeName}"
  height = document.getElementById('result').offsetHeight;
  window.parent.postMessage({
    frameHeight: height,
    iframeName: iframeName
  }, '*');
}
}
    window.onresize = () => resize();
    window.onload= async function(){
      resize()
      function print(data=""){
        let pr = data
  if(typeof data== "object"){
    pr = "<pre>"+JSON.stringify(data,null,1)+'<\pre>'
  }
  document.getElementById("result").innerHTML += pr
  resize()
      }
      async function loadJS(file){
        return new Promise((resolve,reject)=>{
          let a = this;
          let myScript = document.createElement("script");
          myScript.setAttribute("src",file);
          document.body.appendChild(myScript);
          myScript.addEventListener("load", scriptLoaded, false);
          function scriptLoaded() {resolve()}
        })
    }
    function loadCSS(file){
      var fileref = document.createElement("link");
      fileref.rel = "stylesheet";
      fileref.type = "text/css";
      fileref.href = file;
      document.getElementsByTagName("head")[0].appendChild(fileref)
    }
    const input = ${JSON.stringify(input)}
      ${script}
    }
    </script>`
    qw = defHTML + defStyle + jsPart
    return qw
  }

  async runQuery(index:number){
    try {
      const f = this.scripts[index]
      // console.log(f)
      this.clearScript()
      this.scriptLoaded = true
      const q = this.generateQuery(f['inputData'],f['data']['script'])
      let iframeName = "thisistheiframetouse"
      let ifr:any = document.getElementById(iframeName)
      if (ifr) {
        var code = ifr['contentWindow'].document;
        code.open();
        code.write(q);
        code.close();
        
      }
          } catch (error) {
            console.log(error)
    }
  }
  scriptLoaded = false
  clearScript(){
    this.scriptLoaded = false
    let iframeName = "thisistheiframetouse"
      let ifr:any = document.getElementById(iframeName)
      if (ifr) {
        var code = ifr['contentWindow'].document;
        code.open();
        code.write("");
        code.close();
      }
  }

}
