import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AssignmentService } from 'src/app/services/assignment.service';
import { CourseService } from 'src/app/services/course.service';
import { PostService } from 'src/app/services/post.service';
import { NgForm, NgModelGroup } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { UploaderComponent } from 'src/app/components/uploader/uploader.component';
const MIMETYPE = {
  pdf:'application/pdf',
  zip:'application/zip'
}
@Component({
  selector: 'app-profcourse',
  templateUrl: './profcourse.component.html',
  styleUrls: ['./profcourse.component.css']
})

export class ProfcourseComponent implements OnInit {
  
  courseid!:string
  @ViewChild('postForm') postform!:NgForm
  @ViewChild('assignForm') assignform!:NgForm
  @ViewChild('assessForm') assessform!:NgForm
  @ViewChild('hiddenSender') sender!:ElementRef
  @ViewChild('hiddenGetter') getter!:ElementRef
  @ViewChild('fileName') filename!:ElementRef
  @ViewChild('uploader') uploader!:UploaderComponent
  course:any = {
    id:0,
    instructors:[''],
    students:[''],
    courseName:'',
    courseID:'',
    courseCode:'',
  }
  assignments = [
    {
      instruction: "",
      number: 0,
      seenby:0,
      submittedby:0,
      published: false,
      graded:false,
      releaseDate: "",
      releaseTime:"",
      dueDate:"",
      dueTime:"",
      weight:2,
      hasfiles:false,
      files:{
        name:'',
        url:''
      },
      title: ""
    }
  ]
  posts = [
    { 
      hasfiles:true,
      files: {
        name:'',
        url:''
      },
      instruction: "",
      number: 1,
      published: false,
      releaseDate: "2021-10-09",
      title: "Vocabularo"
    }
  ]
  userid:string = ''
  taskdata:any = {}
  postdata:any = {}
  gradertype:string = ''
  accesslevel:number = 0
  members:any={
    students:[],
    instructors:[],
    wizards:[]
  }
  filehost:string = environment.server_url
  tasknumtemp!:number
  releaseTaskNow:boolean = false;
  releasePostNow:boolean = false;
  datesinvalid:boolean = false;
  makingAssignment:boolean = false;
  editingAssignment:boolean = false;
  makingPost:boolean = false;
  editingPost:boolean = false;
  tempfileholder:any
  constructor(private assignmentService:AssignmentService,
    private courseService:CourseService,
    private postService:PostService,
    private route:ActivatedRoute,
    private router:Router) { }
    hideAllForms(){
      this.makingAssignment = false;
      this.makingPost = false;
      this.editingAssignment = false;
      this.editingPost = false;
    }
    getAccessLevel(userid:string, members:any){
      let concatroles:any[] = []
      for(let role of Object.keys(members)){
        // console.log(role)
        concatroles = concatroles.concat(members[role]['members'])
      }
      // console.log(members)
      console.log(concatroles)
      for(let card of concatroles){
        if(card[userid]!=undefined){
          return card[userid]
        }
      } 
      return -1
    }
    sendEditedList(data:any[]){
      // console.log(data)
      // console.log(data[0][Object.keys(data[0])[0]])
      let roleobj = data.pop()
      // console.log(roleobj['role'])
      this.courseService.sendMemberData(this.courseid, roleobj['userID'], data).subscribe(data=>{
        console.log(data)
        if(data.length>0){
          window.alert('Error. The following IDS are unreal: ' + data.toString())
        }
        // this.members[] data[roleobj['userID']]
        this.courseService.getMemberData(this.courseid).subscribe(d=>{
          this.members = d;
        })
      })
    }
    makeAssignmentData(data:any){

      let dupdata = {...data};
      console.log(this.tempfileholder)
      console.log(dupdata)
      dupdata['releaseDate']+=('T'+data['releaseTime']+':00')
      dupdata['dueDate']+=('T'+data['dueTime']+':00')  
      if(this.editingAssignment){
        console.log(dupdata.releaseDate)

        this.assignmentService.updateAssignment(dupdata, this.courseid,this.userid,this.taskdata.number, this.tempfileholder).subscribe(data=>{
          this.assignform.reset()
          this.releaseTaskNow = false;
          this.hideAllForms();
          this.uploader.files = []
          this.assignments = data;
          window.alert("Successfully saved your changes!")
          this.hideAllForms()
        },error=>{
          window.alert("Error. Please check the changes you've made.")
        });
    
      }
      else{
        this.assignmentService.createAssignment(dupdata, this.courseid, this.userid,this.tempfileholder).subscribe(data=>{
          this.assignform.reset()
          this.releaseTaskNow = false;
          this.uploader.files = []
          window.alert("Successfully Made Assignment!")
          this.assignments = data
        }, error=>{
          window.alert("Error. Please check the form.");
        });
      }

  }
  validateDates(form:NgForm){
    let today = new Date;
    let reltime = form.value.releaseTime;
    let releaseDate = form.value.releaseDate;
    if(!this.releaseTaskNow){
      if(!(releaseDate=="")){
        let rdate = new Date(releaseDate+'T'+reltime +':00');
        console.log(releaseDate+'T'+reltime +':00')
        if(rdate.valueOf()<today.valueOf()&&(!(this.editingAssignment||this.editingPost))){
          console.log("H");
          this.datesinvalid = true;
          return;
        }
        else{
          this.datesinvalid = false;
        }
      }
    }
    if(form!=this.postform){
      let duetime = form.value.dueTime;
      let dueDate = form.value.dueDate;
      if(!(dueDate=="")){
        let ddate = new Date(dueDate+'T'+duetime+':00');
        if(ddate<today){
          // console.log("H");
          this.datesinvalid = true;
          return;
        }
        if(!(releaseDate=="")){
          let rdate = new Date(releaseDate +'T'+reltime+':00');
          if(ddate.valueOf()<=rdate.valueOf()){
            this.datesinvalid = true;
            return;
          }
        }
      }
    }

    
    this.datesinvalid = false;
  }
  deleteElement(type:string, num:number){
    if(type=='post'){
      this.postService.updatePost({delete:true},this.courseid, this.userid,num, null).subscribe(data=>{
        this.posts = data
      })

    }
    else if(type=='assignment'){
      this.assignmentService.updateAssignment({delete:true}, this.courseid,this.userid, num).subscribe(data=>{
        this.assignments = data
      })
    }
  }
  markAsGraded(tasknumber:number,notretract:boolean=true){
    let updateData = {
      releaseGrades:notretract
    }
    this.assignmentService.updateAssignment(updateData, this.courseid, this.userid,tasknumber).subscribe(data=>{
      this.assignments = data
      if(this.assignments.find(v=>v.number==tasknumber)!.graded!=notretract){
        window.alert('Failed to Release Grades. Please ensure that the due date has passed and that all submissions have been graded.')
      }
      // console.log()
      // console.log(data)
    });
  }
  loadFormToEdit(tasknumber:number,form:string){
    if(form=='assignform'){
      this.taskdata['number'] = tasknumber
      // this.assignform.setValue({'releaseTaskNow':false})
      this.hideAllForms();this.editingAssignment = true;
      this.assignmentService.getAssignmentData(this.courseid, tasknumber, true).subscribe(data=>{
        data.releaseTaskNow = false;
        delete data.number
        delete data.published
        delete data.seenby
        delete data.submittedby
        delete data.author
        delete data.hasfiles
        console.log({...data})
        // if(data.files!="" && data.files!=null){
        delete data.files
        // }
        delete data.graded
        delete data.acceptSubmission
        this.assignform.setValue(data);
      })
    }
    else if(form=='postform'){
      this.postdata['number'] = tasknumber
      this.hideAllForms(); this.editingPost = true;
      this.postService.getPostData(this.courseid, tasknumber, 'instructor').subscribe(data=>{
        console.log(data)
        data.releasePostNow = false;
        delete data.id
        delete data.hasfiles
        delete data.number
        delete data.author
        delete data.comments
        delete data.files
        delete data.published
        console.log(form)
        this.postform.setValue(data);
      })
    }
    }

  makePost(data:any){
    
    // console.log(data);
    let dupdata = {...data}
    dupdata['releaseDate']+=('T'+data['releaseTime']+':00')
    if(this.editingPost){
      this.postService.updatePost(dupdata, this.courseid, this.userid,this.postdata.number, this.tempfileholder).subscribe(data=>{
        console.log(data)
        this.posts = data
        window.alert("Successfully saved your changes!")
        this.releasePostNow = false;
        this.postform.reset()
        this.hideAllForms()
        this.uploader.files = []
      })
    }else{
      this.postService.createPost(data, this.courseid,this.userid,this.tempfileholder).subscribe(data=>{
        this.releasePostNow = false;
        this.uploader.files = []
        window.alert("Successfully Made Post!")
        this.postform.reset()
        this.posts = data;
      }, error=>{
        window.alert("Error. Please check the form.");
        
      });  
    }
    
  }
  ngOnInit(): void {
    this.courseid = JSON.parse(JSON.stringify(this.route.snapshot.paramMap.get('code') || '{}'));
    this.courseService.getCourseData(this.courseid).subscribe(data=>{
      this.course = data
      let userid = localStorage.getItem('userid');
      if(userid!=null){
        this.userid = userid;
        let iswiz = this.course.wizardcards.filter((v:any)=>{console.log(Object.keys(v)[0]);return Object.keys(v)[0]==userid}).length>0;
        this.course.wizardcards.forEach((v:any)=>{console.log(Object.keys(v))})
        console.log([userid])
        console.log(this.course.wizardcards.filter((v:any)=>{Object.keys(v)==[userid]}))
        let allowed = iswiz||this.course.instructors.includes(userid);
        if(allowed){
          this.assignmentService.getAssignmentData(this.courseid,-1,true).subscribe(data=>{
            this.assignments = data;
            console.log(this.assignments)
          })
          this.postService.getPostData(this.courseid,-1,'instructor').subscribe(data=>{
            this.posts = data;
          })
          // console.log("is prof")
          if(iswiz){
            this.accesslevel = this.course.wizardcards.filter((v:any)=>{return Object.keys(v)[0]==userid})[0][userid];
            // console.log(this.accesslevel)
          }
          else{
            this.accesslevel = 4;  
          }
          this.courseService.getMemberData(this.courseid).subscribe(data=>{
            console.log(data);
            this.members = data;      
          })
        }
        else{
          this.router.navigate(["/dashboard"])
          //user not in instructors list. Redirect to dashboard.
        }
      }
      else{
        //user not logged in: redirect to login
        this.router.navigate(["/login"])
      }

    })
    // console.log(this.courseid + "Is the id");
  }
  collectFiles(files:any){
    console.log(files);
    this.tempfileholder = files[0]
  }
  triggerFileChooser(task_num:number=-1, type:string){
    console.log(task_num);
    this.tasknumtemp = task_num;
    this.gradertype = type;
    console.log("Called");
    this.sender.nativeElement.click()
  }
  submitGrader(event:any){
    if(this.sender.nativeElement.files.length<1){
      // this.filename.nativeElement.innerHTML = ""
      return
    }
    if(this.tasknumtemp==-1){
      this.tempfileholder = event.target.files[0]
      this.filename.nativeElement.innerHTML += event.target.files[0].name
      return
    }
    this.assignmentService.sendGrader(this.courseid,this.userid,this.tasknumtemp, this.gradertype,event.target.files[0]).subscribe(data=>{
      if(this.gradertype=='auto'){
        if(data!='success'){
          console.log(data)
          window.alert(data.msg)
        }
        else{
          window.alert(data.msg)
        }
      }
      else if(this.gradertype=='manual'){
        if(data.NE_users.length!=0){
          window.alert("Following userids do not exist:"+ data.NE_users.toString())
        }
        if(data.NE_students.length!=0){
          window.alert("Following userids are not in the course: "+data.NE_students.toString())
        }
        if(data.msg!=''){
          window.alert(data.msg)
        }
      }
      this.sender.nativeElement.value = null
      
    })
  }
  downloadSubmissions(tasknum:number){
    this.assignmentService.getSubmissions(this.courseid, tasknum).subscribe(data=>{
      console.log(data)
      this.getter.nativeElement.href = this.filehost + data.zippath
      console.log(this.getter.nativeElement.href)
      this.getter.nativeElement.click()
    })
  }
}
