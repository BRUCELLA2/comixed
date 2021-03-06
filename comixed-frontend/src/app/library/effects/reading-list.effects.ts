/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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
 * along with this program. If not, see <http:/www.gnu.org/licenses>
 */

import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { ReadingListService } from 'app/library/services/reading-list.service';
import { LoggerService } from '@angular-ru/logger';
import { MessageService } from 'primeng/api';
import { Observable, of } from 'rxjs';

import { catchError, map, switchMap, tap } from 'rxjs/operators';
import {
  ReadingListActions,
  ReadingListActionTypes,
  ReadingListAddComicsFailed,
  ReadingListComicsAdded,
  ReadingListComicsRemoved,
  ReadingListRemoveComicsFailed,
  ReadingListSave,
  ReadingListSaved,
  ReadingListSaveFailed
} from '../actions/reading-list.actions';
import { ReadingList } from 'app/comics/models/reading-list';
import { AddComicsToReadingListResponse } from 'app/library/models/net/add-comics-to-reading-list-response';
import { RemoveComicsFromReadingListResponse } from 'app/library/models/net/remove-comics-from-reading-list-response';

@Injectable()
export class ReadingListEffects {
  constructor(
    private actions$: Actions<ReadingListActions>,
    private readingListService: ReadingListService,
    private translateService: TranslateService,
    private messageService: MessageService,
    private logger: LoggerService
  ) {}

  @Effect()
  save$: Observable<Action> = this.actions$.pipe(
    ofType(ReadingListActionTypes.Save),
    map((action: ReadingListSave) => action.payload),
    switchMap(action =>
      this.readingListService.save(action.id, action.name, action.summary).pipe(
        tap((response: ReadingList) =>
          this.messageService.add({
            severity: 'info',
            detail: this.translateService.instant(
              'reading-list-effects.save.success.detail',
              { name: response.name }
            )
          })
        ),
        map(
          (response: ReadingList) =>
            new ReadingListSaved({ readingList: response })
        ),
        catchError(error => {
          this.logger.error('save reading list service failure:', error);
          this.messageService.add({
            severity: 'error',
            detail: this.translateService.instant(
              'reading-list-effects.save.error.detail'
            )
          });
          return of(new ReadingListSaveFailed());
        })
      )
    ),
    catchError(error => {
      this.logger.error('save reading list general failure:', error);
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new ReadingListSaveFailed());
    })
  );

  @Effect()
  addComics$: Observable<Action> = this.actions$.pipe(
    ofType(ReadingListActionTypes.AddComics),
    tap(action =>
      this.logger.debug('effect: adding comics to reading list:', action)
    ),
    map(action => action.payload),
    switchMap(action =>
      this.readingListService.addComics(action.readingList, action.comics).pipe(
        tap(response =>
          this.logger.debug('received success response:', response)
        ),
        tap((response: AddComicsToReadingListResponse) =>
          this.messageService.add({
            severity: 'info',
            detail: this.translateService.instant(
              'reading-list-effects.add-comics.success.detail',
              { addedCount: response.addCount }
            )
          })
        ),
        map(
          (response: AddComicsToReadingListResponse) =>
            new ReadingListComicsAdded()
        ),
        catchError(error => {
          this.logger.error('service failure adding comics:', error);
          this.messageService.add({
            severity: 'error',
            detail: this.translateService.instant(
              'reading-list-effects.add-comics.error.detail'
            )
          });
          return of(new ReadingListAddComicsFailed());
        })
      )
    ),
    catchError(error => {
      this.logger.error('service failure adding comics:', error);
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new ReadingListAddComicsFailed());
    })
  );

  @Effect()
  removeComics$: Observable<Action> = this.actions$.pipe(
    ofType(ReadingListActionTypes.RemoveComics),
    map(action => action.payload),
    tap(action =>
      this.logger.debug('effect: removing comes from reading list:', action)
    ),
    switchMap(action =>
      this.readingListService
        .removeComics(action.readingList, action.comics)
        .pipe(
          tap(response => this.logger.debug('received response:', response)),
          tap((response: RemoveComicsFromReadingListResponse) =>
            this.messageService.add({
              severity: 'info',
              detail: this.translateService.instant(
                'reading-list-effects.remove-comics.success.detail',
                { removeCount: response.removeCount }
              )
            })
          ),
          map(() => new ReadingListComicsRemoved()),
          catchError(error => {
            this.logger.error(
              'service failure removing comics from a reading list:',
              error
            );
            this.messageService.add({
              severity: 'error',
              detail: this.translateService.instant(
                'reading-list-effects.remove-comics.error.detail'
              )
            });
            return of(new ReadingListRemoveComicsFailed());
          })
        )
    ),
    catchError(error => {
      this.logger.error(
        'service failure removing comics from a reading list:',
        error
      );
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new ReadingListRemoveComicsFailed());
    })
  );
}
