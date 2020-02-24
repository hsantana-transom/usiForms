import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FormsService, ImageFile, SharepointIntegrationService } from 'shared-lib';
import {MainService} from './services/main.service';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
 data=[];
 cards=[];
 aux=[];
 Pages=0;
 itemsperPage=8;
 bandBack=true;
 bandFwd=false;
 actualPage=1;
  constructor(
    private sis: SharepointIntegrationService,
    private ser: MainService,
  ) { }

  ngOnInit() {
    const data = {
      select: ['Imagen', 'Id', 'Title', 'Created','fechaActualizacion'],
      orderBy:'fechaActualizacion',
      reverse: true,
      top: 5000,
    };

    this.sis.read('IndiceNoticias', data).subscribe((response: any) => {
          console.log(response);
          this.data=response.value;
          console.log(this.data);
          this.getPages();
        });

  }
  getPages()
  {
    if(this.data.length%this.itemsperPage>0)
    {
      this.Pages=Math.floor(this.data.length/this.itemsperPage) + 1;
    }
    else
    {
       this.Pages=this.data.length/this.itemsperPage;
    }
    console.log("Pages: " + this.Pages)
    this.fillArr();
  }
  fillArr()
  {
    const datePipe = new DatePipe('en-US');
    var cont=0;
    for(var i=0; i<this.data.length; i++)
    {
      this.data[i].fechaActualizacion = datePipe.transform(this.data[i].fechaActualizacion,"dd-MM-yyyy");
      this.aux.push(this.data[i]);
      cont= cont +1;
      if(cont== this.itemsperPage)
      {
        cont=0;
        this.cards.push(this.aux);

        this.aux=[];
      }

    }
    if(this.aux)
    {
      this.cards.push(this.aux);
    }
    console.log('cards');
    console.log(this.cards);
  }
  changeForward()
  {
    this.actualPage=this.actualPage+1
    this.bandBack=false;
    if(this.actualPage==this.Pages)
    {
      this.bandFwd=true;
    }

  }
  changeBack()
  {
    this.actualPage=this.actualPage-1;
    this.bandFwd=false;
    if(this.actualPage==1)
    {
      this.bandBack=true;
    }

  }
}
