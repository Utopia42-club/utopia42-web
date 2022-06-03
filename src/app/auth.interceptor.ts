import {Injectable} from '@angular/core';
import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpResponse
} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {Configurations} from './configurations';
import {catchError, concatMap, map, tap} from 'rxjs/operators';
import {AUTH_STORAGE_KEY, AuthService, TOKEN_HEADER_KEY} from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {


    constructor(readonly authService: AuthService) {
    }

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        if (!request.url.startsWith(Configurations.SERVER_URL)
            || request.url.endsWith('networks.json')
            || request.url.includes('/auth')
            || request.url.includes('/login')) {
            return next.handle(request);
        } else if (request.url.includes('/profile/current')) {
            let req = request.clone({
                headers: request.headers.set(TOKEN_HEADER_KEY, this.authService.getCachedToken() ?? "Invalid Token")
            });
            return next.handle(req);
        }

        return this.authService.getAuthToken()
            .pipe(
                map(authToken => {
                    return request.clone({
                        headers: request.headers.set(TOKEN_HEADER_KEY, authToken)
                    });
                }),
                concatMap((authReq) => next.handle(authReq)
                    .pipe(
                        tap(event => {
                            if (event instanceof HttpResponse) {
                                const token = event.headers.get(TOKEN_HEADER_KEY);
                                if (token) {
                                    localStorage.setItem(AUTH_STORAGE_KEY, token);
                                }
                            }
                        }),
                        catchError(err => {
                            if (err instanceof HttpErrorResponse && err.status === 401) {
                                localStorage.removeItem(AUTH_STORAGE_KEY);
                                return this.intercept(request, next);
                            } else {
                                return throwError(err);
                            }
                        })
                    )
                )
            );
    }
}
