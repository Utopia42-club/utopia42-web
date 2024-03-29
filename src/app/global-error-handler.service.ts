import { ErrorHandler, Injectable, NgZone } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ExceptionDialogContentComponent } from './exception-dialog-content/exception-dialog-content.component';
import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';
import { UtopiaError } from './UtopiaError';

@Injectable()
export class GlobalErrorHandlerService implements ErrorHandler {
    private readonly dialogRefs: MatDialogRef<any>[] = [];

    constructor(private readonly dialog: MatDialog, private readonly zone: NgZone) {
    }

    handleError(error: any): void {
        this.zone.run(() => {
            console.warn('Exception occurred!', error);

            while (error.rejection != null) {
                error = error.rejection;
            }

            let message;
            let title;
            if (error instanceof HttpErrorResponse) {
                if (error.status == 0 || error.status == null) {
                    title = 'Connection error';
                    message = 'Could not connect to the server. Please check your internet connection and try again.';
                } else if (error.status == 403) {
                    title = 'Access denied';
                    message = 'You do not have permission to access this resource.';
                } else if (error.status == 401) {
                    title = 'Unauthorized';
                    message = 'You are not authorized to access this resource.';
                } else if (error.status == 404) {
                    title = 'Not found';
                    message = 'The requested resource could not be found.';
                } else if (error.status == 500) {
                    title = 'Internal server error';
                    message = 'An internal server error occurred. Please try again later.';
                } else {
                    title = 'HTTP error';
                    message = 'An HTTP error occurred. Please try again later.';
                }
            } else if (error instanceof TimeoutError) {
                title = 'Timeout';
                message = 'The server did not respond in time.';
            } else if (error.code != null && error.code == 4001) {
                title = 'Login error';
                message = error.message;
            } else if (error instanceof UtopiaError) {
                title = 'Exception';
                message = error.message;
            }
            if (title == null) {
                title = 'Exception';
                message = 'An exception occurred.';
            }

            console.error(error);

            let dialogRef = this.dialog.open(ExceptionDialogContentComponent,
                {
                    data: {
                        title: title,
                        content: message,
                    }, closeOnNavigation: false,
                });
            this.dialogRefs.push(dialogRef);
            dialogRef.afterClosed().subscribe(
                () => this.dialogRefs.splice(this.dialogRefs.indexOf(dialogRef), 1)
            );
        });
    }
}
