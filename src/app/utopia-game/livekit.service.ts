import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subscription, throwError } from 'rxjs';
import { HttpClient } from "@angular/common/http";
import { UtopiaBridgeService } from "./utopia-bridge.service";
import { 
    Room, 
    RoomEvent,
    RemoteTrack,
    Track
} from 'livekit-client';
import { Configurations } from '../configurations';

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

    constructor(private readonly http: HttpClient,
                private readonly bridge:UtopiaBridgeService)
    {
        this.room = new Room()
        this.room
            .on(RoomEvent.Connected, () => {
                console.log("Livekit room is connected")
                this.room.localParticipant.setCameraEnabled(false)
                this.room.localParticipant.setScreenShareEnabled(false)
                this.room.localParticipant.setMicrophoneEnabled(true)
            })
            .on(RoomEvent.TrackSubscribed, (
                track: RemoteTrack
            ) => {
                console.log("Track subscribed")
                if (track.kind === Track.Kind.Audio) {
                    track.attach();
                }
            })
    }

    start(contract$: Observable<{ network: number, address: string, wallet: string }>)
    {
        this.contractSubscription = contract$.subscribe(session => {
            let { network, address, wallet } = session
            this.getAccessToken(network.toString()+"_"+address, wallet)
                .subscribe((response: ApiResponse) => {
                        console.log("Livekit api response:", response)
                        if (response.success === false) {
                            return throwError(response.message)
                        }
                        this.room.connect(this.serverUrl, response.data, {
                            autoSubscribe: true
                        })
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
}
