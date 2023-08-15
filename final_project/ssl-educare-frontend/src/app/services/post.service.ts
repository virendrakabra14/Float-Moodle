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
export class PostService {
  // apiroot = "https://educare-django.herokuapp.com/posts/"
  apiroot:string = environment.server_url + '/posts/'
  constructor(private http:HttpClient) { }
  getPostData(courseid:string, enumL=-1,role='student'){
    let enumstr = '/'+enumL.toString() + '/';
    if(enumL==-1){
      enumstr = '/all/'
    }
    return this.http.get<any>(this.apiroot+courseid +enumstr+role+'/',httpop)
  }
  createPost(data:any, courseid:string,userid:string,file:any){
    // let enumstr = '/'+enumL.toString()+'/'
    let uploadData = new FormData();
    uploadData.append('data', JSON.stringify(data))
    if(file!=null){
      uploadData.append('file', file, file.name);
    }
    return this.http.post<any>(this.apiroot + courseid +'/'+userid +'/create/', uploadData);
  }
  updatePost(data:any, courseid:string,userid:string,num:number,file:any){
    // let enumstr = '/'+enumL.toString()+'/'
    let uploadData = new FormData();
    uploadData.append('data', JSON.stringify(data))
    if(file!=null){
      uploadData.append('file', file, file.name);
    }
    return this.http.post<any>(this.apiroot + courseid+'/'+userid +'/'+num.toString()+'/update/', uploadData);
  }
}
