import { Component, ElementRef, Input, OnInit, ViewChild,EventEmitter,Output, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommentService } from 'src/app/services/comment.service';
import {PostService} from '../../services/post.service';
@Component({
  selector: 'app-commentstack',
  templateUrl: './commentstack.component.html',
  styleUrls: ['./commentstack.component.css']
})
export class CommentstackComponent implements OnInit {
  maxIndentableDepth = 3;
  @Input('level') level:number = 0;
  @Input('disabled') disabled:boolean = false;
  @ViewChild('holder') holderdiv!:ElementRef;
  commenting = false;
  @Input('comments') comments:any[]=[];
  postNum:number = 0;
  @Input('parentID') parentID:number = -1;
  @Input('parent') parent:string = "Post";//could be Submission or Comment
  courseid:string = ""
  authorid:string = "Anonymouse"
  replyable:boolean = false;
  @ViewChildren('replybox') replybox!:ElementRef[];
  @ViewChild('postreplybox') postreplybox!:ElementRef;
  @ViewChildren('stacks') stacks!:CommentstackComponent[];
  getClassName(level:number){
    if(level<this.maxIndentableDepth){
      return "container"
    }
    else{
      return "notcontainer"
    }
  }
  ngAfterViewInit(){
    // console.log(this.comments)
    // this.comments.sort(function(a,b){
    //   return b.id-a.id
    // })
    // console.log(this.comments)
  }
  toggleReplyButton(commentid:number,showbutton:boolean=true){
    console.log(commentid)
    let comment = this.comments.find(function(v){
      console.log(v)
      return v.id==commentid
    })
    if(showbutton){
      this.replyable=true;
      comment.replyable = true;
  }
  else{
    comment.replyable = false;
  }



  }

  constructor(private postService:PostService, private commentService:CommentService,private route:ActivatedRoute) { }
  
  ngOnInit(): void {
    // console.log(this.comments);
    let courseid = JSON.parse(JSON.stringify(this.route.snapshot.paramMap.get('coursecode') || '{}'));
    let postnum = JSON.parse(JSON.stringify(this.route.snapshot.paramMap.get('enum') || '{}'));
    let id = localStorage.getItem('userid')
    if(id==null){
      window.location.assign('/dashboard')
    }
    this.authorid = id!
    this.courseid = courseid;
    this.postNum = postnum;
    // console.log(this.comments);
  }

  addReply(commentid:number){
    let id = localStorage.getItem('userid')
    let rightbox;
    let parentOfNewComment = "Comment";
    if(commentid!=-1){
      for(let box of this.replybox){
        if(box.nativeElement.id==commentid.toString()){
          rightbox = box;
        }
      }  
    }
    else{
      rightbox = this.postreplybox;
      commentid = this.parentID;//which is post id in top most case.
      parentOfNewComment = this.parent
    }
    let data:any = {
      courseid:this.courseid,
      parentid:commentid,
      text:rightbox?.nativeElement.value,
      authorid:id,
      parent:parentOfNewComment//"Post" by default. can be "Submission." But irrelevant if this.commentId!=-1
    }
    this.commentService.addComment(data,this.courseid,this.postNum).subscribe(data=>{
      let comment;
      if(parentOfNewComment!='Comment'){
        this.comments = data;
        console.log("commented on post")
        this.commenting = false;        
      }
      else{
        console.log("Commented on a comment")
        for(let comm of this.comments){
          if(comm.id==commentid){
            comment = comm;
          }
        }
        comment.replies = data
        comment.commenting = false;
      }

    })

    // console.log(text)
  }
  deleteComment(id:number){
    this.commentService.deleteComment(id, this.courseid, this.postNum).subscribe(data=>{
      window.location.reload()
    })
  }

}
