import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { of, forkJoin, concat } from 'rxjs';
import { switchMap, map, tap, delay } from 'rxjs/operators';
import { FormsService, ImageFile, SharepointIntegrationService } from 'shared-lib';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import {UploadAdapter} from './UploadAdapter';

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
  Imagen1=null;
  Imagen2=null;
  Imagen3=null;
  Imagen4=null;
  Imagen5=null;
  Imagen6=null;
  Imagen7=null;
  Imagen8=null;
  secondaryImage = null;
  readonly separatorKeysCodes: number[] = [ ENTER, COMMA ];
  public Editor = ClassicEditor;
  checkVideo=false;
  oldOrder=null;
  nItems=0;
  Numberkeys=0;
  bandImg1=false;
  bandImg2=false;
  bandImg3=false;
  bandImg4=false;
  bandImg5=false;
  bandImg6=false;
  bandImg7=false;
  bandImg8=false;
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

  // Custom public methods
  getItems()
  {
    const data = {
      select: ['Id', 'Orden'],
      top:20
    };
    this.sis.read('Noticias', data)
    .subscribe((response: any) => {
      this.nItems=response.value.length;
    });

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
    values.Image1 = this.Imagen1 ? this.Imagen1 : null;
    values.Image2 = this.Imagen2 ? this.Imagen2 : null;
    values.Image3 = this.Imagen3 ? this.Imagen3 : null;
    values.Image4 = this.Imagen4 ? this.Imagen4 : null;
    values.Image5 = this.Imagen5 ? this.Imagen5 : null;
    values.Image6 = this.Imagen6 ? this.Imagen6 : null;
    values.Image7 = this.Imagen7 ? this.Imagen7 : null;
    values.Image8 = this.Imagen8 ? this.Imagen8 : null;

    const data: any = {
      __metadata: { type: 'SP.Data.NoticiasListItem' },
      Descripcion: values.summary,
      Fechanoticia: values.newsDate.toISOString(),
      Imagen: this.mainImage.data,
      /*Imagen1: this.Imagen1 ? this.Imagen1.data : null,
      Imagen2: this.Imagen2 ? this.Imagen2.data : null,
      Imagen3: this.Imagen3 ? this.Imagen3.data : null,
      Imagen4: this.Imagen4 ? this.Imagen4.data : null,
      Imagen5: this.Imagen5 ? this.Imagen5.data : null,
      Imagen6: this.Imagen6 ? this.Imagen6.data : null,
      Imagen7: this.Imagen7 ? this.Imagen7.data : null,
      Imagen8: this.Imagen8 ? this.Imagen8.data : null,*/
      Noticia: values.completedNews,
      PalabrasClave: this.keywords.join(','),
      Title: values.title,
      punto1: values.punto1,
      punto2: values.punto2,
      video: this.checkVideo,
      url: values.url,
      descripcionCreado: values.created,
    };

    if (values.id) {
      data.Id = values.id;
    }

    this.nItems = this.nItems + 1;
    return this.sis.getFormDigest()
      .pipe(
        map(formDigest => {
          return [
            of(formDigest),
            this.sis.save('Noticias', data, formDigest)
          ];
        }),
        switchMap(requests => forkJoin(requests)),
        map(([formDigest, response]) => {
          const requests = [];

          if (this.Imagen1) {
            const dataImagen1: any = {
              __metadata: { type: 'SP.Data.NoticiasListItem' },
              Id: response.d.Id,
              Imagen1: this.Imagen1.data
            };

            console.log(dataImagen1);

            requests.push(this.sis.save('Noticias', dataImagen1, formDigest));
          }
          if (this.Imagen2) {
            const dataImagen2: any = {
              __metadata: { type: 'SP.Data.NoticiasListItem' },
              Id: response.d.Id,
              Imagen2: this.Imagen2.data
            };

            requests.push(this.sis.save('Noticias', dataImagen2, formDigest));
          }
          if (this.Imagen3) {
            const dataImagen3: any = {
              __metadata: { type: 'SP.Data.NoticiasListItem' },
              Id: response.d.Id,
              Imagen2: this.Imagen3.data
            };

            requests.push(this.sis.save('Noticias', dataImagen3, formDigest));
          }

          if (this.Imagen4) {
            const dataImagen4: any = {
              __metadata: { type: 'SP.Data.NoticiasListItem' },
              Id: response.d.Id,
              Imagen4: this.Imagen4.data
            };
            /*this.sis.getFormDigest().pipe(
              switchMap(formDigest => {
                return this.sis.save('Noticias', dataImagen4, formDigest);
              })
            ).subscribe();*/
            requests.push(this.sis.save('Noticias', dataImagen4, formDigest));
          }
          if (this.Imagen5) {
            const dataImagen5: any = {
              __metadata: { type: 'SP.Data.NoticiasListItem' },
              Id: response.d.Id,
              Imagen5: this.Imagen5.data
            };
            /*this.sis.getFormDigest().pipe(
              switchMap(formDigest => {
                return this.sis.save('Noticias', dataImagen5, formDigest);
              })
            ).subscribe();*/
            requests.push(this.sis.save('Noticias', dataImagen5, formDigest));
          }
          if (this.Imagen6) {
            const dataImagen6: any = {
              __metadata: { type: 'SP.Data.NoticiasListItem' },
              Id: response.d.Id,
              Imagen6: this.Imagen6.data
            };
            /*this.sis.getFormDigest().pipe(
              switchMap(formDigest => {
                return this.sis.save('Noticias', dataImagen6, formDigest);
              })
            ).subscribe();*/
            requests.push(this.sis.save('Noticias', dataImagen6, formDigest));

          }
          if (this.Imagen7) {
            const dataImagen7: any = {
              __metadata: { type: 'SP.Data.NoticiasListItem' },
              Id: response.d.Id,
              Imagen7: this.Imagen7.data
            };
            /*this.sis.getFormDigest().pipe(
              switchMap(formDigest => {
                return this.sis.save('Noticias', dataImagen7, formDigest);
              })
            ).subscribe();*/
            requests.push(this.sis.save('Noticias', dataImagen7, formDigest));

          }
          if (this.Imagen8) {
            const dataImagen8: any = {
              __metadata: { type: 'SP.Data.NoticiasListItem' },
              Id: response.d.Id,
              Imagen1: this.Imagen8.data
            };
            /*this.sis.getFormDigest().pipe(
              switchMap(formDigest => {
                return this.sis.save('Noticias', dataImagen8, formDigest);
              })
            ).subscribe();*/
            requests.push(this.sis.save('Noticias', dataImagen8, formDigest));
          }

          console.log(requests);

          return requests.length > 0 ? requests : of(null);
        }),
        switchMap(requests => concat(requests))
      );
  }

  // Custom private methods

  private setupForm() {
    this.mainForm = this.fb.group({
      newsDate: [null, Validators.required],
      id: null,
      summary: [null, Validators.required],
      title: [null, Validators.required],
      point1 :null,
      point2: null,
      completedNews: [null, [Validators.required]],
      url: null,
      video: null,
      created: null
    });

    if (!this.isNew) {
      const data = {
        select: ['Imagen', 'Imagen1', 'Imagen2', 'Imagen3', 'Imagen4', 'Imagen5', 'Imagen6',
        'Imagen7', 'Imagen8', 'Noticia', 'PalabrasClave']
      };

      this.mainForm.patchValue({
        id: this.data.id,
        newsDate: this.data.newsDate,
        summary: this.data.summary,
        title: this.data.title,
        point1: this.data.point1,
        point2: this.data.point2,
        completedNews: this.data.news,
        created: this.data.createdDescription

      });
      if(this.data.video == true)
      {
        this.checkVideo = true;
        this.mainForm.patchValue({
          video: this.data.video,
          url: this.data.url
        });
      }
      // Load the rest of the fields

      this.sis.read('Noticias', data, this.data.id)
        .subscribe((response: any) => {
          this.mainForm.patchValue({
          });
          console.log(response);
          if(response.PalabrasClave)
          {
            this.keywords = response.PalabrasClave.split(',');
          }
          this.mainImage = {
            data: response.Imagen,
            name: 'Imagen',
            type: 'image/png'
          };
          if(response.Imagen1)
          {
            this.Imagen1 = {
              data: response.Imagen1,
              name: 'Image 1',
              type: 'image/png'
            };
          }
          if(response.Imagen2)
          {
            this.Imagen2 = {
              data: response.Imagen2,
              name: 'Image 2',
              type: 'image/png'
            };
          }
          if(response.Imagen3)
          {
            this.Imagen3 = {
              data: response.Imagen3,
              name: 'Image 3',
              type: 'image/png'
            };
          }
          if(response.Imagen4)
          {
            this.Imagen4 = {
              data: response.Imagen4,
              name: 'Image 4',
              type: 'image/png'
            };
          }
          if(response.Imagen5)
          {
            this.Imagen5 = {
              data: response.Imagen5,
              name: 'Image 5',
              type: 'image/png'
            };
          }
          if(response.Imagen6)
          {
            this.Imagen6 = {
              data: response.Imagen6,
              name: 'Image 6',
              type: 'image/png'
            };
          }
          if(response.Imagen7)
          {
            this.Imagen7 = {
              data: response.Imagen7,
              name: 'Image 7',
              type: 'image/png'
            };
          }
          if(response.Imagen8)
          {
            this.Imagen8 = {
              data: response.Imagen8,
              name: 'Image 8',
              type: 'image/png'
            };
          }
        });
    }
  }

  // Getters and setters


  onReady(eventData) {
    eventData.plugins.get('FileRepository').createUploadAdapter = function (loader) {
      console.log(btoa(loader.file));
      return new UploadAdapter(loader);
    };
  }
  onVideoSelected()
  {
    this.checkVideo=!this.checkVideo;
    this.mainForm.get('url').clearValidators();
    this.mainForm.get('url').updateValueAndValidity();
    if(this.checkVideo)
    {
      this.mainForm.get('url').setValidators([Validators.required]);
      this.mainForm.get('url').updateValueAndValidity();
    }
  }
  onControlChange()
  {
    if(this.mainForm.get('completedNews'))
    {
      this.mainForm.get('completedNews').clearAsyncValidators();
      this.mainForm.get('completedNews').updateValueAndValidity();
    }
    else
    {
      this.mainForm.get('completedNews').setValidators([Validators.required]);
      this.mainForm.get('completedNews').updateValueAndValidity();
    }

  }
  checkImage()
  {
    this.mainForm.markAsDirty();
  }

  onDelete(img:String) {

    if (img == 'Imagen1')
    {
      this.Imagen1 = null;
    }
    if (img == 'Imagen2')
    {
      this.Imagen2 = null;
    }
    if (img == 'Imagen3')
    {
      this.Imagen3 = null;
    }
    if (img == 'Imagen4')
    {
      this.Imagen4 = null;
    }
    if (img == 'Imagen5')
    {
      this.Imagen5 = null;
    }
    if (img == 'Imagen6')
    {
      this.Imagen6 = null;
    }
    if (img == 'Imagen7')
    {
      this.Imagen7 = null;
    }
    if (img == 'Imagen8')
    {
      this.Imagen8 = null;
    }

    this.mainForm.markAsDirty();
  }

  onFileChanged(event,img:String) {
    const file = event.target.files[0];
    const reader = new FileReader();
    if(file.size > 1048576 )
    {
      if (img == 'Imagen1')
      {
        this.bandImg1 = true;

      }
      if (img == 'Imagen2')
      {
        this.bandImg2 = true;

      }
      if (img == 'Imagen3')
      {
        this.bandImg3 = true;
      }
      if (img == 'Imagen4')
      {
        this.bandImg4 = true;
      }
      if (img == 'Imagen5')
      {
        this.bandImg5 = true;
      }
      if (img == 'Imagen6')
      {
        this.bandImg6 = true;
      }
      if (img == 'Imagen7')
      {
        this.bandImg7 = true;
      }
      if (img == 'Imagen8')
      {
        this.bandImg8 = true;
      }
    }
    else
    {
      if (img == 'Imagen1')
      {
        this.bandImg1 = false;
        reader.readAsDataURL(file);
        reader.onload = () => {
          this.Imagen1 = {
            data: reader.result,
            name: file.name,
            type: file.type,
          };
        };
      }
      if (img == 'Imagen2')
      {
        this.bandImg2 = false;
        reader.readAsDataURL(file);
        reader.onload = () => {
          this.Imagen2 = {
            data: reader.result,
            name: file.name,
            type: file.type,
          };
        };
      }
      if(img == 'Imagen3')
      {
        this.bandImg3 = false;
        reader.readAsDataURL(file);
        reader.onload = () => {
          this.Imagen3 = {
            data: reader.result,
            name: file.name,
            type: file.type,
          };
        };
      }
      if (img == 'Imagen4')
      {
        this.bandImg4 = false;
        reader.readAsDataURL(file);
        reader.onload = () => {
          this.Imagen4 = {
            data: reader.result,
            name: file.name,
            type: file.type,
          };
        };
      }
      if(img == 'Imagen5')
      {
        this.bandImg5 = false;
        reader.readAsDataURL(file);
        reader.onload = () => {
          this.Imagen5 = {
            data: reader.result,
            name: file.name,
            type: file.type,
          };
        };
      }
      if (img == 'Imagen6')
      {
        this.bandImg6 = false;
        reader.readAsDataURL(file);
        reader.onload = () => {
          this.Imagen6 = {
            data: reader.result,
            name: file.name,
            type: file.type,
          };
        };
      }
      if(img == 'Imagen7')
      {
        this.bandImg7=false;
        reader.readAsDataURL(file);
        reader.onload = () => {
          this.Imagen7 = {
            data: reader.result,
            name: file.name,
            type: file.type,
          };
        };
      }
      if(img == 'Imagen8')
      {
        this.bandImg8=false;
        reader.readAsDataURL(file);
        reader.onload = () => {
          this.Imagen8 = {
            data: reader.result,
            name: file.name,
            type: file.type,
          };
        };
      }
      this.mainForm.markAsDirty();
    }
  }

}
