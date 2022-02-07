import { Component, Inject, OnInit } from '@angular/core';
import { PluginService } from '../plugin.service';
import { LoadingService } from '../../../loading.service';
import { Plugin } from '../Plugin';
import { MatDialog } from '@angular/material/dialog';
import { PluginEditorComponent } from '../plugin-editor/plugin-editor.component';
import { ToastrService } from 'ngx-toastr';
import { PluginInputsEditor } from '../plugin-inputs-editor/plugin-inputs-editor.component';
import { PluginExecutionService } from '../plugin-execution.service';
import { GAME_TOKEN, UtopiaGameComponent } from '../../utopia-game.component';

@Component({
    selector: 'app-plugin-selection',
    templateUrl: './plugin-selection.component.html',
    styleUrls: ['./plugin-selection.component.scss']
})
export class PluginSelectionComponent implements OnInit {

    filter: string;
    plugins: Plugin[];

    constructor(readonly pluginService: PluginService, readonly loadingService: LoadingService,
                readonly dialog: MatDialog, readonly toaster: ToastrService,
                readonly pluginExecutionService: PluginExecutionService,
                @Inject(GAME_TOKEN) readonly game: UtopiaGameComponent) {
        loadingService.prepare(
            pluginService.getPluginsForUser()
        ).subscribe((plugins) => this.plugins = plugins);
    }

    ngOnInit(): void {
    }

    createNewPlugin() {
        this.dialog.open(PluginEditorComponent)
            .afterClosed().subscribe((plugin) => {
            if (plugin) {
                this.plugins.push(plugin);
            }
        });
    }

    runPlugin(plugin: Plugin) {
        if (plugin.descriptorUrl) {
            let dialog = this.dialog.open(PluginInputsEditor, {
                data: plugin.id
            });
            dialog.afterClosed().subscribe(result => {
                if (result != null) {
                    this.game.runPlugin(result.code, result.inputs);
                }
            });
        } else {
            this.loadingService.prepare(
                this.pluginExecutionService.getFile(plugin.scriptUrl)
            ).subscribe(code => {
                this.game.runPlugin(code, []);
            });
        }
    }

    editPlugin(plugin: Plugin) {
        let dialog = this.dialog.open(PluginEditorComponent, {
            data: plugin.id
        });
        dialog.afterClosed().subscribe(result => {
            if (result != null) {
                Object.assign(plugin, result);
            }
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
