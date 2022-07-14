import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { CUSTOM_ELEMENTS_SCHEMA, ErrorHandler, NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
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
import { ExceptionDialogContentComponent } from './exception-dialog-content/exception-dialog-content.component';
import { HomeComponent } from './home/home.component';
import { SaveLandsComponent } from './save-lands/save-lands.component';
import { UtopiaGameComponent } from './utopia-game/utopia-game.component';
import { TransferLandComponent } from './transfer-land/transfer-land.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { SetNftComponent } from './set-nft/set-nft.component';
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
import { AuthInterceptor } from './auth/auth.interceptor';
import { GlobalErrorHandlerService } from './global-error-handler.service';
import { SimpleDialogComponent } from './simple-dialog/simple-dialog.component';
import { MatMenuModule } from '@angular/material/menu';
import { LoadingComponent } from './loading/loading.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SanitizePipe } from './utopia-game/plugin/plugin-inputs-editor/sanitize.pipe';
import {
    PluginConfirmationDialog
} from './utopia-game/plugin/plugin-confirmation-dialog/plugin-confirmation-dialog.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule } from '@angular/material/paginator';
import { PluginTableComponent } from './utopia-game/plugin/plugin-table/plugin-table.component';
import { PluginStoreDialogComponent } from './utopia-game/plugin/plugin-store-dialog/plugin-store-dialog.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { PluginSearchBarComponent } from './utopia-game/plugin/plugin-search-bar/plugin-search-bar.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {
    InputFieldComponent
} from './utopia-game/plugin/plugin-inputs-editor/input-form/input-field/input-field.component';
import {
    PositionFieldComponent
} from "./utopia-game/plugin/plugin-inputs-editor/input-form/fields/position-field/position-field.component";
import {
    BlockTypeFieldComponent
} from "./utopia-game/plugin/plugin-inputs-editor/input-form/fields/block-type-field/block-type-field.component";
import {
    FileInputFieldComponent
} from "./utopia-game/plugin/plugin-inputs-editor/input-form/fields/file-input-field/file-input-field.component";
import {
    BlockTypeInputFieldComponent
} from "./utopia-game/plugin/plugin-inputs-editor/input-form/fields/block-type-input-field/block-type-input-field.component";
import {
    LandInputFieldComponent
} from "./utopia-game/plugin/plugin-inputs-editor/input-form/fields/land-input-field/land-input-field.component";
import {
    PositionInputFieldComponent
} from "./utopia-game/plugin/plugin-inputs-editor/input-form/fields/position-input-field/position-input-field.component";
import {
    SelectionInputFieldComponent
} from "./utopia-game/plugin/plugin-inputs-editor/input-form/fields/selection-input-field/selection-input-field.component";
import {
    TextInputFieldComponent
} from "./utopia-game/plugin/plugin-inputs-editor/input-form/fields/text-input-field/text-input-field.component";
import {
    NumberInputFieldComponent
} from "./utopia-game/plugin/plugin-inputs-editor/input-form/fields/number-input-field/number-input-field.component";
import { InputFormComponent } from "./utopia-game/plugin/plugin-inputs-editor/input-form/input-form.component";
import {
    ListInputComponent
} from "./utopia-game/plugin/plugin-inputs-editor/input-form/list-input/list-input.component";
import {
    MasterSlaveInputComponent
} from './utopia-game/plugin/plugin-inputs-editor/input-form/master-slave-input/master-slave-input.component';
import {
    FileFieldComponent
} from "./utopia-game/plugin/plugin-inputs-editor/input-form/fields/file-field/file-field.component";
import { MetaMaskConnectingComponent } from "./meta-mask-connecting/meta-mask-connecting.component";

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        SaveLandsComponent,
        ExceptionDialogContentComponent,
        BuyLandsComponent,
        UtopiaGameComponent,
        TransferLandComponent,
        EditProfileComponent,
        SetNftComponent,
        OpenGameAtComponent,
        PluginInputsEditor,
        FilterInputOptionsPipe,
        PluginEditorComponent,
        PluginSelectionComponent,
        SimpleDialogComponent,
        PositionFieldComponent,
        LoadingComponent,
        SanitizePipe,
        PluginConfirmationDialog,
        PluginTableComponent,
        PluginStoreDialogComponent,
        BlockTypeFieldComponent,
        PluginSearchBarComponent,
        FileInputFieldComponent,
        BlockTypeInputFieldComponent,
        LandInputFieldComponent,
        PositionInputFieldComponent,
        SelectionInputFieldComponent,
        TextInputFieldComponent,
        NumberInputFieldComponent,
        InputFormComponent,
        ListInputComponent,
        InputFieldComponent,
        MasterSlaveInputComponent,
        FileFieldComponent,
        MetaMaskConnectingComponent
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
        ColorPickerModule,
        MatTabsModule,
        MaterialFileInputModule,
        MatSlideToggleModule
    ],
    providers: [
        { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 2500 } },
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: ErrorHandler, useClass: GlobalErrorHandlerService },
    ],
    bootstrap: [AppComponent],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ],
})
export class AppModule
{

    constructor()
    {
    }
}
