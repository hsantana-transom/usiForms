import { Component, ViewChild } from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  numeros=[1,2,3,4,5,6,7,8,9,10,11];
  page=0;
  nxp=5;
  actualPage=1;
  numbersInPage=[];
  aux=[];
  bandAtras=true;
  bandAdelante=false;
  ngOnInit()
  {
    console.log(this.numeros.length%this.nxp);
    console.log(this.numeros.length/this.nxp);
    if(this.numeros.length%this.nxp>0)
    {
      this.page=Math.floor(this.numeros.length/this.nxp)+1
    }
    else
    {
      this.page=(this.numeros.length/this.nxp)
    }
    console.log("paginas: " + this.page);
    var cont=0;
    for(var i=0; i<this.numeros.length; i++)
    {
      this.aux.push(this.numeros[i]);
      cont= cont +1;
      if(cont== this.nxp)
      {
        cont=0
        this.numbersInPage.push(this.aux);
        this.aux=[];
      }

    }
    if(this.aux)
    {
      this.numbersInPage.push(this.aux);
    }
    console.log(this.numbersInPage);
  }
  changeForward()
  {
    this.actualPage=this.actualPage+1
    this.bandAtras=false;
    if(this.actualPage==this.page)
    {
      this.bandAdelante=true;
    }

  }
  changeBack()
  {
    this.actualPage=this.actualPage-1;
    this.bandAdelante=false;
    if(this.actualPage==1)
    {
      this.bandAtras=true;
    }

  }
}
