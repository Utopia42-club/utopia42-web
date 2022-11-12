import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subscription, throwError } from 'rxjs';
import { HttpClient } from "@angular/common/http";
import { UtopiaBridgeService } from "./utopia-bridge.service";
import { 
    Room, 
    RoomEvent,
    RemoteTrack,
    Track,
    ConnectionState,
    RoomConnectOptions,
} from 'livekit-client';
import { Configurations } from '../configurations';
import { MatDialog } from '@angular/material/dialog';
import { ExceptionDialogContentComponent } from '../exception-dialog-content/exception-dialog-content.component';

interface ApiResponse {
    success: boolean;
    data?: string;
    message?: string;
}

@Injectable()
export class LivekitService implements OnDestroy
{
    private contractSubscription: Subscription;
    private room: Room;
    private readonly apiUrl = Configurations.Instance.livekitBackendApi;
    private readonly serverUrl = Configurations.Instance.livekitServer;

    private readonly ctrlaltListener = (e: KeyboardEvent) => {
        if(e.ctrlKey && e.altKey) {
            this.toggleMicrophone()
        }
    }

    constructor(private readonly http: HttpClient,
                private readonly bridge:UtopiaBridgeService,
                private readonly dialog:MatDialog)
    {
        this.room = new Room()
        this.room.localParticipant.setMicrophoneEnabled(false)
        this.room.localParticipant.setCameraEnabled(false)
        this.room.localParticipant.setScreenShareEnabled(false)
        this.room
            .on(RoomEvent.Connected, () => {
                console.log("Livekit room is connected")
                if(this.room.state === ConnectionState.Connected) {
                    this.room.localParticipant.setMicrophoneEnabled(true)
                } else {
                    console.log("Room state:", this.room.state)
                    this.dialog.open(ExceptionDialogContentComponent, {
                        data: {
                            title: "Voice connection error",
                            content: "Unable to connect to room",
                        }, closeOnNavigation: false,
                    })
                }
            })
            .on(RoomEvent.TrackSubscribed, (
                track: RemoteTrack
            ) => {
                console.log("Track subscribed")
                if (track.kind === Track.Kind.Audio) {
                    track.attach();
                }
            })
            .on(RoomEvent.Disconnected, () => {
                this.room.localParticipant.setMicrophoneEnabled(false)
                console.log("Livekit room was disconnected")
            })

        document.addEventListener("keydown", this.ctrlaltListener)
    }

    start(contract$: Observable<{ network: number, address: string, wallet: string }>)
    {
        this.contractSubscription = contract$.subscribe(session => {
            let { network, address, wallet } = session
            this.getAccessToken(network.toString()+"_"+address, wallet)
                .subscribe((response: ApiResponse) => {
                        console.log("Livekit api response:", response)
                        if (response.success) {
                            try {
                                // const connectOpts: RoomConnectOptions = {
                                //     rtcConfig: {
                                //         iceTransportPolicy: 'relay',
                                //     },
                                // };
                                this.room.connect(this.serverUrl, response.data)
                            } catch (error) {
                                this.dialog.open(ExceptionDialogContentComponent, {
                                    data: {
                                        title: "Voice connection error",
                                        content: "Unable to connect to room",
                                    }, closeOnNavigation: false,
                                })
                                console.log("Livekit connect error:", error)
                            }
                        } else {
                            this.dialog.open(ExceptionDialogContentComponent, {
                                data: {
                                    title: "Voice connection error",
                                    content: "Unable to get access token",
                                }, closeOnNavigation: false,
                            })
                            console.log("Livekit api error:", response.message)
                        }
                    }
                );
        });
    }

    ngOnDestroy()
    {
        this.contractSubscription?.unsubscribe();
        this.room.disconnect();
        console.log("Livekit room is disconnected")
    }

    /**
     * getAccessToken
     */
    public getAccessToken(verse: string, wallet: string): Observable<ApiResponse> {
        return this.http.post<ApiResponse>(this.apiUrl+"join", {
            'verse': verse,
            'participant': wallet
        })
    }

    private toggleMicrophone()
    {
        if(this.room) {
            if(this.room.localParticipant.isMicrophoneEnabled) {
                this.room.localParticipant.setMicrophoneEnabled(false)
            } else {
                this.room.localParticipant.setMicrophoneEnabled(true)
            }
        }
    }
}
