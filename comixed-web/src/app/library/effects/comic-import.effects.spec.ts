/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { ComicImportEffects } from './comic-import.effects';
import { ComicImportService } from '@app/library/services/comic-import.service';
import { AlertService } from '@app/core';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule } from '@ngx-translate/core';
import {
  COMIC_FILE_1,
  COMIC_FILE_2,
  COMIC_FILE_3,
  COMIC_FILE_4,
  ROOT_DIRECTORY
} from '@app/library/library.fixtures';
import { LoadComicFilesResponse } from '@app/library/models/net/load-comic-files-response';
import {
  comicFilesLoaded,
  comicFilesSent,
  loadComicFiles,
  loadComicFilesFailed,
  sendComicFiles,
  sendComicFilesFailed
} from '@app/library/actions/comic-import.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { saveUserPreference } from '@app/user/actions/user.actions';
import {
  DELETE_BLOCKED_PAGES_PREFERENCE,
  IGNORE_METADATA_PREFERENCE,
  IMPORT_MAXIMUM_RESULTS_PREFERENCE,
  IMPORT_ROOT_DIRECTORY_PREFERENCE
} from '@app/library/library.constants';

describe('ComicImportEffects', () => {
  const FILES = [COMIC_FILE_1, COMIC_FILE_2, COMIC_FILE_3, COMIC_FILE_4];

  let actions$: Observable<any>;
  let effects: ComicImportEffects;
  let comicImportService: jasmine.SpyObj<ComicImportService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        LoggerModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        ComicImportEffects,
        provideMockActions(() => actions$),
        {
          provide: ComicImportService,
          useValue: {
            loadComicFiles: jasmine.createSpy(
              'ComicFileService.loadComicFiles()'
            ),
            sendComicFiles: jasmine.createSpy(
              'ComicFileService.sendComicFiles()'
            )
          }
        }
      ]
    });

    effects = TestBed.inject(ComicImportEffects);
    comicImportService = TestBed.inject(ComicImportService) as jasmine.SpyObj<
      ComicImportService
    >;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading comic files', () => {
    const MAXIMUM_RESULT = 100;

    it('fires an action on success', () => {
      const serviceResponse = { files: FILES } as LoadComicFilesResponse;
      const action = loadComicFiles({
        directory: ROOT_DIRECTORY,
        maximum: MAXIMUM_RESULT
      });
      const outcome1 = comicFilesLoaded({ files: FILES });
      const outcome2 = saveUserPreference({
        name: IMPORT_ROOT_DIRECTORY_PREFERENCE,
        value: ROOT_DIRECTORY
      });
      const outcome3 = saveUserPreference({
        name: IMPORT_MAXIMUM_RESULTS_PREFERENCE,
        value: `${MAXIMUM_RESULT}`
      });

      actions$ = hot('-a', { a: action });
      comicImportService.loadComicFiles.and.returnValue(of(serviceResponse));

      const expected = hot('-(bcd)', { b: outcome1, c: outcome2, d: outcome3 });
      expect(effects.loadComicFiles$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadComicFiles({
        directory: ROOT_DIRECTORY,
        maximum: 100
      });
      const outcome = loadComicFilesFailed();

      actions$ = hot('-a', { a: action });
      comicImportService.loadComicFiles.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.loadComicFiles$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadComicFiles({
        directory: ROOT_DIRECTORY,
        maximum: 100
      });
      const outcome = loadComicFilesFailed();

      actions$ = hot('-a', { a: action });
      comicImportService.loadComicFiles.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadComicFiles$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('sending comic files', () => {
    const IGNORE_METADATA = Math.random() > 0.5;
    const DELETE_BLOCKED_PAGES = Math.random() > 0.5;

    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = sendComicFiles({
        files: FILES,
        ignoreMetadata: IGNORE_METADATA,
        deleteBlockedPages: DELETE_BLOCKED_PAGES
      });
      const outcome1 = comicFilesSent();
      const outcome2 = saveUserPreference({
        name: IGNORE_METADATA_PREFERENCE,
        value: `${IGNORE_METADATA}`
      });
      const outcome3 = saveUserPreference({
        name: DELETE_BLOCKED_PAGES_PREFERENCE,
        value: `${DELETE_BLOCKED_PAGES}`
      });

      actions$ = hot('-a', { a: action });
      comicImportService.sendComicFiles.and.returnValue(of(serviceResponse));

      const expected = hot('-(bcd)', { b: outcome1, c: outcome2, d: outcome3 });
      expect(effects.sendComicFiles$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = sendComicFiles({
        files: FILES,
        ignoreMetadata: false,
        deleteBlockedPages: true
      });
      const outcome = sendComicFilesFailed();

      actions$ = hot('-a', { a: action });
      comicImportService.sendComicFiles.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.sendComicFiles$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = sendComicFiles({
        files: FILES,
        ignoreMetadata: false,
        deleteBlockedPages: true
      });
      const outcome = sendComicFilesFailed();

      actions$ = hot('-a', { a: action });
      comicImportService.sendComicFiles.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.sendComicFiles$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
