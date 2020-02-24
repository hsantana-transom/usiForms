import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { switchMap } from 'rxjs/operators';
import { FormsService, ImageFile, SharepointIntegrationService } from 'shared-lib';


@Component({
  selector: 'app-main-form',
  templateUrl: './main-form.component.html',
  styleUrls: ['./main-form.component.scss']
})
export class MainFormComponent implements OnInit {
  @Input() data: any;
  fields: any = {};
  flags = {
    loadingFields: true
  };
  private isNew: boolean;
  keywords: string[] = [];
  mainForm: FormGroup;
  mainImage = null;
  readonly separatorKeysCodes: number[] = [ ENTER, COMMA ];
  bandEnlace = false;
  bandContenido = false;
  oldOrder=null;
  nItems=0;
  constructor(
    private fb: FormBuilder,
    private fs: FormsService,
    private sis: SharepointIntegrationService
  ) { }

  ngOnInit() {
    this.isNew = this.data ? false : true;

    this.setupForm();
    this.getItems();

  }
  getItems()
  {
    const data = {
      select: ['Id', 'Orden'],
      top:20
    };
    this.sis.read('Sectores', data)
    .subscribe((response: any) => {
      this.nItems=response.value.length;
    });

  }
  // Custom public methods

  addKeyword(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      this.keywords.push(value.trim());
      this.mainForm.markAsDirty();
    }

    if (input) {
      input.value = '';
    }
  }

  disableFields() {
    this.fs.disableFields(this.mainForm);
  }

  enableFields() {
    this.fs.enableFields(this.mainForm);
  }

  onFileEvent(event: ImageFile, type: string) {
    switch (type) {
      case 'main':
        this.mainImage = event;
        break;
    }
  }

  removeKeyword(keyword: any) {
    const index = this.keywords.indexOf(keyword);

    if (index >= 0) {
      this.keywords.splice(index, 1);
    }
    this.mainForm.markAsDirty();
  }

  submit() {
    const values = this.mainForm.value;

    values.keywords = this.keywords;
    values.mainImage = this.mainImage;

    const data: any = {
      __metadata: { type: 'SP.Data.SectoresListItem' },

      Imagen: this.mainImage.data,
      Orden: values.order,
      PalabrasClave:this.keywords.join(','),
      Title: values.title,
      Enlace: values.link,
      Color: values.color,
      Accion: values.action,
      TituloContenido: values.titleContent,
      Contenido: values.content,
      Forma:values.shape
    };

    if (values.id) {
      data.Id = values.id;
    }
    this.verifyOrder(values.order, values.id);
    this.nItems=this.nItems+1;
    return this.sis.getFormDigest().pipe(
      switchMap(formDigest => {
        return this.sis.save('Sectores', data, formDigest);
      })
    );
  }

  // Custom private methods

  private setupForm() {
    this.mainForm = this.fb.group({
      action: [null, Validators.required],
      color: [null, Validators.required],
      order: [null, [Validators.required, Validators.pattern(/^\d+$/)]],
      id: null,
      titleContent:null,
      content: null,
      link: null,
      title: [null, Validators.required],
      shape: [null, Validators.required],
    });

    if (!this.isNew) {
      const data = {
        select: ['Imagen', 'PalabrasClave']
      };

      this.mainForm.patchValue({
        id: this.data.id,
        order: this.data.order,
        action: this.data.action,
        title: this.data.title,
        color: this.data.color,
        titleContent: this.data.titleContent,
        content: this.data.content,
        link: this.data.link,
        shape: this.data.shape,
      });
      this.oldOrder=this.data.order;
      // Load the rest of the fields

      this.sis.read('Sectores', data, this.data.id)
        .subscribe((response: any) => {
          this.mainForm.patchValue({
          });
          if(response.PalabrasClave)
          {
            this.keywords =response.PalabrasClave.split(',')
          }

          this.mainImage = {
            data: response.Imagen,
            name: 'Image',
            type: 'image/png'
          };
        });
      this.onActionSelected(this.data.action);
    }

  }
  onActionSelected(event: String)
  {
    console.log(event);
    if(event=='Enlace')
    {
      this.bandEnlace=true;
      this.bandContenido=false
      this.mainForm.get('link').setValidators([Validators.required]);
      this.mainForm.get('link').updateValueAndValidity();

      this.mainForm.get('titleContent').clearValidators();
      this.mainForm.get('titleContent').updateValueAndValidity();
      this.mainForm.get('content').clearValidators();
      this.mainForm.get('content').updateValueAndValidity();


    }
    if(event=='Contenido')
    {
      this.bandEnlace=false;
      this.bandContenido=true;
      this.mainForm.get('titleContent').setValidators([Validators.required]);
      this.mainForm.get('titleContent').updateValueAndValidity();
      this.mainForm.get('content').setValidators([Validators.required]);
      this.mainForm.get('content').updateValueAndValidity();

      this.mainForm.get('link').clearValidators();
      this.mainForm.get('link').updateValueAndValidity();
    }
  }
  // Getters and setters

  get order() {
    return this.mainForm.get('order');
  }
  verifyOrder(ord,id)
  {
    const data = {
      select: ['Id', 'Orden'],
      filter:['Orden eq ' + ord, 'Id ne ' + id],
      top:1
    };
    this.sis.read('Sectores', data)
    .subscribe((response: any) => {
    if(response)
    {
      const data: any = {
        __metadata: { type: 'SP.Data.SectoresListItem' },
        Id: response.value[0].Id,
        Orden: this.oldOrder ? this.oldOrder : this.nItems
      };
      this.sis.getFormDigest().pipe(
        switchMap(formDigest => {
          return this.sis.save('Sectores', data, formDigest);
        })
      ).subscribe();
    }

    });
  }
  checkImage()
  {
    this.mainForm.markAsDirty();
  }
}
