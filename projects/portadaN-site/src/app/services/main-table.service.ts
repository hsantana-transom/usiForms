import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { tap, map } from 'rxjs/operators';
import { SharepointIntegrationService } from 'shared-lib';
import { MainTableDataSource } from '../datasources/main-table-data-source';


@Injectable({
  providedIn: 'root'
})
export class MainTableService {
  dataSource: MainTableDataSource;

  constructor(
    private sis: SharepointIntegrationService
  ) {
    this.dataSource = new MainTableDataSource();
  }

  clearAll() {
    this.dataSource.clearAll();
  }

  loadData() {
    const data = {
      select: ['Descripcion', 'descripcionCreado', 'Fechanoticia', 'Noticia','punto1','punto2','Id', 'Title','video','url', 'Created'],
      top: 5000
    };
    const datePipe = new DatePipe('en-US');

    return this.sis.read('Noticias', data)
      .pipe(
        map((response: any) => {
          return response.value.map(r => {
            const item: any = {
              created: new Date(r.Created),
              id: r.Id,
              newsDate: new Date(r.Fechanoticia),
              summary: r.Descripcion,
              title: r.Title,
              news: r.Noticia,
              point1: r.point1,
              point2: r.point2,
              video: r.video,
              url: r.url,
              createdDescription: r.descripcionCreado
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
