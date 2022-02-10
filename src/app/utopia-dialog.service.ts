import { concatMap, map, take } from 'rxjs/operators';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Injectable } from "@angular/core";
import { ComponentType } from '@angular/cdk/portal';
import { Observable, ReplaySubject, Subject, timer } from 'rxjs';


@Injectable({providedIn: 'root'})
export class UtopiaDialogService {

    private readonly openRequests = new Subject<DialogRequest<any>>();

    constructor(public readonly matDialog: MatDialog){
        this.openRequests.pipe(concatMap((request) => 
            timer(1).pipe(map(() => request))
        )).subscribe(request => {request.execute()});
    }

    public open<T, D = any, R = any>(component: ComponentType<T>, config?: MatDialogConfig<D>): Observable<MatDialogRef<T, R>> {
        const req = new DialogRequest(this.matDialog, component, config); 
        this.openRequests.next(req);
        return req.result$;
    }
}

class DialogRequest <T, D = any, R = any>{
    
    private readonly resultSubject = new ReplaySubject<MatDialogRef<T, R>>(1);
    public readonly result$ = this.resultSubject.asObservable().pipe(take(1));

    constructor(private readonly matDialog: MatDialog, 
        private readonly component: ComponentType<T>, 
        private readonly config?: MatDialogConfig<D>)
    {
        
    }

    public execute(): void{
        this.resultSubject.next(this.matDialog.open(this.component, this.config));
        console.log('exec')
    }
}