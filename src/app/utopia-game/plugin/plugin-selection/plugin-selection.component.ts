import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { PluginService } from '../plugin.service';
import { LoadingService } from '../../../loading/loading.service';
import { Plugin } from '../Plugin';
import { PluginEditorComponent } from '../plugin-editor/plugin-editor.component';
import { ToastrService } from 'ngx-toastr';
import { PluginExecutionService } from '../plugin-execution.service';
import { UtopiaGameComponent } from '../../utopia-game.component';
import { UtopiaDialogService } from 'src/app/utopia-dialog.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { PluginConfirmationDialog } from '../plugin-confirmation-dialog/plugin-confirmation-dialog.component';

@Component({
    selector: 'app-plugin-selection',
    templateUrl: './plugin-selection.component.html',
    styleUrls: ['./plugin-selection.component.scss'],
    providers: []
})
export class PluginSelectionComponent implements OnInit {

    filter: string;
    plugins: Plugin[];

    constructor(readonly pluginService: PluginService, readonly loadingService: LoadingService,
                readonly dialog: UtopiaDialogService, readonly toaster: ToastrService,
                readonly pluginExecutionService: PluginExecutionService,
                readonly game: UtopiaGameComponent, private vcr: ViewContainerRef) {
        loadingService.prepare(
            pluginService.getPluginsForUser()
        ).pipe(
            catchError(err => {
                this.game.closePluginMenu();
                return throwError(err);
            })
        ).subscribe((plugins) => this.plugins = plugins);
    }

    ngOnInit(): void {
    }

    createNewPlugin() {
        this.dialog.open(PluginEditorComponent).subscribe(ref => {
            ref.afterClosed().subscribe((plugin) => {
                if (plugin) {
                    this.plugins.push(plugin);
                }
            });
        });
    }

    runPlugin(plugin: Plugin) {
        this.dialog.open(PluginConfirmationDialog, {
            data: {
                plugin: plugin,
            },
            viewContainerRef: this.vcr,
            disableClose: true
        }).subscribe((ref) => {
            ref.afterClosed().subscribe(result => {
                if (result.acceptedTerms) {
                    this.game.runPlugin(plugin);
                }
            });
        });
    }

    editPlugin(plugin: Plugin) {
        this.dialog.open(PluginEditorComponent, {
            data: plugin.id,
            viewContainerRef: this.vcr
        }).subscribe((ref) => {
            ref.afterClosed().subscribe(result => {
                if (result != null) {
                    Object.assign(plugin, result);
                }
            });
        });
    }

    deletePlugin(plugin: Plugin) {
        this.loadingService.prepare(
            this.pluginService.delete(plugin.id)
        ).subscribe(() => {
            this.toaster.success('Plugin deleted successfully');
            this.plugins = this.plugins.filter(p => p.id != plugin.id);
        });
    }
}
