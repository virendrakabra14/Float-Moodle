import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'downloader',
  templateUrl: './downloader.component.html',
  styleUrls: ['./downloader.component.css']
})
export class DownloaderComponent implements OnInit {
  @Input() url!:string;
  @Input() filename!:string;
  constructor(private http:HttpClient) { }

  ngOnInit(): void {
  }
  downloadFile(){
      const param = new HttpParams();
      const options = {
        params:param
      }
      return this.http.get(this.url, {...options, responseType:'blob'}).subscribe(
        data=>{
          console.log(data)
          FileSaver.saveAs(data, this.filename)
        }
      );
    }

}
