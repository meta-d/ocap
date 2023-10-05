import { Component, HostBinding, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'ngm-confirm-delete',
  templateUrl: './confirm-delete.component.html',
  styleUrls: ['./confirm-delete.component.scss']
})
export class ConfirmDeleteComponent implements OnInit {
  @HostBinding('class.ngm-dialog-container') isDialogContainer = true

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {value: any, information: string}
  ) { }

  ngOnInit(): void {
  }

}
