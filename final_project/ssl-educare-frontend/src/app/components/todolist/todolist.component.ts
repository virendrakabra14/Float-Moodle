import { Component, OnInit } from '@angular/core';
import {CourseService} from '../../services/course.service';
@Component({
  selector: 'app-todolist',
  templateUrl: './todolist.component.html',
  styleUrls: ['./todolist.component.css']
})
export class TodolistComponent implements OnInit {
  StudentItems:any[] = []
  ProfItems:any[] = []
  constructor(private courseService:CourseService) { }
  sortDatewise(items:any[]){
    let duedates:string[] = [];
    for(let item of items){
      console.log(item.dueDate)
      if(duedates.findIndex((v)=>{
        return v==item.dueDate
      })==-1){
        duedates.push(item.dueDate);
      }
    }
    let dupStudentItems = [...items]
    items = []
    console.log(dupStudentItems);
    console.log(duedates);
    let newitemobj:any;
    for(let date of duedates){
      newitemobj = {};
      newitemobj['date'] = date;
      newitemobj['dueList'] = dupStudentItems.filter((v,i,a)=>{
        return v.dueDate==date;
      })
      items.push({...newitemobj})
      // console.log()
    }
    // console.log(this.StudentItems)
    items.sort(function(a,b){
      console.log(new Date(a.date).valueOf()-new Date(b.date).valueOf());
      return (new Date(a.date).valueOf()-new Date(b.date).valueOf())
    })
    for(let item of items){
      item.date = new Date(item.date).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
      }).replace(/ /g, '-')
    }

    return items
    }
  ngOnInit(): void {
    let id = localStorage.getItem('userid')
    this.courseService.getToDo(id!,'student').subscribe(data=>{
      console.log(data)
      // this.StudentItems = JSON.parse(data);
      this.StudentItems = this.sortDatewise(data);
    })
    this.courseService.getToDo(id!, 'instructor').subscribe(data=>{
      // this.ProfItems = JSON.parse(data)
      this.ProfItems = this.sortDatewise(data)
      console.log(data)
    })
    this.courseService.getToDo(id!, 'wizard').subscribe(data=>{
      this.ProfItems = this.sortDatewise(data)
      console.log(data)
    })
  }

}
