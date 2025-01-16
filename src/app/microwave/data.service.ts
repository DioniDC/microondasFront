import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', // O serviço estará disponível globalmente
})
export class DataService {
  private apiUrl = 'http://localhost:5211/api/microwave';

  constructor(private http: HttpClient) { }
  
  getPresets(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/presets`);
  }

  saveCustom(button: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/custom`, button);
  }

  deleteCustom(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/custom/${id}`);
  }
}