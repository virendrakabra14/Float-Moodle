import { HttpClient,HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
const httpop = {
  headers: new HttpHeaders({
    'Content-Type':'application/json',
  })
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // apiroot:string = 'https://educare-django.herokuapp.com/users/';
  apiroot:string = environment.server_url+'/users/'
  constructor(private http:HttpClient) {}
  getProfileData(userid:string="all"){
    return this.http.get<any>(this.apiroot + userid+'/', httpop)
  }
  sendAuthData(userid:string, password:string){
    const authHttpOp = {
      params:new HttpParams().append('userid', userid).append('password',password)
    }
    return this.http.post<any>(this.apiroot+"auth/", authHttpOp)
  }
  sendCreateReq(userdata:string){
    const createHttpOp = {
      params:new HttpParams().append('userdata',userdata)
    }
    return this.http.post<any>(this.apiroot + 'create/', createHttpOp)
  }
  sendChangePWReq(userid:string,pwdata:any){
    const createHttpOp = {
      params:new HttpParams().append('pwdata',pwdata)
    }
    return this.http.post<any>(this.apiroot + userid + '/changepw/', createHttpOp)
  }
  sendOTPMail(userid:string){
    return this.http.get<any>(this.apiroot + userid+ '/otpmail/', httpop)
  }
  setProfileData(userid:string,profileData:any){
    const createHttpOp = {
      params:new HttpParams().append('profiledata',profileData)
    }
    return this.http.post<any>(this.apiroot + userid + '/editprofile/', createHttpOp)
  }
}
