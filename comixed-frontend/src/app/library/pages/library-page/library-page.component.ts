/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  LibraryAdaptor,
  LibraryModuleState,
  ReadingListAdaptor,
  SelectionAdaptor
} from 'app/library';
import { UserService } from 'app/services/user.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationAdaptor, User } from 'app/user';
import { Title } from '@angular/platform-browser';
import { Comic } from 'app/comics';
import { filter } from 'rxjs/operators';
import { CollectionType } from 'app/library/models/collection-type.enum';
import { LoggerService } from '@angular-ru/logger';
import { ComicCollectionEntry } from 'app/library/models/comic-collection-entry';
import { ContextMenuAdaptor } from 'app/user-experience/adaptors/context-menu.adaptor';
import { REMOVE_READING_LIST_ITEMS } from 'app/library/library.constants';
import { Store } from '@ngrx/store';
import { setBreadcrumbs } from 'app/actions/breadcrumb.actions';
import { BreadcrumbEntry } from 'app/models/ui/breadcrumb-entry';

@Component({
  selector: 'app-library-page',
  templateUrl: './library-page.component.html',
  styleUrls: ['./library-page.component.scss']
})
export class LibraryPageComponent implements OnInit, OnDestroy {
  authSubscription: Subscription;
  user: User;
  comicsSubscription: Subscription;
  comics: Comic[] = [];
  selectedComicsSubscription: Subscription;
  selectedComics: Comic[] = [];
  processingCount = 0;
  importCountSubscription: Subscription;
  langChangeSubscription: Subscription;
  paramsSubscription: Subscription;
  collectionType: CollectionType;
  collectionName: string;
  breadcrumbEntryParent: BreadcrumbEntry;
  breadcrumbEntryChild: BreadcrumbEntry;

  title: string;

  constructor(
    private logger: LoggerService,
    private store: Store<LibraryModuleState>,
    private titleService: Title,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authenticationAdaptor: AuthenticationAdaptor,
    private libraryAdaptor: LibraryAdaptor,
    private selectionAdaptor: SelectionAdaptor,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService,
    private messageService: MessageService,
    private contextMenuAdaptor: ContextMenuAdaptor,
    private readingListAdaptor: ReadingListAdaptor
  ) {
    this.addContextMenuItems();
    this.authSubscription = this.authenticationAdaptor.user$.subscribe(
      user => (this.user = user)
    );
    this.selectedComicsSubscription = this.selectionAdaptor.comicSelection$.subscribe(
      selected_comics => {
        this.selectedComics = selected_comics;
        this.updateContextMenu();
      }
    );
    this.importCountSubscription = this.libraryAdaptor.processingCount$.subscribe(
      processing => (this.processingCount = processing)
    );
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.loadTranslations();
    this.paramsSubscription = this.activatedRoute.params.subscribe(params => {
      if (!!this.comicsSubscription) {
        this.comicsSubscription.unsubscribe();
      }
      this.collectionType = params['type'];
      this.collectionName = params['name'];
      if (!!this.collectionType && !!this.collectionName) {
        this.logger.debug(
          'preparing to display collection entries:',
          this.collectionType,
          this.collectionName
        );
        let comicSource = null;
        let titleKey = null;
        this.breadcrumbEntryParent = {
          label: this.collectionName
        } as BreadcrumbEntry;
        this.breadcrumbEntryChild = {
          label: this.translateService.instant(
            `breadcrumb.collections.${this.collectionType}`
          )
        } as BreadcrumbEntry;

        switch (this.collectionType) {
          case CollectionType.PUBLISHERS:
            comicSource = this.libraryAdaptor.publishers$;
            titleKey = 'publishers';
            break;
          case CollectionType.SERIES:
            comicSource = this.libraryAdaptor.series$;
            titleKey = 'series';
            break;
          case CollectionType.CHARACTERS:
            comicSource = this.libraryAdaptor.characters$;
            titleKey = 'characters';
            break;
          case CollectionType.TEAMS:
            comicSource = this.libraryAdaptor.teams$;
            titleKey = 'teams';
            break;
          case CollectionType.LOCATIONS:
            comicSource = this.libraryAdaptor.locations$;
            titleKey = 'locations';
            break;
          case CollectionType.STORIES:
            comicSource = this.libraryAdaptor.stories$;
            titleKey = 'stories';
            break;
          case CollectionType.READING_LISTS:
            comicSource = this.libraryAdaptor.readingLists$;
            titleKey = 'reading-list';
            break;
          default:
            this.logger.error('no such collection type:', this.collectionType);
            titleKey = '';
        }
        this.addContextMenuItems();

        this.titleService.setTitle(
          this.translateService.instant(`library-page.title.${titleKey}`, {
            name: this.collectionName
          })
        );
        if (!!comicSource) {
          this.comicsSubscription = comicSource
            .pipe(
              filter(
                (collection: ComicCollectionEntry[]) =>
                  !!collection &&
                  collection.some(entry => entry.name === this.collectionName)
              )
            )
            .subscribe(collection => {
              console.log('found collection:', collection);
              this.comics = collection.find(
                entry => entry.name === this.collectionName
              ).comics;
            });
          this.loadTranslations();
        } else {
          this.messageService.add({
            severity: 'error',
            detail: this.translateService.instant(
              'library-page.error.no-such-type',
              { type: params['type'] }
            )
          });
        }
      } else {
        this.collectionType = null;
        this.collectionName = null;
        this.comicsSubscription = this.libraryAdaptor.comic$.subscribe(
          comics => {
            this.comics = comics;
            this.titleService.setTitle(
              this.translateService.instant('library-page.title.all-comics', {
                count: this.comics.length
              })
            );
          }
        );
      }
    });
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
    this.comicsSubscription.unsubscribe();
    this.selectedComicsSubscription.unsubscribe();
    this.importCountSubscription.unsubscribe();
    this.removeContextMenuItems();
  }

  deleteComic(comic: Comic): void {
    this.confirmationService.confirm({
      header: this.translateService.instant(
        'library.messages.delete-comic-title'
      ),
      message: this.translateService.instant(
        'library.messages.delete-comic-question'
      ),
      icon: 'fa fa-exclamation',
      accept: () => this.libraryAdaptor.deleteComics([comic.id])
    });
  }

  openComic(comic: Comic): void {
    this.router.navigate(['comics', `${comic.id}`]);
  }

  rescanLibrary(): void {
    this.confirmationService.confirm({
      header: this.translateService.instant(
        'library.messages.rescan-library-title'
      ),
      message: this.translateService.instant(
        'library.messages.rescan-library-message'
      ),
      icon: 'fa fa-exclamation',
      accept: () => this.libraryAdaptor.startRescan()
    });
  }

  canRescan(): boolean {
    return this.processingCount === 0;
  }

  private loadTranslations() {
    const entries: BreadcrumbEntry[] = [
      { label: this.translateService.instant('breadcrumb.entry.library-page') }
    ];
    if (!!this.breadcrumbEntryParent) {
      entries.push(this.breadcrumbEntryChild);
      entries.push(this.breadcrumbEntryParent);
    }
    this.store.dispatch(setBreadcrumbs({ entries }));
  }

  private updateContextMenu() {
    if (this.collectionType === CollectionType.READING_LISTS) {
      this.logger.info('this.collectionType:', this.collectionType);
      this.logger.info(
        'showing remove comics from reading list context menu item'
      );
      this.contextMenuAdaptor.showItem(REMOVE_READING_LIST_ITEMS);

      if (this.selectedComics.length > 0) {
        this.logger.info(
          'enabling remove comics from reading list context menu item'
        );
        this.contextMenuAdaptor.enableItem(REMOVE_READING_LIST_ITEMS);
      } else {
        this.logger.info(
          'disabling remove comics from reading list context menu item'
        );
        this.contextMenuAdaptor.disableItem(REMOVE_READING_LIST_ITEMS);
      }
    } else {
      this.logger.info('this.collectionType:', this.collectionType);
      this.logger.info(
        'hiding remove comics from reading list context menu item'
      );
      this.contextMenuAdaptor.hideItem(REMOVE_READING_LIST_ITEMS);
    }
  }

  private removeContextMenuItems() {
    this.logger.info('removing context menu items');
    this.contextMenuAdaptor.removeItem(REMOVE_READING_LIST_ITEMS);
  }

  private addContextMenuItems() {
    this.logger.info('adding context menu items');
    this.contextMenuAdaptor.addItem(
      REMOVE_READING_LIST_ITEMS,
      'fa fa-fw fa-minus',
      'comic-list.context-menu.remove-from-reading-list',
      false,
      true,
      () =>
        this.confirmationService.confirm({
          header: this.translateService.instant(
            'library-page.remove-comics-from-reading-list.header',
            { name: this.collectionName }
          ),
          message: this.translateService.instant(
            'library-page.remove-comics-from-reading-list.message',
            { count: this.selectedComics.length }
          ),
          accept: () =>
            this.readingListAdaptor.removeComics(
              this.libraryAdaptor.findReadingList(this.collectionName),
              this.selectedComics
            )
        })
    );
  }
}
