import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
const httpop = {
  headers: new HttpHeaders({
    'Content-Type':'application/json',
  })
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  // apiroot = 'https://educare-django.herokuapp.com/courses/'
  apiroot = environment.server_url + /courses/;
  constructor(private http:HttpClient) { }
  getCoursesByStudent(userid:string){
    return this.http.get<any>(this.apiroot+'byuser/student/' + userid +'/', httpop)
  }
  getCoursesByInstructor(userid:string){
    return this.http.get<any>(this.apiroot+'byuser/instructor/' + userid +'/', httpop)
  }
  getCoursesByWizard(userid:string){
    return this.http.get<any>(this.apiroot+'byuser/wizard/' + userid +'/', httpop)
  }
  getCourseData(courseid:string){
    return this.http.get<any>(this.apiroot+courseid+'/', httpop)
  }
  getMemberData(courseid:string, role:string='members'){
    return this.http.get<any>(this.apiroot + courseid+'/'+role+'/', httpop);
  }
  getToDo(userid:string,role:string='student'){
    return this.http.get<any>(this.apiroot + 'byuser/'+role+'/'+userid+'/todo/', httpop);
  }
  sendMemberData(courseid:string, role:string, list:any){
    const memberHttpOp = {
      params: new HttpParams().append('list', list)
    }
    return this.http.post<any>(this.apiroot + courseid+'/'+role+'/', memberHttpOp);
  }
  createCourse(data:any,userid:string){
    const createHttpOp = {
      params:new HttpParams().append('data', data)
    }
    return this.http.post<any>(this.apiroot + 'create/'+userid+'/', createHttpOp);
  }

}
