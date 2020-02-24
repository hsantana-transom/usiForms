import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { switchMap } from 'rxjs/operators';
import { FormsService, ImageFile, SharepointIntegrationService } from 'shared-lib';
import { throwMatDialogContentAlreadyAttachedError } from '@angular/material';

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
  maincheck=false;

  readonly separatorKeysCodes: number[] = [ ENTER, COMMA ];

  constructor(  private fb: FormBuilder,
    private fs: FormsService,
    private sis: SharepointIntegrationService) { }

  ngOnInit() {
    this.isNew = this.data ? false : true;
    this.setupForm();
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
      case 'secondary':
        this.secondaryImage = event;
        break;
    }
  }



  submit() {
    const values = this.mainForm.value;
    values.id= this.mainForm.value.id;
    values.main = this.mainForm.value.main;

    const data: any = {
      __metadata: { type: 'SP.Data.EncabezadoListItem' },
      Principal: values.main,
      Imagen: this.mainImage.data,
      Logo: this.secondaryImage ? this.secondaryImage.data : null,
    };

    if (values.id) {
      data.Id = values.id;
    }
    return this.sis.getFormDigest().pipe(
      switchMap(formDigest => {
        return this.sis.save('Encabezado', data, formDigest);
      })
    );
  }

  // Custom private methods

  private setupForm() {
    this.mainForm = this.fb.group({
      main: false,
      id: null,
    });
    if (!this.isNew) {
      const data = {
        select: ['Imagen', 'Logo']
      };

      this.mainForm.patchValue({
        id: this.data.id,
        main: this.data.main,
      });
      if(this.data.main=="Deshabilitado")
      {
        this.mainForm.patchValue({main:false});
      }
      // Load the rest of the fields

      this.sis.read('Encabezado', data, this.data.id)
        .subscribe((response: any) => {
          this.mainImage = {
            data: response.Imagen,
            name: 'Image',
            type: 'image/png'
          };
          if(response.Logo)
          {
            this.secondaryImage = {
              data: response.Logo,
              name: 'Logo',
              type: 'image/png'
            };
          }
        });
    }
  }
  checkImage()
  {
    this.mainForm.markAsDirty();
  }
  updateMainController()
  {
    if(this.mainForm.value.main)
    {
      const data = {
        select: ['Id', 'Principal'],
        top: 5000
      };
      this.sis.read('Encabezado', data)
      .subscribe((response: any) => {
        for(var i=0; i<response.value.length;i++)
        {
          if(response.value[i].Principal==true)
          {

            this.mainForm.get('main').setValue(false);

            this.maincheck=true;

          }

        }
      });
    }
  }
}
