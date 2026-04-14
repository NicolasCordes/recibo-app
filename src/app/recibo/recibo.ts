import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-recibo',
  imports: [FormsModule, ReactiveFormsModule, CommonModule], // <- Agregamos CommonModule
  templateUrl: './recibo.html',
  styleUrls: ['./recibo.scss']
})
export class Recibo {
  reciboForm: FormGroup;

  constructor(private fb: FormBuilder) {
    // Recuperamos el último número o empezamos en 1
    const ultimoNum = Number(localStorage.getItem('ultimoRecibo')) || 1;

    this.reciboForm = this.fb.group({
      numeroRecibo: [ultimoNum, [Validators.required, Validators.min(1)]], // <--- Nuevo campo
      sede: ['', Validators.required],
      fecha: [new Date().toISOString().split('T')[0], Validators.required],
      de: ['', Validators.required],
      importe: ['', [Validators.required, Validators.min(0)]],
      por: ['', Validators.required],
      tipo: ['', Validators.required],
      observacion: ['', [Validators.maxLength(70)]],
      comentarios: ['', [Validators.maxLength(70)]]
    });
  }

  generatePDF() {
  if (this.reciboForm.invalid) return;

  const DATA = document.getElementById('recibo-content')!;
  const numActual = this.reciboForm.get('numeroRecibo')?.value;

  html2canvas(DATA, {
    scale: 1.5,              // era 3 → 60% menos de píxeles
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    imageTimeout: 0
  }).then(canvas => {
    const imgData = canvas.toDataURL('image/jpeg', 0.75); // PNG → JPEG 75%
    const doc = new jsPDF('p', 'mm', 'a4');

    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    doc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

    doc.save(`recibo-${numActual}-${this.reciboForm.get('de')?.value}.pdf`);

    const siguienteNum = numActual + 1;
    this.reciboForm.patchValue({ numeroRecibo: siguienteNum });
    localStorage.setItem('ultimoRecibo', siguienteNum.toString());
  });
}
}
