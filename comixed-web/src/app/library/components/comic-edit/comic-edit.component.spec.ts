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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ComicEditComponent } from './comic-edit.component';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { COMIC_2 } from '@app/library/library.fixtures';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { ConfirmationService } from '@app/core';
import { Confirmation } from '@app/core/models/confirmation';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ComicEditComponent', () => {
  const COMIC = COMIC_2;
  const initialState = {};

  let component: ComicEditComponent;
  let fixture: ComponentFixture<ComicEditComponent>;
  let store: MockStore<any>;
  let confirmationService: ConfirmationService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ComicEditComponent],
      imports: [
        NoopAnimationsModule,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        FormsModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatToolbarModule,
        MatIconModule,
        MatInputModule
      ],
      providers: [provideMockStore({}), ConfirmationService]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicEditComponent);
    component = fixture.componentInstance;
    component.comic = COMIC;
    store = TestBed.inject(MockStore);
    confirmationService = TestBed.inject(ConfirmationService);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('setting the comic', () => {
    beforeEach(() => {
      component.comic = COMIC;
    });

    it('updates the comic reference', () => {
      expect(component.comic).toEqual(COMIC);
    });
  });

  describe('undoing changes', () => {
    beforeEach(() => {
      spyOn(
        confirmationService,
        'confirm'
      ).and.callFake((confirmation: Confirmation) => confirmation.confirm());
      component.onUndoChanges();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });
  });
});
