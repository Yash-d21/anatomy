import { PLATFORM } from 'aurelia-pal';

export class App {
  constructor() {
    this.style = 'position: absolute; left: 75%; top: 0%; width: 24%; height: 95%;';
    this.deg = 0;
    this.rotatestyle = '';
    this.isLanding = true;
    this.showSimulation = false;
  }

  minimise() {
    this.style = 'position: absolute; left: 75%; top: 0%; width: 24%; height: 7%;overflow:hidden;';
  }

  normalise() {
    this.style = 'position: absolute; left: 75%; top: 0%; width: 24%; height: 95%;';
  }
  maximise() {
    this.style = 'position: absolute; left: 50%; top: 0%; width: 49%; height: 95%;';
  }

  rotate() {
    this.deg = this.deg + 45; if (this.deg >= 360) this.deg = 0;

    this.rotatestyle = 'transform:rotate(' + this.deg + 'deg);';
  }

  configureRouter(config, router) {
    config.title = 'TARS - Medical Simulation';
    config.map([
      {
        route: ['', 'landing'],
        name: 'landing',
        moduleId: PLATFORM.moduleName('./pages/landing'),
        nav: false,
        title: 'TARS Platform'
      },
      {
        route: 'welcome',
        name: 'welcome',
        moduleId: PLATFORM.moduleName('./pages/welcome'),
        nav: true,
        title: 'Dashboard',
        settings: { icon: 'fa fa-home' }
      },
      {
        route: ['scenarios', 'scenarios/*target'],
        name: 'scenarios',
        moduleId: PLATFORM.moduleName('./pages/scenarios'),
        nav: true,
        title: 'Topics and Scenarios',
        settings: { icon: 'fa fa-male', icon2: 'fa fa-list-ol' }
      },
      /*{
        route: ['scenarios', 'scenarios/*target'],
        name: 'scenarios',
        moduleId: PLATFORM.moduleName('./pages/scenarios'),
        nav: true,
        title: 'Scenarios',
        settings: {icon: 'fa fa-male', icon2: 'fa fa-list-ol'}
      },*/
      /*
           {
             route: 'physiomemodel',
             name: 'physiomemodel',
             moduleId: PLATFORM.moduleName('./pages/physiomemodel'),
             nav: true,
             title: 'Physiome Model',
             settings: {icon: 'fa fa-male', icon2: 'fa fa-tasks'}
           },*/
      {
        route: 'tumor-growth',
        name: 'tumor-growth',
        moduleId: PLATFORM.moduleName('./pages/tumor-growth'),
        nav: true,
        title: 'Tumor Growth',
        settings: { icon: 'fa fa-line-chart' }
      },
      {
        route: 'help',
        name: 'help',
        moduleId: PLATFORM.moduleName('./pages/help'),
        nav: true,
        title: 'Help',
        settings: { icon: 'fa fa-question-circle-o' }
      },
      {
        route: 'settings',
        name: 'settings',
        moduleId: PLATFORM.moduleName('./pages/settings'),
        nav: true,
        title: 'Settings',
        settings: { icon: 'fa fa-cog' }
      }
    ]);

    this.router = router;

    const onNavigationSuccess = (event) => {
      this.isLanding = (event.instruction.config.name === 'landing');
      this.showSimulation = (this.isLanding === false);
    };

    router.events.subscribe('router:navigation:success', onNavigationSuccess);
  }
}
