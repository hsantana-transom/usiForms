import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { tap, map } from 'rxjs/operators';
import { SharepointIntegrationService } from 'shared-lib';
import { MainTableDatasourse } from '../datasources/main-table-datasourse';

@Injectable({
  providedIn: 'root'
})
export class MainTableService {
  dataSource: MainTableDatasourse;

  constructor(
    private sis: SharepointIntegrationService
  ) {
    this.dataSource = new MainTableDatasourse();
  }

  clearAll() {
    this.dataSource.clearAll();
  }

  loadData() {
    const data = {
      select: ['Title', 'fechaActualizacion', 'Id', 'mes','anio', 'Created'],
      top: 5000
    };
    const datePipe = new DatePipe('en-US');

    return this.sis.read('indiceNoticias', data)
      .pipe(
        map((response: any) => {
          return response.value.map(r => {
            const item: any = {
              created: new Date(r.Created),
              id: r.Id,
              month: r.mes,
              newsDate: new Date(r.fechaActualizacion),
              year: r.anio,
              title: r.Title
            };

            item.createdLabel = datePipe.transform(item.created, 'yyyy-MM-dd hh:mm a');
            item.newsDateLabel = datePipe.transform(item.newsDate, 'yyyy-MM-dd');

            return item;
          });
        }),
        tap((response: any) => {
          this.dataSource.replaceAll(response);
        })
      );
  }
}
