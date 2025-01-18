import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MicrowaveButton } from './microwave-button.interface';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private apiUrl = 'http://localhost:5211/api/microwave';

  constructor(private http: HttpClient) { }

  getPresets(): Observable<{ presets: MicrowaveButton[]; custom: MicrowaveButton[] }> {
    return this.http.get<any>(`${this.apiUrl}/presets`).pipe(
      map(data => ({
        presets: data.presets.map((button: any) => ({
          id: button.id || button.Id,
          nome: button.nome || button.Nome,
          time: button.tempo || button.Tempo,
          power: button.potencia || button.Potencia,
          strings: button.strings || button.Strings,
          instrucao: button.instrucao || button.Instrucao
        })),
        custom: data.custom.map((button: any) => ({
          id: button.id || button.Id,
          nome: button.nome || button.Nome || "BRANCO",
          time: button.tempo || button.Tempo,
          power: button.potencia || button.Potencia,
          strings: button.strings || button.Strings,
          instrucao: button.instrucao || button.Instrucao
        }))
      }))
    );
  }

  saveCustom(button: MicrowaveButton): Observable<any> {
    // TIVE QUE MAPEAR PQ NO FRONT FIZ COMO TIME E POWER :'(
    const buttonToSend = {
      id: button.id,
      nome: button.nome,
      tempo: button.time,
      potencia: button.power,
      instrucao: button.instrucao,
      strings: button.strings,
      alimento: button.alimento
    };
  
    return this.http.post<any>(`${this.apiUrl}/custom`, buttonToSend);
  }

  deleteCustom(id: number | undefined): Observable<void> {
    if (id === undefined) {
      throw new Error('ID não pode ser undefined.');
    }
    return this.http.delete<void>(`${this.apiUrl}/custom/${id}`);
  }

  checkStringAvailability(string: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-string/${string}`);
  }
  
}
