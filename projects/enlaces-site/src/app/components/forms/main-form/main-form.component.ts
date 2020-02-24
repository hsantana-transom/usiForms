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
  secondaryImage = null;
  readonly separatorKeysCodes: number[] = [ ENTER, COMMA ];

  constructor(
    private fb: FormBuilder,
    private fs: FormsService,
    private sis: SharepointIntegrationService
  ) { }

  ngOnInit() {
    this.isNew = this.data ? false : true;

    this.setupForm();
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
      __metadata: { type: 'SP.Data.EnlacesListItem' },
      Descripcion: values.summary,
      Imagen: this.mainImage.data,
      PalabrasClave: this.keywords.join(','),
      Title: values.title,
      Enlace: values.link
    };

    if (values.id) {
      data.Id = values.id;
    }

    return this.sis.getFormDigest().pipe(
      switchMap(formDigest => {
        return this.sis.save('Enlaces', data, formDigest);
      })
    );
  }

  // Custom private methods

  private setupForm() {
    this.mainForm = this.fb.group({
      id: null,
      summary:null,
      title: [null, Validators.required],
      link:[null, Validators.required],
    });

    if (!this.isNew) {
      const data = {
        select: ['Imagen', 'PalabrasClave']
      };

      this.mainForm.patchValue({
        id: this.data.id,
        summary: this.data.summary,
        title: this.data.title,
        link: this.data.link
      });

      // Load the rest of the fields

      this.sis.read('Enlaces', data, this.data.id)
        .subscribe((response: any) => {
          this.mainForm.patchValue({
          });
          if(response.PalabrasClave)
          {
            this.keywords = response.PalabrasClave.split(',');
          }
          this.mainImage = {
            data: response.Imagen,
            name: 'Image',
            type: 'image/png'
          };
        });
    }
  }

  // Getters and setters

  get order() {
    return this.mainForm.get('order');
  }
  checkImage()
  {
    this.mainForm.markAsDirty();
  }
}
