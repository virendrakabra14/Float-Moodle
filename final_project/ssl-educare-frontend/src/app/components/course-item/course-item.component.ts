import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Routes } from '@angular/router';
import { AssignmentComponent } from 'src/app/pages/assignment/assignment.component';
import { AssignmentService } from 'src/app/services/assignment.service';
import { CourseService } from 'src/app/services/course.service';
import { PostService } from 'src/app/services/post.service';
import { CreateCourseComponent } from '../create-course/create-course.component';
import { CourseItem } from './CourseItem';

// public courseItem : CourseItem;
// const routes: Routes = [
//   {path: 'create_course', component:CreateCourseComponent},
//   {path: 'abc', component:AssignmentComponent}

// ];
@Component({
  selector: 'app-course-item',
  templateUrl: './course-item.component.html',
  styleUrls: ['./course-item.component.css']
})

export class CourseItemComponent implements OnInit {
  loaded:boolean = false;
  courseItem:any={
    courseCode:"",
    courseID:"",
    courseName:"",
    instructors:[],
    students:[]
  };
  posts: any[]=[
    {instruction:''}
  ]
  assignments: any[]=[
    {instruction:''}
  ];
  arr:Number[] = [1, 2, 3]
  constructor (private route: ActivatedRoute,
    private courseService:CourseService,
    private assignmentService:AssignmentService,
    private postService:PostService,
    private router:Router) {
    // this.courseItem = {
    //   code: "AA101",
    //   name: "Fetch name",
    //   posts: [
    //     { title: "Title1", desc: "Desc1", files: [new File(["Blobpart1_1"], "file1_1.txt"), new File(["Blobpart1_2"], "file1_2.txt")] },
    //     { title: "Title2", desc: "Desc2", files: [new File(["Blobpart2_1"], "file2_1.txt"), new File(["Blobpart2_2"], "file2_2.txt")] }
    //   ]
    // };
  }

  ngOnInit(): void {
    
    let courseid = JSON.parse(JSON.stringify(this.route.snapshot.paramMap.get('code') || '{}'));
    this.courseService.getCourseData(courseid).subscribe(data=>{
      console.log(data);
      this.courseItem = data;
      this.loaded=true;
    });
    this.assignmentService.getAssignmentData(courseid).subscribe(data=>{
      this.assignments = data
      this.assignments = this.assignments.reverse();
      console.log(data)
    })
    this.postService.getPostData(courseid).subscribe(data=>{
      this.posts = data
      this.posts = this.posts.reverse();
      console.log(data)
    })
  }
  navigateToSub(task:any){
    let id = localStorage.getItem('userid')
    console.log(task)
    if(this.courseItem.students.includes(id)){
      this.router.navigate(['./assignments/'+task.number], {relativeTo:this.route})
      this.router.navigate(['/assignments/'+this.courseItem.courseID+'/'+task.number], {relativeTo:this.route})
    }
    else{

    }
  }
  navigateToPost(post:any){
    let id = localStorage.getItem('userid')
    console.log(post)
    if(this.courseItem.students.includes(id)){
      this.router.navigate(['./posts/'+post.number], {relativeTo:this.route})
      this.router.navigate(['/posts/'+this.courseItem.courseID+'/'+post.number], {relativeTo:this.route})
    }
    else{

    }
  }
}
