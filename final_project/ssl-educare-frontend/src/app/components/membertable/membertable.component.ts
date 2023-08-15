import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import * as FileSaver from 'file-saver';
import { AssignmentService } from 'src/app/services/assignment.service';

@Component({
  selector: 'app-membertable',
  templateUrl: './membertable.component.html',
  styleUrls: ['./membertable.component.css']
})
export class MembertableComponent implements OnInit {
  @Input('title') title:string="";
  @Input('courseid') courseid:string="";
  @Input('data') data = {
    'members':[
      {'userID':'a'}
    ],
    'memberdata':[
        {'userID':'1',
        'username':'un',
        'score':'tbg',
        'email':'',
        "taskGrades": [
          {
            "name":"a",
            "number":1,
            "score": 5.1
          }
          ]
        }
    ]
  };
  datain:boolean = false
  @Input('level') level:number = 0;
  @Input('memberids') memberids:string[]=[];
  @Output('sendlist') sendlist:EventEmitter<any> = new EventEmitter();
  @ViewChild('newmembers') inputelem!:ElementRef;
  @ViewChild('table') table!:ElementRef;
  editing:boolean = false;
  deflevels:any = {
    'students':0,
    'wizards':1,
    'instructors':4
  }
  fields:any = {
    'students':['User ID', 'Grade', 'Submission'],
    'instructors':['User ID'],
    'wizards':['User ID', 'Access Level']
  }
  constructor(private assignmentService:AssignmentService, private http:HttpClient) { }
  remove(id:string){
    for(let i =0;i<this.data['members'].length;i++){
      if(this.data['memberdata'][i]['userID']==id){
        this.data.members.splice(i,1);
        this.data.memberdata.splice(i, 1);
        // console.log(this.memberids);
        return;
      }
    }
  }
  sendList(){
    this.data.members.push({'userID':this.title.toLowerCase()})
    console.log(this.data.members)
    this.sendlist.emit(this.data.members)
    //send list out.
  }
  downloadList(){
    console.log(this.data['memberdata'])
    let data = [...this.data['memberdata']]
    let textdata = JSON.stringify(data);
    textdata = textdata.split('},{').join('},\n{')
    let blob = new Blob([textdata]);
    FileSaver.saveAs(blob, this.courseid+'_'+this.title.toLowerCase()+".txt")

    // console.log()
  }
  getKeys(data:any[]){
    console.log(data)

    let keys:string[] = [];
    for(let card of data){
      keys.push(Object.keys(card)[0])
    }
    return keys
  }
  saveUserSubmission(userid:string, name:string){
    let enumL = Number.parseInt(name.replace('A', ''))-1
    this.assignmentService.getSubmissionData(this.courseid, enumL, userid).subscribe(data=>{
      FileSaver.saveAs(new Blob([JSON.stringify(data)], {type:'text'}), this.courseid+'_'+userid+'_A'+enumL.toString()+'.txt')
      const param = new HttpParams();
      const options = {
        params:param
      }
      if(data.files!='' && data.files!=null){
        this.http.get(data.files.url, {...options, responseType:'blob'}).subscribe(
          data2=>{
            console.log(data2)
            FileSaver.saveAs(data2, data.files.name)
          }
        );
  
      }
      // FileSaver.saveAs(data.files, this.courseid+'_'+userid+'_file'+'.txt', )
      
    })

  }
  addMembers(){
    let inputstr:string = this.inputelem.nativeElement.value;
    let idlist:string[] = this.inputelem.nativeElement.value.split(',');
    let objlist = [...this.data.members];
    console.log(idlist);
    for(let item of idlist){
      let element:any = {};
      element[item.trim()] = this.deflevels[this.title.toLowerCase()];
      objlist.push(element)
    }
    objlist.push({'userID':this.title.toLowerCase()})
    this.sendlist.emit(objlist);
  }
  collectFiles(ev:any){
    console.log(ev);
    let fr = new FileReader();
    fr.onload = ()=>{
      let text = fr.result?.toString();
      if(text!=undefined){
        let data = JSON.parse(text);
        //add processors
      }

    }
    fr.readAsText(ev[0]);

  }
  getLevelbyId(memberdatum:any){
    let id = memberdatum['userID']
    let obj:any = this.data.members.find(v=>Object.keys(v)[0]==id)
    return obj[id]
    // console.log()
    // console.log([memberdatum['userID']])
  }
  changeLevelbyId(memberid:string, delta:number){
    let obj:any = this.data.members.find(v=>Object.keys(v)[0]==memberid);
    let currlevel = obj[memberid]
    if(currlevel<this.deflevels['instructors']-1 && delta>0){
     obj[memberid] += delta
      // this.data(memberid)] = {memberid:currlevel + delta}
    }
    if(currlevel > this.deflevels['students']+1 && delta<0){
      obj[memberid]+=delta
    }

  }
  // ngAfterViewInit(){
  //   console.log(this.data)
  //   this.members = this.data['members']
  //   // console.log(this.members)
  //   // console.log(this.data)
  //   // this.memberids = this.getKeys(this.members)
  //   this.memberdata = this.data['memberdata']
  // }
  ngOnInit(): void {
    // bind
    // console.log(this.members)
  }

}
