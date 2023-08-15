import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isauth:boolean=false;
  constructor() { }
  ngOnChanges(){
    console.log(localStorage.getItem('userid'))
    if(localStorage.getItem('userid')==null){
      this.isauth = false;
    }
    else{
      console.log("gu")
      this.isauth = true;
    }
  }
  ngOnInit(): void {
    console.log(localStorage.getItem('userid'))
    if(localStorage.getItem('userid')==null){
      this.isauth = false;
    }
    else{
      // console.log("gu")
      this.isauth = true;
    }
  }
  loguserid(){
    console.log(localStorage.getItem('userid'))
  }

}
