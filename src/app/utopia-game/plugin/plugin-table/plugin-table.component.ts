import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Plugin } from '../Plugin';
import { MatPaginator, MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { SearchCriteria } from '../SearchCriteria';
import { Observable } from 'rxjs';
import { Web3Service } from '../../../ehtereum/web3.service';
import { PluginService } from '../plugin.service';
import { LoadingService } from '../../../loading/loading.service';

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
    displayedColumns: string[] = ['id', 'name', 'description', 'actions'];
    expandedRow: any;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    private firstId = [];

    @Input() loader: PluginTableDataLoader;
    @Input() rowActions: PluginTableRowAction[];
    @Output() loadError = new EventEmitter<any>();

    constructor(readonly pluginService: PluginService, readonly loadingService: LoadingService, readonly web3Service: Web3Service) {
    }

    ngOnInit(): void {
    }

    ngAfterViewInit(): void {
        this.paginator.page
            .subscribe((pageEvent: PageEvent) => this.load(pageEvent.previousPageIndex < pageEvent.pageIndex));
        this.load(true);
    }

    reload(): void {
        this.firstId = [];
        this.paginator.pageIndex = 0;
        this.load(true);
    }

    load(nextPage: boolean): void {
        let nextId: number;
        if (!nextPage) {
            nextId = this.firstId.pop() - this.paginator.pageSize - 1;
        } else {
            if (this.plugins.length > 0) {
                nextId = this.firstId[this.firstId.length - 1] + this.paginator.pageSize - 1;
            } else {
                nextId = null;
            }
        }
        this.loadingService
            .prepare(this.loader.loadData(
                new SearchCriteria(nextId || null, this.paginator.pageSize + 1, null)))
            .subscribe(data => {
                if (data.length < (this.paginator.pageSize + 1)) {
                    this.paginator.length = this.paginator.pageIndex * this.paginator.pageSize + data.length;
                } else {
                    this.paginator.length = (this.paginator.pageIndex + 1) * this.paginator.pageSize + data.length;
                }
                if (data.length > 0) {
                    this.firstId.push(data[0].id);
                }
                this.plugins = data.slice(0, Math.min(data.length, this.paginator.pageSize));
            }, error => {
                this.loadError.emit(error);
                throw error;
            });
    }

    addToTable(plugin: Plugin) {
        this.plugins.pop();
        this.plugins = [plugin, ...this.plugins];
    }

    removeFromTable(plugin: Plugin) {
        this.plugins = this.plugins.filter(p => p.id !== plugin.id);
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
