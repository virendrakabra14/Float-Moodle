import { Component, ElementRef, OnInit, Output, ViewChild, EventEmitter} from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { Router,ActivatedRoute } from '@angular/router';

// import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  wrongPassword:boolean = false;
  userDNE:boolean = false;
  // server_url=environment.server_url;
  @Output() authorize:EventEmitter<any> = new EventEmitter();
  constructor(private userservice:UserService,
    private router:Router,
    private activatedRoute:ActivatedRoute) { }
    setAuthorized(userid:any){
      localStorage.setItem('userid', userid);
      
    }
    sendcreds(user_data:any){
    let id = user_data.name;
    let pw = user_data.password;
    this.userservice.sendAuthData(id, pw).subscribe(data=>{
      if(data=='Wrong_Password'){
        this.wrongPassword = true;
        this.userDNE = false;
      }
      else if(data=='User_DNE'){
        this.wrongPassword = false;
        this.userDNE = true;
      }
      else{
        // this.authorize.emit(id)
        this.setAuthorized(id)
        this.wrongPassword = false;
        this.userDNE = false;
        // this.router.navigate(["/dashboard"])
        window.location.assign("/dashboard")
        //above function ensures reload of navbar
        console.log(data.userID)
      }
    })
  } 
  ngOnInit(): void {
    this.activatedRoute.data.subscribe(val=>{
      console.log(val)
      if(val.logout==true &&localStorage.getItem('userid')!=null){
        localStorage.removeItem('userid')
        window.location.reload()
      }
    })
  }

}
