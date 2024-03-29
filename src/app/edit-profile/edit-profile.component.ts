import { ExceptionDialogContentComponent } from '../exception-dialog-content/exception-dialog-content.component';
import { concatMap } from 'rxjs/operators';
import { ProfileService } from './profile.service';
import { Web3Service } from '../ehtereum/web3.service';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, } from '@angular/material/dialog';
import { of, Subscription } from 'rxjs';
import { LoadingService } from '../loading/loading.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../auth/auth.service';
import { FormArray, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { Configurations } from "../configurations";
import { ErrorStateMatcher } from "@angular/material/core";

export class EagerStateMatcher implements ErrorStateMatcher
{
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean
    {
        const isSubmitted = form && form.submitted;
        return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
    }
}

@Component({
    selector: 'app-edit-profile',
    templateUrl: './edit-profile.component.html',
    styleUrls: ['./edit-profile.component.scss'],
})
export class EditProfileComponent implements OnInit, OnDestroy
{
    private subscription = new Subscription();
    private chosenImageFile: File;
    private imageChanged = false;
    readonly walletId: string;
    readonly unknownImage = 'assets/images/unknown.jpg';
    imageSrc: string | ArrayBuffer;

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
    matcher = new EagerStateMatcher();

    constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<any>,
                private dialog: MatDialog,
                private readonly web3Service: Web3Service, private readonly profileService: ProfileService,
                private readonly authService: AuthService, private readonly loadingService: LoadingService,
                private readonly toaster: ToastrService)
    {

        this.walletId = data.walletId;

        this.form = new FormGroup({
            walletId: new FormControl(this.walletId),
            name: new FormControl(null, [Validators.required]),
            bio: new FormControl(null, [Validators.maxLength(2048)]),
            avatarUrl: new FormControl(null, [Validators.maxLength(255),
                Validators.pattern(this.urlPattern)
            ]),
            links: new FormArray([]),
        });
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
        (this.form.get('links') as FormArray).removeAt(index);
    }

    addLink(): void
    {
        (this.form.get('links') as FormArray).push(
            this.createLinkFormGroup({
                media: Media.INSTAGRAM,
                link: null,
            })
        );
    }

    onImageChange(file: File): void
    {
        if (file != null) {
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
                this.chosenImageFile = file;
                this.imageChanged = true;
            };
        } else {
            this.chosenImageFile = null;
            this.imageChanged = true;
            this.imageSrc = null;
        }
    }

    cancel(): void
    {
        this.dialogRef.close();
    }

    loadData(): void
    {
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

    createLinkFormGroup(link: Link)
    {
        return new FormGroup({
            media: new FormControl(link.media, [Validators.required]),
            link: new FormControl(link.link, [
                Validators.required,
                Validators.pattern(this.urlPattern)
            ]),
        });
    }

    save(): void
    {
        let profile = this.form.getRawValue();
        this.subscription.add(
            this.loadingService.prepare(
                this.profileService.setProfile(profile)
                    .pipe(
                        concatMap((_) => {
                            if (!this.imageChanged) return of(true);
                            if (this.chosenImageFile != null)
                                return this.profileService.setProfileImage(
                                    this.chosenImageFile,
                                    this.walletId,
                                );
                            return this.profileService.unsetProfileImage(this.walletId);
                        }),
                    )
            ).subscribe(value => {
                this.toaster.success(`Profile updated successfully`);
                this.dialogRef.close();
            })
        );
    }

    asFormArray(form: any): FormArray
    {
        return form as FormArray;
    }

    asFormGroup(form: any): FormGroup
    {
        return form as FormGroup;
    }

    openAvatarDesigner()
    {
        window.open(Configurations.Instance.avatarDesignerURL);
    }

    removeImage()
    {
        this.onImageChange(null);
    }
}

export interface Profile
{
    walletId: string;
    name?: string;
    bio?: string;
    links: Link[];
    imageUrl?: string;
    avatarUrl?: string;
}

interface Link
{
    link: string;
    media: Media;
}

enum Media
{
    TELEGRAM = 'TELEGRAM',
    DISCORD = 'DISCORD',
    FACEBOOK = 'FACEBOOK',
    TWITTER = 'TWITTER',
    INSTAGRAM = 'INSTAGRAM',
    OTHER = 'OTHER',
}

