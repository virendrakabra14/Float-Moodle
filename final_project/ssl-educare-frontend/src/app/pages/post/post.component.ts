import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PostService } from 'src/app/services/post.service';
@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {
  data={
    number:0,
    id:0,
    title:'',
    instruction:"",
    comments:[],
    releaseDate:"",
    releaseTime:"",
    discussable:true,
    published:false,
    hasfiles:true,
    files:{
      name:'',
      url:''
    }
  }
  constructor(private route:ActivatedRoute,
    private postService:PostService) { }

  ngOnInit(): void {
    let id = localStorage.getItem('userid');
    if(id!=null){
      let courseid, num;
      courseid = JSON.parse(JSON.stringify(this.route.snapshot.paramMap.get('coursecode') || '{}'));
      num =  JSON.parse(JSON.stringify(this.route.snapshot.paramMap.get('enum') || '{}'));
      console.log(courseid)
      console.log(num)
      this.postService.getPostData(courseid, num).subscribe(data=>{
        console.log(data)
        let tempdata = data;
        tempdata.comments = data.comments
        this.data = tempdata;
      })
    }
    else{
      window.location.assign('/login')
    }
  }

}
