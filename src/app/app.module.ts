import { EditProfileComponent } from './update-profile/update-profile.component';
import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, ErrorHandler, NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BuyLandsComponent } from './buy-lands/buy-lands.component';
import { ConnectionStatusIndicatorComponent } from './connection-status-indicator/connection-status-indicator.component';
import { ExceptionDialogContentComponent } from './exception-dialog-content/exception-dialog-content.component';
import { HomeComponent } from './home/home.component';
import { MetaMaskConnectingComponent } from './meta-mask-connecting/meta-mask-connecting.component';
import { PortLandsComponent } from './port-lands/port-lands.component';
import { SaveLandsComponent } from './save-lands/save-lands.component';
import { UtopiaGameComponent } from './utopia-game/utopia-game.component';
import { TransferLandComponent } from './transfer-land/transfer-land.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { SetNftComponent } from './set-nft/set-nft.component';
import { NetsInitializer } from './ehtereum/networks-loader.guard';
import { ToastrModule } from 'ngx-toastr';
import { OpenGameAtComponent } from './open-game-at/open-game-at.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { PluginInputsEditor } from './utopia-game/plugin/plugin-inputs-editor/plugin-inputs-editor.component';
import { FilterInputOptionsPipe } from './utopia-game/plugin/plugin-inputs-editor/filter-input-options.pipe';
import { OverlayModule } from '@angular/cdk/overlay';
import { PluginEditorComponent } from './utopia-game/plugin/plugin-editor/plugin-editor.component';
import { PluginSelectionComponent } from './utopia-game/plugin/plugin-selection/plugin-selection.component';
import { MatListModule } from '@angular/material/list';
import { AuthInterceptor } from './auth.interceptor';
import { GlobalErrorHandlerService } from './global-error-handler.service';
import { PluginRunningOverlayComponent } from './utopia-game/plugin/plugin-running-overlay/plugin-running-overlay.component';
import { SimpleDialogComponent } from './simple-dialog/simple-dialog.component';
import { MatMenuModule } from '@angular/material/menu';
import { PositionFieldComponent } from './utopia-game/plugin/plugin-inputs-editor/position-field/position-field.component';
import { LoadingComponent } from './loading/loading.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SanitizePipe } from './utopia-game/plugin/plugin-inputs-editor/sanitize.pipe';
import { PluginConfirmationDialog } from './utopia-game/plugin/plugin-confirmation-dialog/plugin-confirmation-dialog.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule } from '@angular/material/paginator';
import { PluginTableComponent } from './utopia-game/plugin/plugin-table/plugin-table.component';
import { PluginStoreDialogComponent } from './utopia-game/plugin/plugin-store-dialog/plugin-store-dialog.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { BlockTypeFieldComponent } from './utopia-game/plugin/plugin-inputs-editor/block-type-field/block-type-field.component';
import { PluginSearchBarComponent } from './utopia-game/plugin/plugin-search-bar/plugin-search-bar.component';

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        MetaMaskConnectingComponent,
        SaveLandsComponent,
        ExceptionDialogContentComponent,
        PortLandsComponent,
        BuyLandsComponent,
        UtopiaGameComponent,
        ConnectionStatusIndicatorComponent,
        TransferLandComponent,
        EditProfileComponent,
        SetNftComponent,
        OpenGameAtComponent,
        PluginInputsEditor,
        FilterInputOptionsPipe,
        PluginEditorComponent,
        PluginSelectionComponent,
        PluginRunningOverlayComponent,
        SimpleDialogComponent,
        PositionFieldComponent,
        LoadingComponent,
        SanitizePipe,
        PluginConfirmationDialog,
        PluginTableComponent,
        PluginStoreDialogComponent,
        BlockTypeFieldComponent,
        PluginSearchBarComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MatButtonModule,
        MatCardModule,
        FlexLayoutModule,
        MatDialogModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        MatFormFieldModule,
        MatTableModule,
        MatToolbarModule,
        MatIconModule,
        MatTooltipModule,
        MatRippleModule,
        FormsModule,
        MatInputModule,
        HttpClientModule,
        ToastrModule.forRoot({
            positionClass: 'toast-bottom-right',
            progressBar: true,
            timeOut: 5000
        }),
        ReactiveFormsModule,
        MatStepperModule,
        MatAutocompleteModule,
        OverlayModule,
        MatListModule,
        MatMenuModule,
        MatCheckboxModule,
        MatChipsModule,
        MatPaginatorModule,
        ColorPickerModule
    ],
    providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: NetsInitializer,
            deps: [HttpClient, MatDialog],
            multi: true
        },
        { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 2500 } },
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: ErrorHandler, useClass: GlobalErrorHandlerService },
    ],
    bootstrap: [AppComponent],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ],
})
export class AppModule {

    constructor() {
    }
}
