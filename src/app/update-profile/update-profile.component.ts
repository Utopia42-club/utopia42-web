import {ExceptionDialogContentComponent} from '../exception-dialog-content/exception-dialog-content.component';
import {concatMap} from 'rxjs/operators';
import {ProfileService} from './profile.service';
import {Web3Service} from '../ehtereum/web3.service';
import {EditProfileData} from './update-profile-data';
import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef,} from '@angular/material/dialog';
import {of, Subscription} from 'rxjs';
import {LoadingService} from '../loading/loading.service';
import {ToastrService} from 'ngx-toastr';
import {AuthService} from '../auth.service';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {Configurations} from "../configurations";

@Component({
    selector: 'app-update-profile',
    templateUrl: './update-profile.component.html',
    styleUrls: ['./update-profile.component.scss'],
})
export class EditProfileComponent implements OnInit, OnDestroy {
    private subscription = new Subscription();
    private imageFile: File;
    readonly walletId: string;
    imageSrc: string | ArrayBuffer = 'assets/images/unknown.jpg';

    linkMedias: Media[] = [
        Media.INSTAGRAM,
        Media.TELEGRAM,
        Media.DISCORD,
        Media.FACEBOOK,
        Media.TWITTER,
        Media.OTHER,
    ];
    form: FormGroup;
    private urlPattern = 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{2,256}\\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)';

    constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<any>,
                private dialog: MatDialog,
                private readonly web3Service: Web3Service, private readonly profileService: ProfileService,
                private readonly authService: AuthService, private readonly loadingService: LoadingService,
                private readonly toaster: ToastrService) {

        this.walletId = data.walletId;

        this.form = new FormGroup({
            walletId: new FormControl(this.walletId),
            name: new FormControl(null, [Validators.required]),
            bio: new FormControl(null, [Validators.maxLength(255)]),
            avatarUrl: new FormControl(null, [Validators.maxLength(255),
                Validators.pattern(this.urlPattern)
            ]),
            links: new FormArray([
                this.createLinkFormGroup({
                    media: Media.INSTAGRAM,
                    link: null,
                })
            ]),
        });
    }

    ngOnInit(): void {
        this.loadData();
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    removeLink(index: number): void {
        (this.form.get('links') as FormArray).removeAt(index);
    }

    addLink(): void {
        (this.form.get('links') as FormArray).push(
            this.createLinkFormGroup({
                media: Media.INSTAGRAM,
                link: null,
            })
        );
    }

    onImageChange(file: File): void {
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
                this.imageSrc = reader.result;
                this.imageFile = file;
            };
        }
    }

    cancel(): void {
        this.dialogRef.close();
    }

    loadData(): void {
        this.subscription.add(this.loadingService.prepare(
                this.profileService.getProfile(this.walletId)
                    .pipe(
                        concatMap((profile: Profile) => {
                            if (profile) {
                                this.form.controls.links = new FormArray(
                                    profile.links.map(value => this.createLinkFormGroup(value))
                                );
                                this.form.patchValue(profile);
                                if (profile.imageUrl) {
                                    return this.profileService.getProfileImage(profile.imageUrl);
                                }
                            }
                            return of(undefined);
                        }),

                        concatMap((image: File) => {
                            if (image) {
                                const reader = new FileReader();
                                reader.readAsDataURL(image);
                                reader.onload = (_) => {
                                    this.imageSrc = reader.result;
                                };
                            }
                            return of(undefined);
                        }),
                    )
            ).subscribe(() => {
            }, error => {
                if (error.status != 404) {
                    throw error;
                }
            })
        );
    }

    createLinkFormGroup(link: Link) {
        return new FormGroup({
            media: new FormControl(link.media, [Validators.required]),
            link: new FormControl(link.link, [
                Validators.required,
                Validators.pattern(this.urlPattern)
            ]),
        });
    }

    update(): void {
        let profile = this.form.getRawValue();
        this.subscription.add(
            this.loadingService.prepare(
                this.profileService.setProfile(profile)
                    .pipe(
                        concatMap((_) => {
                            if (this.imageFile) {
                                return this.profileService.setProfileImage(
                                    this.imageFile,
                                    this.walletId,
                                );
                            }
                            return of(true);
                        }),
                    )
            ).subscribe(value => {
                this.toaster.success(`Profile updated successfully`);
                this.dialogRef.close();
            })
        );
    }

    asFormArray(form: any): FormArray {
        return form as FormArray;
    }

    asFormGroup(form: any): FormGroup {
        return form as FormGroup;
    }

    openAvatarDesigner() {
        window.open(Configurations.AVATAR_DESIGNER_URL);
    }
}

export interface Profile {
    walletId: string;
    name?: string;
    bio?: string;
    links: Link[];
    imageUrl?: string;
    avatarUrl?: string;
}

interface Link {
    link: string;
    media: Media;
}

enum Media {
    TELEGRAM = 'TELEGRAM',
    DISCORD = 'DISCORD',
    FACEBOOK = 'FACEBOOK',
    TWITTER = 'TWITTER',
    INSTAGRAM = 'INSTAGRAM',
    OTHER = 'OTHER',
}

