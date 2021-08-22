import { ExceptionDialogContentComponent } from './../exception-dialog-content/exception-dialog-content.component';
import { takeLast, tap, catchError, map, concatMap } from 'rxjs/operators';
import { ProfileService } from './profile.service';
import { Web3Service } from './../ehtereum/web3.service';
import { UpdateProfileData } from './update-profile-data';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { from, of, Subscription, throwError } from 'rxjs';
import { LoadingService } from '../loading.service';

@Component({
  selector: 'app-update-profile',
  templateUrl: './update-profile.component.html',
  styleUrls: ['./update-profile.component.scss']
})
export class UpdateProfileComponent implements OnInit, OnDestroy {

    private subscription = new Subscription();
    readonly walletId: string;
    profile: Profile;
    linkMedias: Media[] = [TELEGRAM, DISCORD, FACEBOOK, TWITTER, INSTAGRAM, OTHER]
    // TODO: add more

    constructor(@Inject(MAT_DIALOG_DATA) public data: UpdateProfileData,
        private dialogRef: MatDialogRef<any>,
        private dialog: MatDialog,
        private readonly web3Service: Web3Service,
        private readonly profileService: ProfileService,
        private readonly loadingService: LoadingService,
        private snackBar: MatSnackBar)
    {
        this.walletId = data.request.connection.wallet; //TODO: remove?
        this.profile = getProfileInfo(this.walletId);
    }

    ngOnInit(): void
    {
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
            link: "",
            media: INSTAGRAM
        })
    }

    linksValid(): boolean
    {
        // TODO: return false if not changed
        // TODO: return false if url not valid
        for (const link of this.profile.links) {
            if(link.link.trim() === "") return false;
        }
        return true;
    }

    cancel(): void
    {
        this.dialogRef.close();
    }

    update(): void
    {
        this.subscription.add(
            this.loadingService.prepare(
                this.web3Service.provider()
                    .pipe(
                        concatMap((provider) =>
                        {
                            // FIXME: ?
                            return this.profileService.requestNonce({}).pipe(map(data => {
                                console.log(data)
                                from(provider.request({
                                    method: 'eth_signTypedData_v4',
                                    params: [provider.selectedAddress, JSON.stringify(data)],
                                    from: provider.selectedAddress
                                })).pipe(map(signature => {
                                    console.log('sig', signature)
                                    this.profileService.login(provider.selectedAddress, <string> signature).pipe(map(v => {
                                        console.log("login res", v);
                                        return true;
                                    }))
                                }))
                                throw Error;
                            }))
                        }), catchError(e =>
                        {
                            this.dialog.open(ExceptionDialogContentComponent, { data: { title: "Failed to login!" } }); // TODO: change
                            return of(false);
                        }), takeLast(1), tap(v =>
                        {
                            if (v) {
                                this.snackBar.open(`Logged in successfully.`);
                                this.dialogRef.close();
                            }
                        })
                    )
            ).subscribe()
        );
    }
}

function getProfileInfo(walletId: string): Profile{
    return {
        bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        imageUrl: "https://www.jennstrends.com/wp-content/uploads/2013/10/bad-profile-pic-2-768x768.jpeg",
        links: [
            {
                link: "instagram.com/dummy",
                media: INSTAGRAM
            },
            {
                link: "telegram.me/dummy",
                media: TELEGRAM
            }
        ],
        name: "Dummy Dum",

    }
}

interface Profile{
    name: string,
    bio: string,
    links: Link[],
    imageUrl: string,
}

interface Link{
    link: string,
    media: Media
}

interface Media{
    index: number,
    name: string
}

const TELEGRAM: Media = { 
    index: 0,
    name: "Telegram"
}

const DISCORD: Media = {
    index: 0,
    name: "Discord"
}

const FACEBOOK: Media = {
    index: 0,
    name: "Facebook"
}

const TWITTER: Media = {
    index: 0,
    name: "Twitter"
}

const INSTAGRAM: Media = {
    index: 0,
    name: "Instagram"
}

const OTHER: Media = {
    index: 0,
    name: "Link"
}