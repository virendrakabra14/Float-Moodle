import { Component, Input, OnInit } from '@angular/core';
import { CoursePost } from './CoursePost';

@Component({
  selector: 'app-course-post',
  templateUrl: './course-post.component.html',
  styleUrls: ['./course-post.component.css']
})
export class CoursePostComponent implements OnInit {

  @Input() post:any;

  constructor() { 
    // this.post = {
    //   title: "Title",
    //   desc: "Desc",
    //   files: [new File(["Blobpart1"], "file1.txt"), new File(["Blobpart2"], "file2.txt")],
    // };
    // /*
    // for (let i=0; i<this.post.files.length; i++) {
    //   this.filenames.push(this.post.files[i].name);
    // }
    // */
   }

  ngOnInit(): void {

  }

}
