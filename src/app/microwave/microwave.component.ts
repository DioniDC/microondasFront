import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DataService } from './data.service';
import { HttpClientModule } from '@angular/common/http';
import { MicrowaveButton } from './microwave-button.interface';

@Component({
  selector: 'app-microwave',
  templateUrl: './microwave.component.html',
  styleUrls: ['./microwave.component.css'],
  standalone: true,
  imports: [CommonModule, HttpClientModule],
})
export class MicrowaveComponent implements OnInit {
  predefinedButtons: MicrowaveButton[] = [];
  customButtons: MicrowaveButton[] = [];
  time: number = 0; 
  power: number = 5; 
  running: boolean = false; 
  settingPower: boolean = false;
  intervalId: any; 
  powerOutput: string = ''; 
  selectedButton: MicrowaveButton | null = null; 
  instruction: string | null = null;
  private deleteTimer: any;
  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.loadButtons();
  }

  private loadButtons() {
    this.dataService.getPresets().subscribe({
      next: (data) => {

        this.predefinedButtons = data.presets;
        this.customButtons = data.custom;
        this.fillEmptyCustomButtons();

      },
      error: (err) => {
        console.error("Erro ao carregar os botões:", err);
      }
    });
  }
  
  toggleSetting() {
    this.settingPower = !this.settingPower;
  }

  selectPredefined(button: MicrowaveButton) {
    
    if (this.running) {
      return; 
    }

    if (button && typeof button.time === 'number' && typeof button.power === 'number') {
      this.time = button.time;
      this.power = button.power;
      this.selectedButton = button;
      this.instruction = button.instrucao;
      this.powerOutput = button.strings.repeat(button.power);
      this.stopTimer();
    } else {
      this.instruction = null;
      this.powerOutput = '';
    }
  }

  cancel() {
    this.stopTimer();
    this.time = 0;
    this.power = 5;
    this.selectedButton = null;
    this.powerOutput = '';
    this.instruction = '';
  }

  add30Seconds() {
    this.time += 30;
  }

  setTimeOrPower(number: number) {
    if (this.running) {
      return; 
    }

    if (this.settingPower) {
      this.power = Math.max(1, Math.min(number, 10));
    } else {
      const newTime = this.time * 10 + number;
      this.time = Math.min(600, newTime);
    }
  }

  startOrPause() {
    if (this.running) {
      this.stopTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    if (this.time > 0) {
      this.running = true;
      this.powerOutput = '';

      this.intervalId = setInterval(() => {
        if (this.time > 0) {
          this.time--;
          let stringToAdd = '.'; 
  
          if (this.selectedButton && this.selectedButton.strings) {
            stringToAdd = this.selectedButton.strings;
          }
          this.powerOutput += stringToAdd.repeat(this.power) + ' ';
        } else {
          this.stopTimer();
          alert('Tempo esgotado!');
        }
      }, 1000);
    }
  }
  
  stopTimer() {
    clearInterval(this.intervalId);
    this.running = false;
  }

  get minutes(): string {
    return Math.floor(this.time / 60).toString();
  }

  get seconds(): string {
    return (this.time % 60).toString().padStart(2, '0');
  }

  get powerString(): string {
    const button = this.predefinedButtons.find(button => button.time === this.time);

    if (button && button.strings) { 
      return button.strings.repeat(this.power);
    }

    return '.'.repeat(this.power);
  }

  fillEmptyCustomButtons() {
    const maxCustomButtons = 3;
    const placeholdersNeeded = maxCustomButtons - this.customButtons.length;

    for (let i = 0; i < placeholdersNeeded; i++) {
      this.customButtons.push({
        nome: "BRANCO",
        time: 0,
        power: 0,
        strings: "",
        instrucao: "",
        alimento: ""
      });
    }
  }

  handleCustomClick(button: MicrowaveButton, index: number) {
    
    if (this.running) {
      return; 
    }

    const buttonId = index + 1;
  
    if (!button.nome || button.nome === 'BRANCO') {
      
      if (this.time <= 0) {
        alert("O tempo deve ser maior que 0.");
        return;
      }
  
      if (this.power <= 0) {
        alert("A Potencia deve ser maior que 0.");
        return;
      }

      const name = prompt("Digite o nome da configuração:");
      if (!name) {
        alert("Nome não pode ser vazio.");
        return;
      }
  
      const instruction = prompt("Digite a instrução:");
      if (!instruction) {
        alert("Instrução não pode ser vazia.");
        return;
      }
  
      const string = prompt("Digite a string de potência:");
      if (!string) {
        alert("String não pode ser vazia.");
        return;
      }

      const newButton: MicrowaveButton = {
        id: buttonId,
        nome: name,
        time: this.time,
        power: this.power,
        instrucao: instruction,
        strings: string,
        alimento: ''
      };

      this.dataService.saveCustom(newButton).subscribe({
        next: () => {
          this.reloadCustomButtons();
        },
        error: (err) => {
          console.error("Erro ao salvar no backend:", err);
        }
      });
    } else {

      this.loadCustomSettings(button);
      this.selectedButton = button;
      button.id = buttonId;

    }
  }
  
  loadCustomSettings(button: MicrowaveButton) {
    this.time = button.time;
    this.power = button.power;
    this.instruction = button.instrucao;
    this.powerOutput = button.strings.repeat(this.power); 
  }
  
  reloadCustomButtons() {
    this.dataService.getPresets().subscribe({
      next: (data) => {
        this.customButtons = data.custom;
        this.fillEmptyCustomButtons();
      },
      error: (err) => {
        console.error("Erro ao recarregar os botões customizados:", err);
      }
    });
  }

  startDeleteTimer(button: MicrowaveButton, index: number) {

    if (this.running) {
      return; 
    }

    this.deleteTimer = setTimeout(() => {

      const emptyButton: MicrowaveButton = {
        id: button.id,
        nome: "BRANCO",
        time: 0,
        power: 0,
        strings: "",
        instrucao: "",
        alimento: ""
      };

      this.customButtons[index] = emptyButton;
  
      this.dataService.deleteCustom(button.id ?? 0).subscribe({
        next: () => {
          alert("Botão deletado com sucesso!");
        },
        error: (err) => {
          console.error("Erro ao deletar o botão:", err);
          alert("Erro ao deletar o botão.");
        }
      });
    }, 3000); 
  }
  
  cancelDeleteTimer() {
    if (this.deleteTimer) {
      clearTimeout(this.deleteTimer);
      this.deleteTimer = null;
    }
  }
  
}
