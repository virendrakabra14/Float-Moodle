import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userdata:any = {
    username:"",
    email:"",
    userID:"",
    DOB:"",

  }
  changepwtimer:number = 0;
  newpwmismatch:boolean = false;
  notnewpw:boolean = false;
  changepw:boolean = false;
  editprofile:boolean = false;
  constructor(private userService:UserService) { }
  submitchangepw(data:any){
    console.log(data);
    if(data.currpw==data.newpw1){
      this.notnewpw = true;
      return;
    }
    else{
      this.notnewpw = false; 
    }
    if(data.newpw1!=data.newpw2){
      this.newpwmismatch = true;
      return;
    }
    else{
      this.newpwmismatch = false;
    }
    this.userService.sendChangePWReq(this.userdata.userID,data).subscribe(data=>{
      if(data=="success"){
        window.alert("Change Successful!")
        this.changepw = false;
      }
      else{
        window.alert("Change failed because: "+data.toString())
      }
      console.log(data)
      
    })

  }
  submiteditprofile(profileData:any){
    if(!(profileData.username&&profileData.email&&profileData.DOB&&profileData.password)){
      window.alert("Please fill all the fields.")
      return
    }
    // console.log(profileData);
    this.userService.setProfileData(this.userdata.userID, profileData).subscribe(data=>{
      // console.log(data);
      this.editprofile = false;
      window.location.reload()
    },err=>{
      window.alert("Edit failed. Fill the fields right.")
    })
  }
  decrementTimer(delta:number){
    this.changepwtimer-=delta
  }
  initChangePassword(){
    console.log(this.userdata)
    this.userService.sendOTPMail(this.userdata.userID).subscribe(data=>{
      // if(data=="success"){
        // console.log(data)
        this.changepwtimer = data;
        let recursiveDecrement = (delta:number)=>{setTimeout(()=>{
            this.decrementTimer(delta);
            if(this.changepwtimer>0){
              recursiveDecrement(delta);
            }
          }, delta*1000)}
        recursiveDecrement(1);
        window.alert(`An OTP (valid for only ${data}s) has been sent to your registered email ID. You will need that to change the password.`)
        this.changepw = true;
      // }
    })
  }
  ngOnInit(): void {
    let id = localStorage.getItem('userid');
    if(id!=null){
      this.userService.getProfileData(id).subscribe(data=>{
        this.userdata = data;
        console.log(this.userdata)
      })
    }else{
      window.location.assign('/login')
    }

  }

}
