import AbstractRoom from './AbstractRoom';
import formatLog from '../../util/formatLog';

class OutsideWindow extends AbstractRoom {
  constructor() {
    super('outsidewindow');
  }

  description(): void {
    formatLog('Wizard falls, you die.');
  }
}

export default OutsideWindow;
