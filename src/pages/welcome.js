import helpentext from 'raw-loader!./welcome.en.md';
import helpcstext from 'raw-loader!./welcome.cs.md';
import {Converter} from 'showdown';
import {I18N} from 'aurelia-i18n';
import {inject} from 'aurelia-framework';

@inject(I18N)
export  class Welcome {
  constructor(i18n) {
    this.i18n = i18n;
    console.log('Welcome constructor()');
  }
  attached() {
    this.converter = new Converter();
    this.text = (this.i18n.getLocale() === 'cs') ? helpcstext : helpentext;
    this.html = this.converter.makeHtml(this.text);
  }
}
