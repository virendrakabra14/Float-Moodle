import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  constructor(private userService:UserService) { }
  ngOnInit(): void {
  }
  createUser(tosend:string){
    console.log(tosend)
    this.userService.sendCreateReq(tosend).subscribe(data=>{
      console.log(data)
      window.location.assign('/login')
    });
  }

}
