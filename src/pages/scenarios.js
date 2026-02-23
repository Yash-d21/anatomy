//import {Converter} from 'showdown';
import * as marked from 'marked';
import { I18N } from 'aurelia-i18n';
import { inject } from 'aurelia-framework';
import { HttpClient } from 'aurelia-fetch-client';
import { Virtualbodyapi } from '../components/virtualbodyapi';

// https://raw.githubusercontent.com/wiki/creative-connections/Bodylight-Scenarios/
@inject(I18N, HttpClient, Virtualbodyapi)

export class Scenarios {
  constructor(i18n, client, api) {
    this.i18n = i18n;
    this.httpclient = client;
    this.api = api;

    this.scenariourl = this.api.scenariourlprefix + 'Home.cs.md';
    //this.navigationurl = this.api.scenariourlprefix + 'SUMMARY.cs.md';
    //this.marked = import 'marked';
    this.navigation = null;
    this.prevurl = this.nexturl = "";
    this.translations = {
      'GasExchange.en': `
# Blood Gas Exchange
This chapter is an introduction to the study of physiology and pathophysiology of blood gas exchange. We want to introduce you to oxygen consumers and carbon dioxide sources in the human organism, as well as the function of a remarkably powerful molecular machine for the production of universal energy carriers in cells: ATP synthase.
![o2co2](https://raw.githubusercontent.com/wiki/creative-connections/Bodylight-Scenarios/images/o2co2.PNG)
[Oxygen Dissociation Curve](disociacni_krivka_kysliku.en)
Authors: Tomáš Kulhánek, Jiří Kofránek`,
      'GasExchange.cs': `
# Blood Gas Exchange
This chapter is an introduction to the study of physiology and pathophysiology of blood gas exchange. We want to introduce you to oxygen consumers and carbon dioxide sources in the human organism, as well as the function of a remarkably powerful molecular machine for the production of universal energy carriers in cells: ATP synthase.
![o2co2](https://raw.githubusercontent.com/wiki/creative-connections/Bodylight-Scenarios/images/o2co2.PNG)
[Oxygen Dissociation Curve](disociacni_krivka_kysliku.en)
Authors: Tomáš Kulhánek, Jiří Kofránek`,
      'Hemodynamics.en': `
# Hemodynamics of the Cardiovascular System
This chapter introduces the physiology of the pulsating cardiovascular system and the pathophysiology of selected conditions.
## Cardiac Revolutions
**Cardiac Revolution** or the **Cardiac Cycle** is the work of the human heart during one heartbeat. It consists of two basic phases:
1. **Diastole**: The heart muscle relaxes and fills with blood.
2. **Systole**: The heart muscle contracts and pumps blood out.
The cycle then repeats periodically.
## Phases of the Cardiac Cycle:
* Atrioventricular diastole - blood fills the atria and ventricles.
* Atrial systole - atrium pushes blood into the ventricle (about 20%).
* Ventricular systole - first ventricular contraction and first heart sound.
* Ventricular ejection.
* Ventricular relaxation - second heart sound.`,
      'Hemodynamics.cs': `
# Hemodynamics of the Cardiovascular System
This chapter introduces the physiology of the pulsating cardiovascular system and the pathophysiology of selected conditions.
## Cardiac Revolutions
**Cardiac Revolution** or the **Cardiac Cycle** is the work of the human heart during one heartbeat. It consists of two basic phases:
1. **Diastole**: The heart muscle relaxes and fills with blood.
2. **Systole**: The heart muscle contracts and pumps blood out.
The cycle then repeats periodically.
## Phases of the Cardiac Cycle:
* Atrioventricular diastole - blood fills the atria and ventricles.
* Atrial systole - atrium pushes blood into the ventricle (about 20%).
* Ventricular systole - first ventricular contraction and first heart sound.
* Ventricular ejection.
* Ventricular relaxation - second heart sound.`,
      'FeMetabolism.en': `
# Iron Metabolism
This chapter introduces the physiology of iron metabolism in the body and the pathophysiology of selected clinical states.`,
      'FeMetabolism.cs': `
# Iron Metabolism
This chapter introduces the physiology of iron metabolism in the body and the pathophysiology of selected clinical states.`,
      'KidneyFunction.en': `
# Kidney Function
This chapter introduces the physiology of renal function, its influence on acid-base balance, and the pathophysiology of selected renal conditions.`,
      'KidneyFunction.cs': `
# Kidney Function
This chapter introduces the physiology of renal function, its influence on acid-base balance, and the pathophysiology of selected renal conditions.`,
      'Home.en.md': `
# Topics of Virtual Patient Simulator
* [Blood Gas Exchange](GasExchange.en)
* [Hemodynamics](Hemodynamics.en)
* [Iron Metabolism](FeMetabolism.en)
* [Kidney Function](KidneyFunction.en)`,
      'disociacni_krivka_kysliku.en': '# Oxygen Dissociation Curve',
      'disociacni_krivka_kysliku': '# Oxygen Dissociation Curve'
    };
    console.log('Scenarios constructor()');
  }

  activate(params, routeConfig, navigationInstruction) {
    //parses params in url
    if (params.target) {
      console.log('loading:', params.target);
      this.scenariourl = this.api.scenariourlprefix + params.target + '.md';//TODO file suffix may change
      this.currenttitle = params.target;
    } else { //if no params - default home per locale is loaded
      this.currenttitle = ((this.i18n.getLocale() === 'cs') ? 'Home.cs.md' : 'Home.en.md');
      this.scenariourl = this.api.scenariourlprefix + this.currenttitle;
    }
    console.log('loading from url:', this.scenariourl);
    this.httpclient.fetch(this.scenariourl)
      .then(response => {
        if (response.status !== 200 && this.scenariourl.endsWith('.en.md')) {
          // Fallback for missing English scenarios
          return this.httpclient.fetch(this.scenariourl.replace('.en.md', '.cs.md'));
        }
        return response;
      })
      .then(response => response.text())
      .then(text => {
        // Translation Fallback: If we are in English or if the content is Czech, use our internal translation if available
        if (this.translations[this.currenttitle]) {
          text = this.translations[this.currenttitle];
        } else if (this.translations[this.currenttitle + '.en']) {
          text = this.translations[this.currenttitle + '.en'];
        }

        if (params.target === undefined || params.target === null || params.target === "") {
          this.navigation = text;
          text += "\n\n### Other Tools\n* <a href='#/tumor-growth'>Tumor Growth Projection</a>";
        } //default home = navigation
        this.generateNavigation();

        this.html = marked(text, { baseUrl: '#/scenarios/', baseImgUrl: this.api.scenariourlprefix });
      })
      .catch(error => {
        console.log('error', error);
      });
  }

  attached() {

  }
  generateNavigation() {
    if (this.navigation) {
      //find currenttitle in text, previous link is preurl next link is nexturl
      if (!this.links) {
        this.links = [];
        const regex = /\[.*?\]\((.*?)\)/g;
        let match;
        while ((match = regex.exec(this.navigation)) !== null) {
          this.links.push(match[1]);
        }
      }
      let i = this.links.indexOf(this.currenttitle)
      if (i === 0 || i === -1) { this.prevurl = ''; this.nexturl = this.links[1]; } //homepage returns -1, thus next should be 1,
      else {
        if (i > 0) this.prevurl = this.links[i - 1];
        if (i < this.links.length) this.nexturl = this.links[i + 1];
      }
      console.log('generateNavigation links,i,prevurl nexturl', this.links, i, this.prevurl, this.nexturl);
    }
  }
}

