import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DataService } from './data.service';

@Component({
  selector: 'app-microwave',
  templateUrl: './microwave.component.html',
  styleUrls: ['./microwave.component.css'],
  standalone: true,
  imports: [CommonModule], // Adicione HttpClientModule aqui
})
export class MicrowaveComponent implements OnInit {
  predefinedButtons: any[] = [];
  customButtons: any[] = [];
  time: number = 0; 
  power: number = 5; 
  running: boolean = false; 
  settingPower: boolean = false;
  intervalId: any; 
  powerOutput: string = ''; 
  selectedButton: any = null; 

  constructor(private dataService: DataService) {
  }

  ngOnInit() {
    this.dataService.getPresets().subscribe({
      next: (data) => {
        console.log('Dados carregados com sucesso:', data); // Adicione um log para depuração.
        this.predefinedButtons = data.presets;
        this.customButtons = data.custom;
      },
      error: (err) => {
        console.error('Erro ao carregar os botões:', err);
      },
    });
}
  
  selectPredefined(button: any) {
    this.time = button.time;
    this.power = button.power;
    this.selectedButton = button; // Armazena o botão selecionado
    this.stopTimer(); // Reseta qualquer temporizador anterior
  }

  handleCustomClick(button: any) {
    if (button.time && button.power) {
      this.time = button.time;
      this.power = button.power;
      this.selectedButton = button; // Associa o botão customizado ao temporizador
    } else {
      button.time = this.time;
      button.power = this.power;
      button.string = '.'; // Define a string padrão para customizados, se não existir
    }
  }
  cancel() {
    this.stopTimer(); // Para o temporizador
    this.time = 0; // Reseta o tempo
    this.power = 5; // Reseta a potência
    this.selectedButton = null; // Remove a associação com qualquer botão pré-definido
    this.powerOutput = ''; // Limpa a saída de potência
  }
  add30Seconds() {
    this.time += 30;
  }

  setTimeOrPower(number: number) {
    if (this.running) return; // Não permite ajuste enquanto o micro-ondas está rodando
  
    if (this.settingPower) {
      // Ajustar potência
      this.power = number; // Define a potência diretamente com o número clicado
      if (this.power > 10) this.power = 10; // Limita a potência a no máximo 10
      if (this.power < 1) this.power = 1; // Limita a potência a no mínimo 1
    } else {
      // Ajustar tempo
      const newTime = this.time * 10 + number; // Adiciona o número ao final
      this.time = Math.min(600, newTime); // Limita o tempo a 600 segundos (10:00)
    }
  }
  
  

  startOrPause() {
    if (this.running) {
      this.stopTimer(); // Pausa o timer
    } else {
      this.startTimer(); // Inicia o timer
    }
  }
  
  startTimer() {
    if (this.time > 0) {
      this.running = true;
      this.powerOutput = ''; // Reseta a saída de potência ao iniciar
  
      this.intervalId = setInterval(() => {
        if (this.time > 0) {
          this.time--; // Reduz o tempo em 1 segundo
  
          // Usa a string do botão selecionado ou "." como padrão
          const stringToAdd = this.selectedButton && this.selectedButton.string
            ? this.selectedButton.string
            : '.';
          this.powerOutput += stringToAdd.repeat(this.power) + ' '; // Concatena a string da potência
        } else {
          this.stopTimer(); // Para o temporizador quando o tempo acabar
          alert('Tempo esgotado!'); // Notificação ao final
        }
      }, 1000); // Executa a cada 1 segundo
    }
  }
  

  stopTimer() {
    clearInterval(this.intervalId); // Para o temporizador
    this.running = false;
  }

  get minutes(): string {
    return Math.floor(this.time / 60).toString(); // Calcula os minutos
  }
  
  get seconds(): string {
    return (this.time % 60).toString().padStart(2, '0'); // Calcula os segundos com dois dígitos
  }

  get powerString(): string {
    const button = this.predefinedButtons.find(button => button.time === this.time);
  
    if (button && button.string) {
      return button.string.repeat(this.power);
    }
  
    return '.'.repeat(this.power);
  }

}
