import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FileService } from './file.service';
import { saveAs } from 'file-saver';
import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf, NgFor],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  title = 'fileuploadanddownload-fromt';

  filenames: string[] = [];
  fileStatus = {
    status: '',
    requestType: '',
    percent: 0
  };

  constructor(private fileService: FileService) { }

  // define function to upload files
  onUploadFiles(event: Event): void {
    console.log(event);

    const files = (event.target as HTMLInputElement).files;

    if (!files) {
      console.log('No files selected');
      return;
    }

    const formData = new FormData();

    for (const file of Array.from(files)) {
      formData.append('files', file, file.name);
    }

    this.fileService.upload(formData).subscribe(
      event => {
        console.log(event);
        this.reportProgress(event);
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    );
  }

  // difine function to download files
  onDownloadFile(filename: string): void {

    this.fileService.download(filename).subscribe(
      event => {
        console.log(event);
        this.reportProgress(event);
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    );
  }

  private reportProgress(httpEvent: HttpEvent<string[] | Blob>): void {
    switch (httpEvent.type) {
      case HttpEventType.UploadProgress:
        this.updateStatus(httpEvent.loaded, httpEvent.total!, 'Uploading...');
        break;
      case HttpEventType.DownloadProgress:
        this.updateStatus(httpEvent.loaded, httpEvent.total!, 'Downloading...');
        break;
      case HttpEventType.ResponseHeader:
        console.log('Header returned', httpEvent);
        break;
      case HttpEventType.Response:
        if (httpEvent.body instanceof Array) {
          // upload logic
          for (const filename of httpEvent.body) {
            this.filenames.unshift(filename);
          }
        } else {
          // download logic
          saveAs(new File([httpEvent.body!], httpEvent.headers.get('File-Name')!,
            { type: `${httpEvent.headers.get('Content-Type')};charset=utf-8` }));

        }
        this.fileStatus.status = 'done';
        break;
      default:
        console.log(httpEvent);
        break;

    }
  }

  private updateStatus(loaded: number, total: number, requestType: string): void {
    console.log(`${requestType} ${Math.round(loaded / total * 100)}%`);

    this.fileStatus.status = 'progress';
    this.fileStatus.requestType = requestType;
    this.fileStatus.percent = Math.round(loaded / total * 100);

  }

}
