import View from './../lib/View.js';

export default class ContentTable extends View {
  constructor(el, store) {
    super(el, store);

    this._prepareRender();
  }

  render() {
    return `
      <div class="Content-table">
        <div class="Content-table-Row Content-table-Head">
          <div class="Content-table-Col">Name</div>
          <div class="Content-table-Col">Last commit</div>
          <div class="Content-table-Col">Commit message</div>
          <div class="Content-table-Col">Committer</div>
          <div class="Content-table-Col Content-table-Col_last">Updates</div>
        </div>
        <div class="Content-table-Row">
          <div class="Content-table-Col Content-table-Col_name Icon-plus">
            <div class="Icon-plus-Icon"> 
              <svg class="Icon Icon_folder">
                <use xlink:href="images/icons-sprite.svg#folder"></use>
              </svg>
            </div>
            <div class="Icon-plus-Text">api</div>
          </div>
          <div class="Content-table-Col Content-table-Col_commit"><span class="Link Link_color_accent">d53dsv</span></div>
          <div class="Content-table-Col Content-table-Col_message">[vcs] move http to arc</div>
          <div class="Content-table-Col Content-table-Col_committer"> <span class="Link Link_user">noxoomo</span></div>
          <div class="Content-table-Col Content-table-Col_updated Content-table-Col_last">4 s ago</div>
        </div>
      </div>
    `;
  }
}