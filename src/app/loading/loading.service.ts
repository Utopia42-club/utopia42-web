import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { finalize, map, switchMap, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class LoadingService
{
    private readonly taskCounterSubject = new BehaviorSubject<number>(0);
    readonly loading$ = this.taskCounterSubject.pipe(map(v => v > 0));

    private taskStarted(): void
    {
        this.taskCounterSubject.next(this.taskCounterSubject.getValue() + 1);
    }

    private taskFinished(): void
    {
        this.taskCounterSubject.next(this.taskCounterSubject.getValue() - 1);
    }

    public prepare(observable: Observable<any>): Observable<any>
    {
        return of(1).pipe(
            tap(v => this.taskStarted()),
            switchMap(o => observable),
            finalize(() => this.taskFinished())
        );
    }
}
