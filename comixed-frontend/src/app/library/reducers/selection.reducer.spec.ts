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

import {
  initialState,
  reducer,
  SelectionState
} from 'app/library/reducers/selection.reducer';
import * as SelectionActions from 'app/library/actions/selection.actions';
import {
  COMIC_1,
  COMIC_2,
  COMIC_3,
  COMIC_4,
  COMIC_5
} from 'app/comics/comics.fixtures';

describe('Selection Reducer', () => {
  let state: SelectionState;

  beforeEach(() => {
    state = reducer(initialState, {} as any);
  });

  describe('the initial state', () => {
    it('has an empty set of comics', () => {
      expect(state.comics).toEqual([]);
    });
  });

  describe('when adding a comic to the selection', () => {
    it('adds a comic if it is not selected', () => {
      state = reducer(
        { ...state, comics: [COMIC_1] },
        new SelectionActions.SelectAddComic({ comic: COMIC_2 })
      );
      expect(state.comics).toEqual([COMIC_1, COMIC_2]);
    });

    it('does not add a comic if it is already selected', () => {
      state = reducer(
        { ...state, comics: [COMIC_1] },
        new SelectionActions.SelectAddComic({ comic: COMIC_1 })
      );
      expect(state.comics).toEqual([COMIC_1]);
    });
  });

  describe('when adding comics in bulk', () => {
    it('adds all unselected comics', () => {
      state = reducer(
        { ...state, comics: [] },
        new SelectionActions.SelectBulkAddComics({
          comics: [COMIC_1, COMIC_3, COMIC_5]
        })
      );
      expect(state.comics).toEqual([COMIC_1, COMIC_3, COMIC_5]);
    });

    it('does not re-add comics already selected', () => {
      state = reducer(
        { ...state, comics: [COMIC_1, COMIC_3, COMIC_5] },
        new SelectionActions.SelectBulkAddComics({
          comics: [COMIC_1, COMIC_2, COMIC_3]
        })
      );
      expect([...state.comics].sort((c1, c2) => c1.id - c2.id)).toEqual(
        [COMIC_1, COMIC_3, COMIC_5, COMIC_2].sort((c1, c2) => c1.id - c2.id)
      );
    });
  });

  describe('when removing a comic', () => {
    it('removes the comic if it was selected', () => {
      state = reducer(
        { ...state, comics: [COMIC_1] },
        new SelectionActions.SelectRemoveComic({ comic: COMIC_1 })
      );
      expect(state.comics).toEqual([]);
    });

    it('does not remove the comic if it is not selected', () => {
      state = reducer(
        { ...state, comics: [COMIC_1] },
        new SelectionActions.SelectRemoveComic({ comic: COMIC_2 })
      );
      expect(state.comics).toEqual([COMIC_1]);
    });
  });

  describe('when bulk removing comics', () => {
    it('removes the comics from the set', () => {
      state = reducer(
        { ...state, comics: [COMIC_1, COMIC_3, COMIC_5] },
        new SelectionActions.SelectBulkRemoveComics({
          comics: [COMIC_1, COMIC_5]
        })
      );
      expect(state.comics).toEqual([COMIC_3]);
    });
  });

  describe('when removing all selections', () => {
    it('clears the selection set', () => {
      state = reducer(
        { ...state, comics: [COMIC_1, COMIC_2, COMIC_3, COMIC_4, COMIC_5] },
        new SelectionActions.SelectRemoveAllComics()
      );
      expect(state.comics).toEqual([]);
    });
  });
});
