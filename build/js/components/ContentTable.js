/* eslint-disable class-methods-use-this */
import View from './../lib/View.js';

export default class ContentTable extends View {
  constructor(el, store) {
    super(el, store);

    this._prepareRender();
  }

  render() {
    let html = `
      <div class="Content-table">
        <div class="Content-table-Row Content-table-Head">
          <div class="Content-table-Col">Name</div>
          <div class="Content-table-Col">Last commit</div>
          <div class="Content-table-Col">Commit message</div>
          <div class="Content-table-Col">Committer</div>
          <div class="Content-table-Col Content-table-Col_last">Updates</div>
        </div>`;

    if (this._store._state) {
      html += `
        ${this._store._state.files.map (file => `
          <div class="Content-table-Row">
            <div class="Content-table-Col Content-table-Col_name Icon-plus">
              <div class="Icon-plus-Icon"> 
                <svg class="Icon Icon_folder">
                  <use xlink:href="images/icons-sprite.svg#folder"></use>
                </svg>
              </div>
              <div class="Icon-plus-Text">${file.name ? file.name : ''}</div>
            </div>
            <div class="Content-table-Col Content-table-Col_commit"><span class="Link Link_color_accent">${file.lastCommit ? file.lastCommit : ''}</span></div>
            <div class="Content-table-Col Content-table-Col_message">${file.message ? file.message : ''}</div>
            <div class="Content-table-Col Content-table-Col_committer"> <span class="Link Link_user">${file.committer ? file.committer : ''}</span></div>
            <div class="Content-table-Col Content-table-Col_updated Content-table-Col_last">${file.commitDate ? file.commitDate : ''}</div>
          </div>
      `).join('')}`;
    }

    html += '</div>';

    return html;
  }
}