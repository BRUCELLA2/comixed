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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { Action } from '@ngrx/store';
import { Comic } from '../../comics/models/comic';
import { LastReadDate } from 'app/library/models/last-read-date';
import { ReadingList } from 'app/comics/models/reading-list';

export enum LibraryActionTypes {
  Reset = '[LIBRARY] Reset the library',
  GetUpdates = '[LIBRARY] Get updates to the library',
  UpdatesReceived = '[LIBRARY] Library updates received',
  GetUpdatesFailed = '[LIBRARY] Failed to get updates',
  StartRescan = '[LIBRARY] Start rescanning the library',
  RescanStarted = '[LIBRARY] Library rescanning started',
  RescanFailedToStart = '[LIBRARY] Failed to start scanning library',
  DeleteMultipleComics = '[LIBRARY] Delete multiple comics',
  MultipleComicsDeleted = '[LIBRARY] Multiple comics deleted',
  DeleteMultipleComicsFailed = '[LIBRARY] Failed to delete multiple comics',
  ConvertComics = '[LIBRARY] Convert comics to a new archive type',
  ComicsConverting = '[LIBRARY] Comics converting to a new archive type',
  ConvertComicsFailed = '[LIBRARY] Failed to convert comics',
  MoveComics = '[LIBRARY] Move the library',
  ComicsMoved = '[LIBRARY] Library was moved',
  MoveComicsFailed = '[LIBRARY] Moving the library failed',
  ClearImageCache = '[LIBRARY] Clear the image cache',
  ImageCacheCleared = '[LIBRARY] Image cache cleared',
  ClearImageCacheFailed = '[LIBRARY] Failed to clear the image cache'
}

export class LibraryReset implements Action {
  readonly type = LibraryActionTypes.Reset;

  constructor() {}
}

export class LibraryGetUpdates implements Action {
  readonly type = LibraryActionTypes.GetUpdates;

  constructor(
    public payload: {
      lastUpdateDate: Date;
      timeout: number;
      maximumComics: number;
      processingCount: number;
      lastComicId: number;
    }
  ) {}
}

export class LibraryUpdatesReceived implements Action {
  readonly type = LibraryActionTypes.UpdatesReceived;

  constructor(
    public payload: {
      comics: Comic[];
      lastComicId: number;
      mostRecentUpdate: Date;
      moreUpdates: boolean;
      lastReadDates: LastReadDate[];
      processingCount: number;
      readingLists: ReadingList[];
    }
  ) {}
}

export class LibraryGetUpdatesFailed implements Action {
  readonly type = LibraryActionTypes.GetUpdatesFailed;

  constructor() {}
}

export class LibraryStartRescan implements Action {
  readonly type = LibraryActionTypes.StartRescan;

  constructor() {}
}

export class LibraryRescanStarted implements Action {
  readonly type = LibraryActionTypes.RescanStarted;

  constructor(public payload: { count: number }) {}
}

export class LibraryStartRescanFailed implements Action {
  readonly type = LibraryActionTypes.RescanFailedToStart;

  constructor() {}
}

export class LibraryDeleteMultipleComics implements Action {
  readonly type = LibraryActionTypes.DeleteMultipleComics;

  constructor(public payload: { ids: number[] }) {}
}

export class LibraryMultipleComicsDeleted implements Action {
  readonly type = LibraryActionTypes.MultipleComicsDeleted;

  constructor(public payload: { count: number }) {}
}

export class LibraryDeleteMultipleComicsFailed implements Action {
  readonly type = LibraryActionTypes.DeleteMultipleComicsFailed;

  constructor() {}
}

export class LibraryConvertComics implements Action {
  readonly type = LibraryActionTypes.ConvertComics;

  constructor(
    public payload: {
      comics: Comic[];
      archiveType: string;
      renamePages: boolean;
    }
  ) {}
}

export class LibraryComicsConverting implements Action {
  readonly type = LibraryActionTypes.ComicsConverting;

  constructor() {}
}

export class LibraryConvertComicsFailed implements Action {
  readonly type = LibraryActionTypes.ConvertComicsFailed;

  constructor() {}
}

export class LibraryMoveComics implements Action {
  readonly type = LibraryActionTypes.MoveComics;

  constructor(
    public payload: {
      deletePhysicalFiles: boolean;
      directory: string;
      renamingRule: string;
    }
  ) {}
}

export class LibraryComicsMoved implements Action {
  readonly type = LibraryActionTypes.ComicsMoved;

  constructor() {}
}

export class LibraryMoveComicsFailed implements Action {
  readonly type = LibraryActionTypes.MoveComicsFailed;

  constructor() {}
}

export class LibraryClearImageCache implements Action {
  readonly type = LibraryActionTypes.ClearImageCache;

  constructor() {}
}

export class LibraryImageCacheCleared implements Action {
  readonly type = LibraryActionTypes.ImageCacheCleared;

  constructor() {}
}

export class LibraryClearImageCacheFailed implements Action {
  readonly type = LibraryActionTypes.ClearImageCacheFailed;

  constructor() {}
}

export type LibraryActions =
  | LibraryReset
  | LibraryGetUpdates
  | LibraryUpdatesReceived
  | LibraryGetUpdatesFailed
  | LibraryStartRescan
  | LibraryRescanStarted
  | LibraryStartRescanFailed
  | LibraryDeleteMultipleComics
  | LibraryMultipleComicsDeleted
  | LibraryDeleteMultipleComicsFailed
  | LibraryConvertComics
  | LibraryComicsConverting
  | LibraryConvertComicsFailed
  | LibraryMoveComics
  | LibraryComicsMoved
  | LibraryMoveComicsFailed
  | LibraryClearImageCache
  | LibraryImageCacheCleared
  | LibraryClearImageCacheFailed;
