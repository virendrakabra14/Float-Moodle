import { Injectable, ɵresetJitOptions } from '@angular/core';
import { HttpClient,HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import * as FileSaver from 'file-saver';
const httpop = {
  headers: new HttpHeaders({
    'Content-Type':'application/json',
  })
}
@Injectable({
  providedIn: 'root'
})
export class AssignmentService {
  // apiroot = "https://educare-django.herokuapp.com/assignments/"
  apiroot = environment.server_url + '/assignments/'
  constructor(private http:HttpClient) { }
  getAssignmentData(courseid:string, enumL=-1, forprof=false){
    let enumstr = '/'+enumL.toString() + '/';
    if(enumL==-1){
      enumstr = '/all/'
    }
    if(forprof){
      enumstr = enumstr + 'instructor/';
    }
    else{
      enumstr = enumstr + 'student/';
    }
    return this.http.get<any>(this.apiroot+courseid +enumstr,httpop)
  }
  createAssignment(data:any, courseid:string, userid:string,file:any=null){
    // let enumstr = '/'+enumL.toString()+'/'
    console.log("Here")
    let uploadData = new FormData();
    uploadData.append('data', JSON.stringify(data))
    if(file!=null){
      uploadData.append('file', file, file.name);
    }

    // console.log(uploadData)
    // return
    return this.http.post<any>(this.apiroot + courseid+'/'+ userid +'/create/',uploadData);
  }
  getSubmissionData(courseid:string, enumL:number, userid:string=''){
    if(userid==""){
      userid = 'all'
    }
    let suffix = courseid + '/' + enumL +'/submissions/'+ userid + '/'
    return this.http.get<any>(this.apiroot+suffix,httpop)
  }
  makeSubmission(courseid:string, enumL:number, userid:string, file:any){
    let suffix = courseid + '/' + enumL +'/submissions/'+ userid + '/submit/';
    let uploadData = new FormData();
    uploadData.append('userid', userid);
    uploadData.append('file', file, file.name);

    return this.http.post<any>(this.apiroot + suffix, uploadData);
  }
  sendGrader(courseid: string, userid:string,enumL:number, type:string,file:any){
    let suffix = courseid + '/' + enumL +'/submissions/grader/upload/';
    let uploadData = new FormData();
    uploadData.append('type',type)
    uploadData.append('file', file, file.name);
    uploadData.append('graderID', userid);
    return this.http.post<any>(this.apiroot + suffix, uploadData);
  }
  getSubmissions(courseid:string, enumL:number){
    let suffix = courseid + '/' + enumL +'/submissions/all/';
    return this.http.get<any>(this.apiroot + suffix, httpop);
  }
  getGradesData(courseid:string,userid:string,enumL:number=-1){
    let suffix = 'grades/' + courseid + '/' + userid;
    if(enumL==-1){
      suffix+='/all/'
    } 
    else{
      suffix+= ('/'+enumL.toString()+'/')
    }
    return this.http.get<any>(this.apiroot+suffix, httpop);
  }
  updateAssignment(data:any, courseid:string, userid:string,num:number,file:any=null){
  
    let uploadData = new FormData();
    uploadData.append('data', JSON.stringify(data))
    if(file!=null){
      uploadData.append('file', file, file.name);
    }

    // console.log(uploadData)
    // return
    return this.http.post<any>(this.apiroot + courseid +'/'+userid +'/'+num.toString()+'/update/',uploadData);
  }
}
