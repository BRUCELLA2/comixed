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

package org.comixedproject.model.library;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import javax.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.views.View;

/**
 * <code>ReadingList</code> represents a reading list of comics.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "reading_lists")
public class ReadingList {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @JsonProperty("id")
  @JsonView({View.ComicListView.class, View.ReadingList.class, View.LibraryUpdate.class})
  @Getter
  private Long id;

  @Column(name = "name", length = 128)
  @JsonProperty("name")
  @JsonView({View.ComicListView.class, View.ReadingList.class, View.LibraryUpdate.class})
  @Getter
  @Setter
  private String name;

  @Column(name = "summary", length = 256, nullable = true)
  @JsonProperty("summary")
  @JsonView({View.ComicListView.class, View.ReadingList.class, View.LibraryUpdate.class})
  @Getter
  @Setter
  private String summary;

  @JsonProperty("owner")
  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "owner_id")
  @JsonView({View.ComicListView.class, View.ReadingList.class})
  @Getter
  @Setter
  private ComiXedUser owner;

  @Column(name = "last_updated")
  @JsonProperty("lastUpdated")
  @JsonView({View.ComicListView.class, View.ReadingList.class})
  @JsonFormat(shape = JsonFormat.Shape.NUMBER)
  @Getter
  @Setter
  private Date lastUpdated = new Date();

  @ManyToMany
  @JoinTable(
      name = "reading_list_entries",
      joinColumns = {@JoinColumn(name = "reading_list_id")},
      inverseJoinColumns = {@JoinColumn(name = "comic_id")})
  @Getter
  private List<Comic> comics = new ArrayList<>();

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    ReadingList that = (ReadingList) o;
    return Objects.equals(id, that.id)
        && Objects.equals(name, that.name)
        && Objects.equals(summary, that.summary)
        && Objects.equals(owner, that.owner)
        && Objects.equals(lastUpdated, that.lastUpdated);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, name, summary, owner, lastUpdated);
  }
}
