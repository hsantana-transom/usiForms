import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
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
  months:String[]=['Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  years:String[]= ['2015','2016','2017','2018','2019','2020','2021'];
  imageUp=false;
  fileImage: ImageFile;
  bandImg=false;
  bandImageUp=false;
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


  submit() {
    const values = this.mainForm.value;
    values.mainImage = this.mainImage;


    const data: any = {
      __metadata: { type: 'SP.Data.IndiceNoticiasListItem' },
      fechaActualizacion: values.newsDate.toISOString(),
      Imagen: this.mainImage.data,
      Title: values.title,
      mes: values.month,
      anio: values.year
    };

    if (values.id) {
      data.Id = values.id;
    }
    console.log(data);
    return this.sis.getFormDigest().pipe(
      switchMap(formDigest => {
        return this.sis.save('indiceNoticias', data, formDigest);
      })
    );
  }

  // Custom private methods

  private setupForm() {
    this.mainForm = this.fb.group({
      newsDate: [null, Validators.required],
      id: null,
      title: [null, Validators.required],
      month: [null,Validators.required],
      year:[null,Validators.required],

    });

    if (!this.isNew) {
      const data = {
        select: ['Imagen']
      };

      this.mainForm.patchValue({
        id: this.data.id,
        newsDate: this.data.newsDate,
        title: this.data.title,
        month: this.data.month,
        year: this.data.year
      });

      // Load the rest of the fields

      this.sis.read('indiceNoticias', data, this.data.id)
        .subscribe((response: any) => {
          this.mainForm.patchValue({
          });

          this.fileImage = {
            data: response.Imagen,
            name: 'Image',
            type: 'image/png'
          };
          this.bandImageUp=true
        });
    }
  }

  // Getters and setters

  get order() {
    return this.mainForm.get('order');
  }
  onFileChanged(event)
  {
    const file = event.target.files[0];
    const reader = new FileReader();
    var fileName = file.name;
    var idxDot = fileName.lastIndexOf(".") + 1;
    var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
    if (extFile=="jpg" || extFile=="jpeg" || extFile=="png")
    {
      if(file.size>1048576 )
      {
        this.bandImg=true;
        this.bandImageUp=false;
      }
      else
      {
        this.bandImg=false;
        reader.readAsDataURL(file);
        console.log(reader);
        reader.onload = () => {
          this.mainImage = {
            data: reader.result,
            name: file.name,
            type: file.type,
          };

        }
        this.bandImageUp=true;
        this.mainForm.markAsDirty();
      }
    }
    else
    {
      alert("Solo son permitidos los archivos con extensión jpg/jpeg y png!");
    }
  }
  onDelete()
  {
    this.fileImage = null
    console.log(this.fileImage);
    this.bandImageUp=false;
  }

}
