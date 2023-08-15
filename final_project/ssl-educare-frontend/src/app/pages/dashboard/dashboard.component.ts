import { Component, ElementRef, OnInit } from '@angular/core';
import { CourseService } from 'src/app/services/course.service';
import { UserService } from 'src/app/services/user.service';
import { CourseComponent } from '../../components/course/course.component';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  studentCourses:any = []
  instructorCourses:any = []
  wizardCourses:any = []
  userdata:any = {
    username:"",
    userID:"",
    email:""
  }
  constructor(private courseService:CourseService, private userService:UserService) { }
  ngOnInit(): void {
    let id = localStorage.getItem('userid')
    
    console.log(id)
    if(id!=null){
      this.userService.getProfileData(id).subscribe(data=>{
        console.log(data)
        this.userdata = data;
      })
      this.courseService.getCoursesByStudent(id).subscribe(data=>{
        console.log(data)
        this.studentCourses = data
      })
      this.courseService.getCoursesByInstructor(id).subscribe(data=>{
        console.log(data)
        this.instructorCourses = data;
      })
      this.courseService.getCoursesByWizard(id).subscribe(data=>{
        console.log(data)
        this.wizardCourses = data;
      })
    }
    else{
      window.location.assign('/login')
    }
  }

}
