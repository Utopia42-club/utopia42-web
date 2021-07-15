import { Component, OnInit } from '@angular/core';
import { UtopiaBridgeService } from './utopia-bridge.service';

@Component({
    selector: 'app-utopia-game',
    templateUrl: './utopia-game.component.html',
    styleUrls: ['./utopia-game.component.scss'],
    providers: [UtopiaBridgeService]
})
export class UtopiaGameComponent implements OnInit {

    constructor(private bridge: UtopiaBridgeService) {
        window.bridge = bridge;
    }

    ngOnInit(): void {
        var buildUrl = "/assets/game/Build";
        var config = {
            dataUrl: buildUrl + "/web.data",
            frameworkUrl: buildUrl + "/web.framework.js",
            codeUrl: buildUrl + "/web.wasm",
            streamingAssetsUrl: "StreamingAssets",
            companyName: "DefaultCompany",
            productName: "Voxel",
            productVersion: "0.1",
        };

        var canvas = document.querySelector("#unity-canvas") as any;
        var loadingBar = document.querySelector("#unity-loading-bar") as any;
        var progressBarFull = document.querySelector("#unity-progress-bar-full") as any;
        var fullscreenButton = document.querySelector("#unity-fullscreen-button") as any;
        // var mobileWarning = document.querySelector("#unity-mobile-warning") as any;

        // By default Unity keeps WebGL canvas render target size matched with
        // the DOM size of the canvas element (scaled by window.devicePixelRatio)
        // Set this to false if you want to decouple this synchronization from
        // happening inside the engine, and you would instead like to size up
        // the canvas DOM size and WebGL render target sizes yourself.
        // config.matchWebGLToCanvasSize = false;

        // if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        //     container.className = "unity-mobile";
        //     // Avoid draining fillrate performance on mobile devices,
        //     // and default/override low DPI mode on mobile browsers.
        //     config.devicePixelRatio = 1;
        //     mobileWarning.style.display = "block";
        //     setTimeout(() => {
        //         mobileWarning.style.display = "none";
        //     }, 5000);
        // } else {
        canvas.style.width = "960px";
        canvas.style.height = "600px";
        // }
        loadingBar.style.display = "block";

        window.createUnityInstance(canvas, config, (progress: any) => {
            progressBarFull.style.width = 100 * progress + "%";
        }).then((unityInstance: any) => {
            loadingBar.style.display = "none";
            this.bridge.unityInstance = unityInstance;
            fullscreenButton.onclick = () => {
                unityInstance.SetFullscreen(1);
            };
        }).catch((message: any) => {
            alert(message);
        });
    }

}
