import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { tap, map } from 'rxjs/operators';
import { SharepointIntegrationService } from 'shared-lib';
import { MainDatasource } from '../datasources/main-datasource';
import { ImageUploadControlComponent } from 'shared-lib/lib/components/controls/image-upload-control/image-upload-control.component';

@Injectable({
  providedIn: 'root'
})
export class MainTableService {
  dataSource: MainDatasource;

  constructor(
    private sis: SharepointIntegrationService
  ) {
    this.dataSource = new MainDatasource();
  }

  clearAll() {
    this.dataSource.clearAll();
  }

  loadData() {
    const data = {
      select: ['Principal','Id','Created','Imagen','Logo'],
      top: 5000
    };
    const datePipe = new DatePipe('en-US');
    var img= new Image();
    return this.sis.read('Encabezado', data)
      .pipe(
        map((response: any) => {
          return response.value.map(r => {
            const item: any = {
              created: new Date(r.Created),
              id: r.Id,
              main: r.Principal ?  "Habilitado" : "Deshabilitado",
              imagen: r.Imagen,
              logo: r.Logo
            };
            item.createdLabel = datePipe.transform(item.created, 'yyyy-MM-dd hh:mm a');
            return item;
          });
        }),
        tap((response: any) => {
          this.dataSource.replaceAll(response);
        })
      );
  }
}
