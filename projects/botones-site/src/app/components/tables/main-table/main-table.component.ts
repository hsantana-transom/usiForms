import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { switchMap } from 'rxjs/operators';
import { MessageService, SharepointIntegrationService } from 'shared-lib';
import { MainFormDialogComponent } from '../../dialogs/main-form-dialog/main-form-dialog.component';
import { MainTableDataSource } from '../../../datasources/main-table-data-source';
import { MainTableService } from '../../../services/main-table.service';
import {AppComponent} from '../../../app.component';

@Component({
  selector: 'app-main-table',
  templateUrl: './main-table.component.html',
  styleUrls: ['./main-table.component.scss']
})
export class MainTableComponent implements OnInit {

  columns = COLUMNS;
  displayedColumns = ['id', 'title', 'order','color', 'createdLabel', 'operations'];
  dataSource: MainTableDataSource;
  loading = true;

  constructor(
    private dialog: MatDialog,
    private message: MessageService,
    private mts: MainTableService,
    private sis: SharepointIntegrationService,
    private mainApp: AppComponent
  ) {}

  ngOnInit() {
    this.dataSource = this.mts.dataSource;
    this.mts.loadData()
      .subscribe(
        () => {},
        err => this.message.genericHttpError(err),
        () => this.loading = false
      );
  }

  // Custom public methods

  onOperation(event) {
    switch (event.operation) {
      case 'delete':
        this.onDelete(event.item);
        break;
      case 'edit':
        this.onEdit(event.item);
        break;
    }
  }

  // Custom private methods

  private onDelete(item: any) {
    this.message.confirm({
      text: '¿Desea eliminar?',
      title: 'Eliminar'
    })
    .subscribe(response => {
      if (response) {
        this.sis.getFormDigest().pipe(
          switchMap(formDigest =>
            this.sis.delete('Botones', item.id, formDigest)
          )
        )
        .subscribe(
          () => {
            this.message.show('Elemento eliminado');
            this.mts.loadData().subscribe();
            this.mainApp.bandItems=false;
          },
          err => this.message.genericHttpError(err)
        );
      }
    });
  }

  private onEdit(item: any) {
    const dialogRef = this.dialog.open(MainFormDialogComponent, {
      data: item,
      disableClose: true
    });

    dialogRef.afterClosed()
      .subscribe(result => {
        if (result) {
          this.message.genericSaveMessage();
        }
      });
  }

}
export const COLUMNS = [
  {
    key: 'createdLabel',
    label: 'Creado'
  },
  {
    key: 'color',
    label: 'Color'
  },
  {
    key: 'id',
    label: 'ID'
  },
  {
    key: 'order',
    label: 'Orden'
  },
  {
    key: 'title',
    label: 'Título'
  }
];
