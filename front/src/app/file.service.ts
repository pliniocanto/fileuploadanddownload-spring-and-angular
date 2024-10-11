import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private server = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  // define function to uploadfile
  upload(fromData: FormData): Observable<HttpEvent<string[]>> {

    return this.http.post<string[]>(`${this.server}/file/upload`, fromData, {
      reportProgress: true,
      observe: 'events'
    });

  }

  // define function to downloadfile
  download(filename: string): Observable<HttpEvent<Blob>> {

    return this.http.get(`${this.server}/file/download/${filename}`, {
      reportProgress: true,
      observe: 'events',
      responseType: 'blob'
    });

  }

}
