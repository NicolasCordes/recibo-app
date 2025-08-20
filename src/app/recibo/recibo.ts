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
  numeroRecibo: number = 1; // contador inicial

  constructor(private fb: FormBuilder) {
    this.reciboForm = this.fb.group({
      sede: ['', Validators.required],
      fecha: [new Date().toISOString().split('T')[0], Validators.required],
      de: ['', Validators.required],
      importe: ['', [Validators.required, Validators.min(0)]],
      por: ['', Validators.required],
      tipo: ['', Validators.required],
      observacion: ['', [Validators.maxLength(70)]], // opcional
      comentarios: ['', [Validators.maxLength(70)]] // opcional
    });
  }

  generatePDF() {
    if (this.reciboForm.invalid) return; // <--- importante, evita generar PDF con formulario inválido

    const DATA = document.getElementById('recibo-content')!;
    html2canvas(DATA, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const doc = new jsPDF('p', 'mm', 'a4');
      const imgProps = doc.getImageProperties(imgData);
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      doc.save(`recibo-${this.reciboForm.get('de')?.value}-${this.numeroRecibo}.pdf`);

      // Incrementar el número de recibo
      this.numeroRecibo++;
    });
  }
}
