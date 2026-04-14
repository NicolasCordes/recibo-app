import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-recibo',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './recibo.html',
  styleUrls: ['./recibo.scss']
})
export class Recibo implements OnInit {
  reciboForm: FormGroup;
  logoPath: string = '';

  constructor(private fb: FormBuilder) {
    const ultimoNum = Number(localStorage.getItem('ultimoRecibo')) || 1;

    this.reciboForm = this.fb.group({
      numeroRecibo: [ultimoNum, [Validators.required, Validators.min(1)]],
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

  ngOnInit() {
    const isElectron = !!(window as any).process?.type;
    if (isElectron) {
      const path = (window as any).require('path');
      const base = (window as any).process.resourcesPath;
      this.logoPath = 'file:///' + path.join(base, 'assets', 'wings.webp').replace(/\\/g, '/');
    } else {
      this.logoPath = 'assets/wings.webp';
    }
  }

  generatePDF() {
    if (this.reciboForm.invalid) return;

    const DATA = document.getElementById('recibo-content')!;
    const numActual = this.reciboForm.get('numeroRecibo')?.value;

    html2canvas(DATA, {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 0
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/jpeg', 0.75);
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
