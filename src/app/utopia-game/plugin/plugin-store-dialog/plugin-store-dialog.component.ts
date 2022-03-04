import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { PluginTableComponent, PluginTableDataLoader, PluginTableRowAction } from '../plugin-table/plugin-table.component';
import { Plugin } from '../Plugin';
import { PluginService } from '../plugin.service';
import { SearchCriteria } from '../SearchCriteria';
import { debounceTime } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-plugin-store-dialog',
    templateUrl: './plugin-store-dialog.component.html',
    styleUrls: ['./plugin-store-dialog.component.scss']
})
export class PluginStoreDialogComponent implements OnInit, OnDestroy {

    installedPlugins = new Set<number>();

    filter = new FormControl();
    subscription = new Subscription();
    pluginTableLoader: PluginTableDataLoader;
    pluginTableRowActions: PluginTableRowAction[] = [
        {
            icon: 'save_alt',
            tooltip: 'Install',
            color: 'primary',
            perform: (plugin: Plugin) => {
                this.pluginService.installPlugin(plugin.id)
                    .subscribe(value => {
                        this.toaster.success(`Plugin ${plugin.name} installed successfully`);
                        this.installedPlugins.add(plugin.id);
                    });
            },
            isVisible: (plugin: Plugin) => !this.installedPlugins.has(plugin.id)
        },
        {
            icon: 'check',
            tooltip: 'Installed',
            color: 'primary',
            perform: (n) => {
            },
            isVisible: (plugin: Plugin) => this.installedPlugins.has(plugin.id)
        },
    ];
    @ViewChild(PluginTableComponent) pluginTable: PluginTableComponent;

    constructor(readonly pluginService: PluginService, readonly toaster: ToastrService,
                readonly dialogRef: MatDialogRef<PluginStoreDialogComponent>) {
        let that = this;

        this.pluginTableLoader = {
            loadData(searchCriteria: SearchCriteria): Observable<Plugin[]> {
                let newCriteria = new SearchCriteria(searchCriteria.lastId, searchCriteria.limit, that.filter.value);
                return pluginService.getInstalledPlugins(newCriteria, true);
            }
        };

        this.subscription.add(
            this.filter.valueChanges
                .pipe(debounceTime(500))
                .subscribe(value => {
                    this.pluginTable.reload();
                }));
    }

    ngOnInit(): void {
    };

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    onClose() {
        this.dialogRef.close();
    }
}
