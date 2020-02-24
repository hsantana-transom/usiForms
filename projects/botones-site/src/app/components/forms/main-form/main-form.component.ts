import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { switchMap } from 'rxjs/operators';
import { FormsService, ImageFile, SharepointIntegrationService } from 'shared-lib';
import {MainTableService} from '../../../services/main-table.service';
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
  secondaryImage = null;
  readonly separatorKeysCodes: number[] = [ ENTER, COMMA ];
  colors=['#fff','#009a3e','#D20826','#333333','#666666','#f5f5f5','#C02E51','#E64A34','#12953F','#33718F','#C79E46'];
  nItems=0;
  oldOrder=null;
  constructor(
    private fb: FormBuilder,
    private fs: FormsService,
    private sis: SharepointIntegrationService,
    private mts: MainTableService
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
    this.sis.read('Botones', data)
    .subscribe((response: any) => {
      this.nItems=response.value.length;
    });

  }
  // Custom public methods

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
    values.mainImage = this.mainImage ? this.mainImage : null;


    const data: any = {
      __metadata: { type: 'SP.Data.BotonesListItem' },

      Imagen: this.mainImage ? this.mainImage.data : null,
      Orden: values.order,
      Title: values.title,
      Enlace: values.link,
      Color: values.color,
      PalabrasClave: this.keywords.join(','),
    };

    if (values.id) {
      data.Id = values.id;
    }
    this.verifyOrder(values.order,values.id);
    this.nItems=this.nItems+1;
    return this.sis.getFormDigest().pipe(
      switchMap(formDigest => {
        return this.sis.save('Botones', data, formDigest);
      })
    );
  }

  // Custom private methods

  private setupForm() {
    this.mainForm = this.fb.group({
      id: null,
      order: [null, [Validators.required, Validators.pattern(/^\d+$/)]],
      title: [null, Validators.required],
      link:[null,Validators.required],
      color:["#fff",Validators.required],

    });

    if (!this.isNew) {
      const data = {
        select: ['Imagen','PalabrasClave']
      };

      this.mainForm.patchValue({
        id: this.data.id,
        order: this.data.order,
        title: this.data.title,
        color: this.data.color,
        link: this.data.link,
      });
      this.oldOrder=this.data.order;
      console.log(this.oldOrder);
      // Load the rest of the fields

      this.sis.read('Botones', data, this.data.id)
        .subscribe((response: any) => {
          this.mainForm.patchValue({
          });
          if(response.PalabrasClave)
          {
            this.keywords = response.PalabrasClave.split(',');
          }
          if(this.mainImage)
          {
            this.mainImage = {
              data: response.Imagen,
              name: 'Image',
              type: 'image/png'
            };
          }
        });
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
      filter:['Orden eq ' + ord, 'Id ne ' + id ],
      top:1
    };
    this.sis.read('Botones', data)
    .subscribe((response: any) => {
    if(response)
    {
      const data: any = {
        __metadata: { type: 'SP.Data.BotonesListItem' },
        Id: response.value[0].Id,
        Orden: this.oldOrder ? this.oldOrder : this.nItems
      };
      this.sis.getFormDigest().pipe(
        switchMap(formDigest => {
          return this.sis.save('Botones', data, formDigest);
        })
      ).subscribe();
      this.mts.loadData().subscribe();
    }

    });
  }
  checkImage()
  {
    this.mainForm.markAsDirty();
  }

}
