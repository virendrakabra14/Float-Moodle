import { Component, OnInit } from '@angular/core';
import { CourseService } from 'src/app/services/course.service';

@Component({
  selector: 'app-grades',
  templateUrl: './grades.component.html',
  styleUrls: ['./grades.component.css']
})
export class GradesComponent implements OnInit {
  studentCourses:any[] = []
  instructorCourses:any[] = []
  constructor(private courseService:CourseService) { }

  ngOnInit(): void {
    let userid = localStorage.getItem('userid')!
    this.courseService.getCoursesByStudent(userid).subscribe(data=>{
      console.log(data)
      this.studentCourses = data;
    })
    this.courseService.getCoursesByInstructor(userid).subscribe(data=>{
      this.instructorCourses = data
    })
  // console.log(localStorage.getItem('blah'))
  // console.log(localStorage.getItem('blah')!)

  }

}
