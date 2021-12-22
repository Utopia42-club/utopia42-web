import { ExceptionDialogContentComponent } from './../exception-dialog-content/exception-dialog-content.component';
import { catchError, concatMap, tap } from 'rxjs/operators';
import { ProfileService } from './profile.service';
import { Web3Service } from './../ehtereum/web3.service';
import { EditProfileData } from './update-profile-data';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, } from '@angular/material/dialog';
import { of, Subscription } from 'rxjs';
import { LoadingService } from '../loading.service';
import { ToastrService } from "ngx-toastr";

@Component({
    selector: 'app-update-profile',
    templateUrl: './update-profile.component.html',
    styleUrls: ['./update-profile.component.scss'],
})
export class EditProfileComponent implements OnInit, OnDestroy
{
    private subscription = new Subscription();
    private tokenAuth: string;
    private imageFile: File;
    readonly walletId: string;
    readonly defaultImageUrl: string | ArrayBuffer =
        'assets/images/unknown.jpg';

    profile: Profile;
    imageUrl: string | ArrayBuffer;
    linkMedias: Media[] = [
        Media.Telegram,
        Media.Discord,
        Media.Facebook,
        Media.Twitter,
        Media.Instagram,
        Media.Other,
    ];

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: EditProfileData,
        private dialogRef: MatDialogRef<any>,
        private dialog: MatDialog,
        private readonly web3Service: Web3Service,
        private readonly profileService: ProfileService,
        private readonly loadingService: LoadingService,
        private readonly toaster: ToastrService
    )
    {
        this.walletId = data.request.connection.wallet;
        this.profile = {
            walletId: this.walletId,
            bio: '',
            links: [
                {
                    link: '',
                    media: Media.Instagram,
                },
            ],
            name: '',
        };
    }

    ngOnInit(): void
    {
        this.loadData();
    }

    ngOnDestroy(): void
    {
        this.subscription.unsubscribe();
    }

    removeLink(index: number): void
    {
        this.profile.links.splice(index, 1);
    }

    addLink(): void
    {
        this.profile.links.push({
            link: '',
            media: Media.Instagram,
        });
    }

    mediaToString(media: Media): string
    {
        return (
            media.toString()[0].toUpperCase() +
            media.toString().toLowerCase().substring(1)
        );
    }

    isValidUrl(urlString: string): boolean
    {
        try {
            let pattern = new RegExp(
                '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?'
            );
            return pattern.test(urlString);
        } catch (TypeError) {
            return false;
        }
    }

    linksValid(): boolean
    {
        if (this.profile.name.trim() === '') return false;
        for (const link of this.profile.links) {
            if (!this.isValidUrl(link.link.trim())) {
                console.log('false', link.link);
                return false;
            }
        }
        return true;
    }

    onImageChange(file: File): void
    {
        if (file) {
            if (file.size > 2 ** 20) {
                this.dialog.open(ExceptionDialogContentComponent, {
                    data: {
                        title: 'Chosen image size exceeds the limit of 1 MB!',
                    },
                });
                return;
            }

            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = (_) => {
                this.imageUrl = reader.result;
                this.imageFile = file;
            };
        }
    }

    cancel(): void
    {
        this.dialogRef.close();
    }

    loadData(): void
    {
        this.subscription.add(
            this.loadingService
                .prepare(
                    this.profileService.getProfile(this.walletId).pipe(
                        concatMap((profile: Profile) => {
                            if (profile) {
                                this.profile = profile;
                                if (this.profile.imageUrl)
                                    return this.profileService.getAvatar(
                                        <string>this.profile.imageUrl
                                    );
                            }
                            return of(false);
                        }),

                        concatMap((image: File) => {
                            if (image) {
                                const reader = new FileReader();
                                reader.readAsDataURL(image);
                                reader.onload = (_) => {
                                    this.imageUrl = reader.result;
                                };
                            }
                            return of(true);
                        }),

                        catchError((e) => {
                            if (e?.status === 404) return of(true);

                            this.dialog.open(ExceptionDialogContentComponent, {
                                data: {
                                    title: 'Failed to retrieve user profile!',
                                },
                            });
                            this.dialogRef.close();
                            return of(false);
                        }),

                        tap((v) => {
                            if (v) {
                                this.toaster.info('User profile retrieved successfully');
                            }
                        })
                    )
                )
                .subscribe()
        );
    }

    update(): void
    {
        let provider: any;
        this.profile.imageUrl = undefined;
        this.subscription.add(
            this.loadingService
                .prepare(
                    this.web3Service.provider().pipe(
                        concatMap((p) => {
                            provider = p;
                            return this.profileService.requestNonce(
                                provider.networkVersion,
                                provider.selectedAddress.toLowerCase()
                            );
                        }),

                        concatMap((data) => {
                            return provider.request({
                                method: 'eth_signTypedData_v4',
                                params: [
                                    provider.selectedAddress.toLowerCase(),
                                    JSON.stringify(data),
                                ],
                                from: provider.selectedAddress.toLowerCase(),
                            });
                        }),

                        concatMap((signature) => {
                            return this.profileService.login(
                                provider.selectedAddress,
                                <string>signature
                            );
                        }),

                        concatMap((res) => {
                            this.tokenAuth = res.headers.get('X-Auth-Token');
                            return this.profileService.setProfile(
                                this.profile,
                                this.tokenAuth
                            );
                        }),

                        concatMap((_) => {
                            if (this.imageFile)
                                return this.profileService.setAvatar(
                                    this.imageFile,
                                    this.walletId,
                                    this.tokenAuth
                                );
                            return of(true);
                        }),
                        catchError((e) => {
                            this.dialog.open(ExceptionDialogContentComponent, {
                                data: {
                                    title: 'Failed to update user profile!',
                                },
                            });
                            return of(false);
                        }),
                        tap((_) => {
                            this.toaster.info(`User profile updated successfully`);
                            this.dialogRef.close();
                        })
                    )
                )
                .subscribe()
        );
    }
}

export interface Profile
{
    walletId: string;
    name?: string;
    bio?: string;
    links: Link[];
    imageUrl?: string | ArrayBuffer;
}

interface Link
{
    link: string;
    media: Media;
}

enum Media
{
    Telegram = 'TELEGRAM',
    Discord = 'DISCORD',
    Facebook = 'FACEBOOK',
    Twitter = 'TWITTER',
    Instagram = 'INSTAGRAM',
    Other = 'OTHER',
}
