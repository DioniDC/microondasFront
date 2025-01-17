// microwave.component.ts

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

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.loadButtons();
  }

  /**
   * Carrega os botões pré-definidos e customizados do backend.
   */
  private loadButtons() {
    this.dataService.getPresets().subscribe({
      next: (data) => {
        console.log("Presets:", data.presets);
        console.log("Custom:", data.custom);
  
        this.predefinedButtons = data.presets;
        this.customButtons = data.custom;
  
        this.fillEmptyCustomButtons();
  
        console.log("Botões pré-definidos:", this.predefinedButtons);
        console.log("Botões customizados:", this.customButtons);
      },
      error: (err) => {
        console.error("Erro ao carregar os botões:", err);
      }
    });
  }
  
  /**
   * Alterna entre ajuste de tempo e potência.
   */
  toggleSetting() {
    this.settingPower = !this.settingPower; // Alterna entre tempo e potência
  }

  /**
   * Seleciona um botão pré-definido e aplica suas configurações.
   */
  selectPredefined(button: MicrowaveButton) {
    console.log("Selecionando botão pré-definido:", button);
    if (button && typeof button.time === 'number' && typeof button.power === 'number') {
      this.time = button.time;
      this.power = button.power;
      this.selectedButton = button;
      this.instruction = button.instrucao;
      this.powerOutput = button.strings.repeat(button.power);
      console.log("powerOutput definido para:", this.powerOutput);
      this.stopTimer();
    } else {
      console.error('Botão inválido:', button);
      this.instruction = null;
      this.powerOutput = '';
    }
  }

  /**
   * Cancela a operação atual e reseta as configurações.
   */
  cancel() {
    this.stopTimer(); // Para o temporizador
    this.time = 0; // Reseta o tempo
    this.power = 5; // Reseta a potência
    this.selectedButton = null; // Remove a associação com qualquer botão pré-definido
    this.powerOutput = ''; // Limpa a saída de potência
    this.instruction = '';
    console.log("Operação cancelada. Estado resetado.");
  }

  /**
   * Adiciona 30 segundos ao tempo atual.
   */
  add30Seconds() {
    this.time += 30;
    console.log("30 segundos adicionados. Novo tempo:", this.time);
  }

  /**
   * Define o tempo ou a potência com base no modo atual.
   * @param number Número clicado no teclado numérico.
   */
  setTimeOrPower(number: number) {
    if (this.running) {
      console.log("Ajuste bloqueado. O micro-ondas está rodando.");
      return; // Não permite ajuste enquanto o micro-ondas está rodando
    }

    if (this.settingPower) {
      // Ajustar potência
      this.power = Math.max(1, Math.min(number, 10)); // Limita a potência entre 1 e 10
      console.log("Potência ajustada para:", this.power);
    } else {
      // Ajustar tempo
      const newTime = this.time * 10 + number; // Adiciona o número ao final
      this.time = Math.min(600, newTime); // Limita o tempo a 600 segundos (10:00)
      console.log("Tempo ajustado para:", this.time);
    }
  }

  /**
   * Inicia ou pausa o temporizador.
   */
  startOrPause() {
    if (this.running) {
      this.stopTimer(); // Pausa o timer
      console.log("Temporizador pausado.");
    } else {
      this.startTimer(); // Inicia o timer
      console.log("Temporizador iniciado.");
    }
  }

  /**
   * Inicia o temporizador e atualiza o display a cada segundo.
   */
  startTimer() {
    if (this.time > 0) {
      this.running = true;
      this.powerOutput = ''; // Reseta a saída de potência ao iniciar
      console.log("Temporizador iniciado com tempo:", this.time, "segundos e potência:", this.power);

      this.intervalId = setInterval(() => {
        if (this.time > 0) {
          this.time--; // Reduz o tempo em 1 segundo

          // Usa a string do botão selecionado ou "." como padrão
          const stringToAdd = this.selectedButton && this.selectedButton.strings
            ? this.selectedButton.strings
            : '.';
          this.powerOutput += stringToAdd.repeat(this.power) + ' '; // Concatena a string da potência

          console.log(`Time remaining: ${this.time} segundos. powerOutput: ${this.powerOutput}`);
        } else {
          this.stopTimer(); // Para o temporizador quando o tempo acabar
          alert('Tempo esgotado!'); // Notificação ao final
          console.log("Tempo esgotado.");
        }
      }, 1000); // Executa a cada 1 segundo
    }
  }

  /**
   * Para o temporizador.
   */
  stopTimer() {
    clearInterval(this.intervalId); // Para o temporizador
    this.running = false;
    console.log("Temporizador parado.");
  }

  /**
   * Calcula os minutos restantes.
   */
  get minutes(): string {
    return Math.floor(this.time / 60).toString(); // Calcula os minutos
  }

  /**
   * Calcula os segundos restantes.
   */
  get seconds(): string {
    return (this.time % 60).toString().padStart(2, '0'); // Calcula os segundos com dois dígitos
  }

  /**
   * Calcula a string de potência para exibição.
   */
  get powerString(): string {
    const button = this.predefinedButtons.find(button => button.time === this.time);

    if (button && button.strings) { // Usa 'strings'
      return button.strings.repeat(this.power);
    }

    return '.'.repeat(this.power);
  }

  /**
   * Garante que sempre haja 3 botões customizados, adicionando placeholders se necessário.
   */
  fillEmptyCustomButtons() {
    const maxCustomButtons = 3;

    // Calcula quantos placeholders são necessários
    const placeholdersNeeded = maxCustomButtons - this.customButtons.length;

    for (let i = 0; i < placeholdersNeeded; i++) {
      this.customButtons.push({
        nome: "BRANCO",
        time: 0,
        power: 0,
        strings: "",
        instrucao: ""
      });
    }

    console.log("Botões customizados após preenchimento:", this.customButtons);
  }

  /**
   * Trata o clique em um botão customizado.
   * @param button O botão clicado.
   * @param index O índice do botão na lista.
   */
  handleCustomClick(button: MicrowaveButton, index: number) {
    console.log("Clique em botão customizado:", button, "Índice:", index);
    if (!button.nome || button.nome === 'BRANCO') {
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

      if (this.time <= 0) {
        alert("O tempo deve ser maior que 0.");
        return;
      }

      const newButton: MicrowaveButton = {
        nome: name,
        time: this.time,
        power: this.power,
        instrucao: instruction,
        strings: string
      };

      console.log("Enviando ao backend:", newButton);

      this.dataService.saveCustom(newButton).subscribe({
        next: () => {
          console.log("Botão salvo no backend.");
          // Recarrega os botões customizados
          this.reloadCustomButtons();
        },
        error: (err) => {
          console.error("Erro ao salvar no backend:", err);
        }
      });
    } else {
      this.loadCustomSettings(button);
    }
  }

  /**
   * Recarrega os botões customizados do backend.
   */
  reloadCustomButtons() {
    this.dataService.getPresets().subscribe({
      next: (data) => {
        console.log("Recarregando botões customizados:", data.custom);
        this.customButtons = data.custom;
        this.fillEmptyCustomButtons(); // Garante 3 botões customizados
        console.log("Botões customizados após recarga:", this.customButtons);
      },
      error: (err) => {
        console.error("Erro ao recarregar os botões customizados:", err);
      }
    });
  }

  /**
   * Carrega as configurações de um botão customizado selecionado.
   * @param button O botão selecionado.
   */
  loadCustomSettings(button: MicrowaveButton) {
    console.log("Carregando configurações customizadas:", button);
    this.time = button.time;
    this.power = button.power;
    this.instruction = button.instrucao;
    this.powerOutput = button.strings.repeat(this.power);
    console.log('Configurações carregadas:', {
      time: this.time,
      power: this.power,
      instruction: this.instruction,
      powerOutput: this.powerOutput
    });
  }
  
}
