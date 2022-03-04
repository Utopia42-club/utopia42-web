import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { PluginService } from '../plugin.service';
import { LoadingService } from '../../../loading/loading.service';
import { Plugin } from '../Plugin';
import { PluginEditorComponent } from '../plugin-editor/plugin-editor.component';
import { ToastrService } from 'ngx-toastr';
import { PluginExecutionService } from '../plugin-execution.service';
import { UtopiaGameComponent } from '../../utopia-game.component';
import { UtopiaDialogService } from 'src/app/utopia-dialog.service';
import { merge, Observable, Subscription } from 'rxjs';
import { PluginConfirmationDialog } from '../plugin-confirmation-dialog/plugin-confirmation-dialog.component';
import { MatChip } from '@angular/material/chips';
import { FormControl } from '@angular/forms';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { PluginTableComponent, PluginTableDataLoader, PluginTableRowAction } from '../plugin-table/plugin-table.component';
import { SearchCriteria } from '../SearchCriteria';
import { debounceTime } from 'rxjs/operators';
import { Web3Service } from '../../../ehtereum/web3.service';
import { PluginStoreDialogComponent } from '../plugin-store-dialog/plugin-store-dialog.component';

@Component({
    selector: 'app-plugin-selection',
    templateUrl: './plugin-selection.component.html',
    styleUrls: ['./plugin-selection.component.scss'],
    providers: [],
    animations: [
        trigger('detailExpand', [
            state('collapsed', style({ height: '0px', minHeight: '0' })),
            state('expanded', style({ height: '*' })),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
    ],
})
export class PluginSelectionComponent implements OnInit, OnDestroy {

    selectedFilters = new FormControl([]);
    filter = new FormControl();
    subscription = new Subscription();
    pluginTableLoader: PluginTableDataLoader;

    canEdit = (plugin: Plugin) => plugin.walletId == this.web3Service.wallet();

    pluginTableRowActions: PluginTableRowAction[] = [
        {
            icon: 'edit',
            tooltip: 'Edit',
            color: 'accent',
            perform: (plugin: Plugin) => {
                this.editPlugin(plugin);
            },
            isVisible: this.canEdit
        },
        {
            icon: 'delete',
            tooltip: 'Delete',
            color: 'warn',
            perform: (plugin: Plugin) => {
                this.deletePlugin(plugin);
            },
            isVisible: this.canEdit
        },
        {
            icon: 'delete',
            tooltip: 'Uninstall',
            color: 'warn',
            perform: (plugin: Plugin) => {
                this.pluginService.uninstallPlugin(plugin.id)
                    .subscribe(() => {
                        this.toaster.success('Plugin uninstalled successfully');
                        this.pluginTable.removeFromTable(plugin);
                    });
            },
            isVisible: (plugin: Plugin) => plugin.walletId != this.web3Service.wallet()
        },
        {
            icon: 'play_arrow',
            tooltip: 'Run',
            perform: (plugin: Plugin) => {
                this.runPlugin(plugin);
            },
            isVisible: () => true
        },
    ];
    @ViewChild(PluginTableComponent) pluginTable: PluginTableComponent;

    constructor(readonly pluginService: PluginService, readonly loadingService: LoadingService,
                readonly dialog: UtopiaDialogService, readonly toaster: ToastrService,
                readonly pluginExecutionService: PluginExecutionService,
                readonly web3Service: Web3Service,
                readonly game: UtopiaGameComponent, private vcr: ViewContainerRef) {

        let that = this;

        this.pluginTableLoader = {
            loadData(searchCriteria: SearchCriteria): Observable<Plugin[]> {
                let newCriteria = new SearchCriteria(searchCriteria.lastId, searchCriteria.limit, that.filter.value);
                let value = that.selectedFilters.value;
                if (value.length == 2 || value.length == 0) {
                    return pluginService.getPluginsForUser(newCriteria);
                } else if (value[0] == 'owned') {
                    return pluginService.getPluginsOfUser(newCriteria);
                } else if (value[0] == 'installed') {
                    return pluginService.getInstalledPlugins(newCriteria);
                }
            }
        };

        this.subscription.add(
            merge(this.selectedFilters.valueChanges, this.filter.valueChanges)
                .pipe(debounceTime(500))
                .subscribe(value => {
                    this.pluginTable.reload();
                }));
    }

    ngOnInit() {
    }

    createNewPlugin() {
        this.dialog.open(PluginEditorComponent).subscribe(ref => {
            ref.afterClosed().subscribe((plugin) => {
                if (plugin) {
                    let value = this.selectedFilters.value;
                    if (value == null || value.includes('owned') || !value.includes('installed')) {
                        this.pluginTable.reload();
                    }
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
            this.pluginTable.removeFromTable(plugin);
        });
    }

    toggleSelection(event: MouseEvent, chip: MatChip) {
        chip.toggleSelected();
        if (event.ctrlKey) {
            let stats = [...this.selectedFilters.value];
            if (chip.selected) {
                stats.push(chip.value);
            } else {
                stats.splice(stats.indexOf(chip.value, 0), 1);
            }
            this.selectedFilters.setValue(stats);
        } else {
            if (chip.selected) {
                this.selectedFilters.setValue([chip.value]);
            } else {
                this.selectedFilters.setValue(this.selectedFilters.value.filter((v: any) => v != chip.value));
            }
        }
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    openPluginStore() {
        this.dialog.open(PluginStoreDialogComponent, {
            viewContainerRef: this.vcr
        }).subscribe((ref) => {
            ref.afterClosed().subscribe(result => {
                this.pluginTable.reload();
            });
        });
    }
}
