import { Component, OnInit } from '@angular/core';
import { SharepointIntegrationService } from 'shared-lib';
import { forkJoin } from 'rxjs';
import { map, first } from 'rxjs/operators';

@Component({
  selector: 'dc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  news: any;
  slideConfig = { autoplay: true, slidesToShow: 2, slidesToScroll: 1, variableWidth: true };

  constructor(
    private sis: SharepointIntegrationService
  ) { }

  ngOnInit() {
    this.loadNews();
  }

  // Custom private methods

  private loadNews() {
    const data = {
      select: ['Id', 'Title', 'Created'],
      top: 5000
    };

    this.sis.read('Noticias', data)
      .pipe(
        map((response: any) =>
          response.value.map(r => {
            return {
              created: new Date(r.Created),
              id: r.Id,
              image: null,
              title: r.Title
            };
          })
        )
      )
      .subscribe(response => {
        this.news = response;

        this.loadImages();
      });
  }

  private loadImages() {
    const data = {
      select: ['Imagen']
    };
    const requests = [];

    this.news.forEach(n => {
      requests.push(
        this.sis.read('Noticias', data, n.id)
      );
    });

    forkJoin(requests)
      .pipe(
        first()
      )
      .subscribe((response: any) => {
        response.forEach((r, index) => {
          this.news[index].image = r.Imagen;
        });
      });
  }
}
