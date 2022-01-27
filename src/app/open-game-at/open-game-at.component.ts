import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
    selector: 'app-open-game-at',
    templateUrl: './open-game-at.component.html',
    styleUrls: ['./open-game-at.component.scss'],
})
export class OpenGameAtComponent implements OnInit {
    readonly position = { x: null, y: null, z: null};

    constructor(
        private dialogRef: MatDialogRef<any>,
        private readonly router: Router
    ) {}

    ngOnInit(): void {}

    positionValid(): boolean {
        return this.position.x && this.position.y && this.position.z;
    }

    start(): void {
        this.router.navigate(['game'], {
            queryParams: { position: this.getPosition() },
        });
        this.dialogRef.close();
    }

    cancel(): void {
        this.dialogRef.close();
    }

    private getPosition(): string {
        return `${this.position.x}_${this.position.y}_${this.position.z}`;
    }
}
