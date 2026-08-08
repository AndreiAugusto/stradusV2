import { Component, ElementRef, Input, ViewChild, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface OpcaoSelectBusca {
  id: number;
  label: string;
}

const MAX_RESULTADOS = 50;

@Component({
  selector: 'app-select-busca',
  imports: [CommonModule],
  templateUrl: './select-busca.html',
  styleUrl: './select-busca.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectBusca),
      multi: true,
    },
  ],
})
export class SelectBusca implements ControlValueAccessor {
  @Input() opcoes: OpcaoSelectBusca[] = [];
  @Input() placeholder = 'Selecione...';

  @ViewChild('input') inputRef?: ElementRef<HTMLInputElement>;

  termoBusca = '';
  aberto = false;
  disabled = false;
  posicao = { top: 0, left: 0, width: 0 };

  private valorId: number | null = null;

  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  get opcoesFiltradas(): OpcaoSelectBusca[] {
    const termo = this.normalizar(this.termoBusca.trim());
    const filtradas = termo
      ? this.opcoes.filter((o) => this.normalizar(o.label).includes(termo))
      : this.opcoes;
    return filtradas.slice(0, MAX_RESULTADOS);
  }

  get totalFiltradas(): number {
    const termo = this.normalizar(this.termoBusca.trim());
    return termo ? this.opcoes.filter((o) => this.normalizar(o.label).includes(termo)).length : this.opcoes.length;
  }

  private normalizar(texto: string): string {
    return texto.normalize('NFD').replace(/[\u0300-\u036F]/g, '').toLowerCase();
  }

  writeValue(id: number | null): void {
    this.valorId = id;
    this.atualizarTermoDoValor();
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private atualizarTermoDoValor() {
    const opcao = this.opcoes.find((o) => o.id === this.valorId);
    this.termoBusca = opcao?.label ?? '';
  }

  onFocus(event: FocusEvent) {
    this.aberto = true;
    this.atualizarPosicao();
    (event.target as HTMLInputElement).select();
  }

  /**
   * Posição calculada em `position: fixed` (relativa à viewport, não ao pai) — o
   * dropdown fica dentro de modais com `overflow-y: auto`, então `position: absolute`
   * ficaria cortado nas bordas do modal em vez de flutuar por cima do conteúdo.
   */
  private atualizarPosicao() {
    const rect = this.inputRef?.nativeElement.getBoundingClientRect();
    if (!rect) return;
    this.posicao = { top: rect.bottom + 4, left: rect.left, width: rect.width };
  }

  onInput(valor: string) {
    this.termoBusca = valor;
    this.aberto = true;
  }

  onBlur() {
    this.aberto = false;
    this.onTouched();
    // Se o texto digitado não corresponde a uma opção de fato selecionada
    // (usuário digitou e saiu sem clicar em nada), volta a mostrar o valor real.
    this.atualizarTermoDoValor();
  }

  selecionar(opcao: OpcaoSelectBusca) {
    this.valorId = opcao.id;
    this.termoBusca = opcao.label;
    this.aberto = false;
    this.onChange(this.valorId);
    this.onTouched();
  }

  limpar() {
    this.valorId = null;
    this.termoBusca = '';
    this.aberto = false;
    this.onChange(null);
    this.onTouched();
    this.inputRef?.nativeElement.focus();
  }
}
