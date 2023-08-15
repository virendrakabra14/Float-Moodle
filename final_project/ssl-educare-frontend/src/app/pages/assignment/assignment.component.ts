import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as FileSaver from 'file-saver';
import { AssignmentService } from 'src/app/services/assignment.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-assignment',
  templateUrl: './assignment.component.html',
  styleUrls: ['./assignment.component.css']
})
export class AssignmentComponent implements OnInit {
  courseid!:string
  userid!:string
  filehost:string = environment.server_url
  submDate!:Date;
  num!:any
  befduedate:boolean = true;
  taskdata={
    number:0,
    title:"",
    hasfiles:true,
    instruction:"",
    releaseDate:"",
    dueDate:"",
    releaseTime:"",
    dueTime:"",
    published:false,
    acceptSubmission:false,
    files:{
      url:'',
      name:''
    }
  }
  file:any = {
    name:"",
    url:""
  }
  submissiondata = {
    readAssignment:false,
    files:"null",
    grade:0,
    time:"",
    feedback:"",
    id:0,
    comments:[]
  }
  submitted:boolean = false;
  submitting:boolean=false;
  constructor(private route:ActivatedRoute,
    private assignmentService:AssignmentService) { }
  onChange(event:any){
    this.file = event.target.files[0];
  }
  submitFile(data:any){
      console.log(data.file)
      console.log(this.file)
      this.assignmentService.makeSubmission(this.courseid, this.num, this.userid, this.file).subscribe(data=>{
        console.log(data);
      });
      window.location.reload()
    }
  ngOnInit(): void {
    let courseid, num, id;
    courseid = JSON.parse(JSON.stringify(this.route.snapshot.paramMap.get('coursecode') || '{}'));
    num =  JSON.parse(JSON.stringify(this.route.snapshot.paramMap.get('enum') || '{}'));
    this.courseid = courseid
    this.num = num
    console.log(courseid)
    console.log(num)
    this.assignmentService.getAssignmentData(courseid, num).subscribe(data=>{
      console.log(data)
      this.taskdata = data
      
          
    })
    id = localStorage.getItem('userid');
    
    if(id!=null){
      this.userid = id;
      this.assignmentService.getSubmissionData(courseid, num, id).subscribe(data=>{
        console.log(data)
        this.submissiondata = data;
        if(this.submissiondata.files!=null){
          this.submitted = true;
          this.file = this.submissiondata.files
          console.log(this.file.url)
          this.submDate = new Date(data.time.split('+')[0])
          this.submissiondata.time = [this.submDate.getHours().toString() + ':' +this.submDate.getMinutes().toString()+','+this.submDate.getDate().toString(),this.submDate.getMonth().toString(), this.submDate.getFullYear().toString()].join('/');
          // console.log()
          
        }
        else{

        }
      })
    }
    else{
      window.location.assign('/login')
    }

  }

}
