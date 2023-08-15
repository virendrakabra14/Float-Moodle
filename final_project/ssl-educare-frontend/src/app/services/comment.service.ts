import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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
export class CommentService {
  // apiroot = "https://educare-django.herokuapp.com/posts/"
  apiroot:string = environment.server_url + '/comments/'
  
  constructor(private http:HttpClient) { }
  addComment(comment:any, courseid:string,enumL:number){
    const httpCommentOp = {
      params:new HttpParams().append('comment',comment)
    }
    return this.http.post<any>(this.apiroot + courseid+'/'+enumL.toString() +'/', httpCommentOp);
  }
  deleteComment(commentid:number, courseid:string,enumL:number){
    return this.http.get<any>(this.apiroot+ courseid+'/'+enumL.toString()+'/'+commentid.toString()+'/delete/',httpop)
  }
}
