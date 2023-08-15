import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { TagModel } from 'ngx-chips/core/accessor';
import {MatChipInputEvent} from '@angular/material/chips';
@Component({
  selector: 'uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.css']
})
export class UploaderComponent implements OnInit {
  @Output() sendfiles:EventEmitter<any> = new EventEmitter()
  @ViewChild('dboxer') dboxer!:ElementRef;
  files:any[] = []
  placeholder:string = "";
  secondplaceholder:string="Add files!"
  names:string[] = ['a','b']
  many:boolean = false;
  constructor() { }

  ngOnInit(): void {
  }
  remFocus(ev:any){
  }
  removeFile(fname:string){
    for(let file of this.files){
      if(file.name==fname){
        this.files.splice(this.files.indexOf(file), 1);
      }
    }
  }
  updateFiles(ev:any){
    for(let file of ev.target.files){
      if(!(this.files.includes(file))){
        this.files.push(file)
      }
    }
    if(this.files.length>0){
      if(!this.many){
        this.sendfiles.emit([this.files[0]]);
      }
      else{
        let list = []
        for(let i=0;i<this.files.length;i++){
          list.push(this.files[i]);
        }
        this.sendfiles.emit(list);
      }
    }
  }
  dialogueBox(){
    this.dboxer.nativeElement.click()
  }
}
