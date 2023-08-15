import { Component, Input, OnInit } from '@angular/core'
// import { Router } from '@angular/router'
import { CourseItem } from '../course-item/CourseItem';
import { environment } from 'src/environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css']
})
export class CourseComponent implements OnInit {
  @Input() courses!:any[];
  @Input() isprof!:boolean;
  // courses : CourseItem[];

  constructor (
    private router:Router,
    private activatedRoute:ActivatedRoute
  ) {

    // this.courses = [
    //   {
    //     code: "CS251",
    //     name: "Software Systems Lab",
    //     posts: [],
    //   },
    //   {
    //     code: "CS213",
    //     name: "Data Structures and Algorithms",
    //     posts: [],
    //   }
    // ]

  }

  ngOnInit(): void {

  }
  showForm = false;
  value = "Create a new Course";
  navigate(id:string){
    let newroute = "/courses/";
    if(this.isprof){
      newroute = newroute + "profview/";
    }
    this.router.navigate([newroute + id])
  }
  createCourse() {
    this.showForm = !this.showForm;
    if (this.value == "Create a new Course") {
      this.value = "Hide form";
    }
    else {
      this.value = "Create a new Course";
    }
  }

}
