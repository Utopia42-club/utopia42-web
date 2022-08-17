import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Plugin, PluginState } from '../Plugin';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { SearchCriteria } from '../SearchCriteria';
import { Observable } from 'rxjs';
import { Web3Service } from '../../../ehtereum/web3.service';
import { PluginService } from '../plugin.service';
import { LoadingService } from '../../../loading/loading.service';
import { Configurations } from '../../../configurations';

export class CustomMatPaginatorIntl extends MatPaginatorIntl {
    getRangeLabel = (page: number, pageSize: number, length: number) => {
        return `Page ${page + 1}`;
    };
}

@Component({
    selector: 'app-plugin-table',
    templateUrl: './plugin-table.component.html',
    styleUrls: ['./plugin-table.component.scss'],
    animations: [
        trigger('detailExpand', [
            state('collapsed', style({ height: '0px', minHeight: '0' })),
            state('expanded', style({ height: '*' })),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
    ],
    providers: [{ provide: MatPaginatorIntl, useClass: CustomMatPaginatorIntl }]
})
export class PluginTableComponent implements OnInit, AfterViewInit {

    plugins: Plugin[] = [];
    allPlugins: Plugin[] = [];
    displayedColumns: string[] = ['id', 'name', 'description', 'actions'];
    expandedRow: any;

    @ViewChild(MatPaginator) paginator: MatPaginator;

    @Input() loader: PluginTableDataLoader;
    @Input() rowActions: PluginTableRowAction[];
    @Output() loadError = new EventEmitter<any>();

    pluginState = PluginState;

    constructor(readonly pluginService: PluginService, readonly loadingService: LoadingService, readonly web3Service: Web3Service) {
    }

    ngOnInit(): void {
    }

    ngAfterViewInit(): void {
        this.paginator.page
            .subscribe(() => this.load());
        this.load();
    }

    reload(): void {
        this.allPlugins = [];
        this.plugins = [];
        this.paginator.pageIndex = 0;
        this.load();
    }

    load(): void {
        let pageIndex = this.paginator.pageIndex;
        let pageSize = this.paginator.pageSize;
        let start = pageIndex * pageSize;
        let end = (pageIndex + 1) * pageSize;

        if (this.allPlugins.length > end) {
            this.plugins = this.allPlugins.slice(start, end);
            return;
        } else {
            let lastId = this.allPlugins.length > 0 ? this.allPlugins[this.allPlugins.length - 1].id : null;
            let limit = end + 1 - this.allPlugins.length;

            this.loadingService.prepare(
                this.loader.loadData(new SearchCriteria(lastId, limit, null))
            ).subscribe(data => {
                this.allPlugins.push(...data);
                this.plugins = this.allPlugins.slice(start, Math.min(end, this.allPlugins.length));
                this.updatePaginatorLength();
            }, error => {
                this.loadError.emit(error);
                throw error;
            });
        }
    }

    private updatePaginatorLength() {
        let pageSize = this.paginator.pageSize;
        let end = (this.paginator.pageIndex + 1) * pageSize;
        let hasNext = this.allPlugins.length > end;
        if (!hasNext) {
            this.paginator.length = this.allPlugins.length;
        } else {
            this.paginator.length = this.allPlugins.length + pageSize;
        }
    }

    removeFromTable(plugin: Plugin) {
        this.allPlugins = this.allPlugins.filter(p => p.id !== plugin.id);
        this.load();
    }

    isPluginVerified(plugin: Plugin): boolean {
        return plugin.scriptUrl.trim().startsWith(Configurations.Instance.pluginsRepoPrefix);
    }
}

export interface PluginTableDataLoader {
    loadData(searchCriteria: SearchCriteria): Observable<Plugin[]>;
}

export interface PluginTableRowAction {
    icon: string;
    tooltip: string;
    color?: 'primary' | 'accent' | 'warn';
    perform: (plugin: Plugin) => void;
    isVisible: (plugin: Plugin) => boolean;
}
