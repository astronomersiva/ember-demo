import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default class SocketHandlerService extends Service {
  @service('socket-io') socketIOService;

  init() {
    super.init(...arguments);

    this.socket = this.socketIOService.socketFor(`http://${location.hostname}:1313/`);
    this.socket.on('HANDSHAKE_SUCCESS', this.greet, this);
  }

  greet(params) {
    console.log(params);
  }

  willDestroy() {
    this.socket.off('HANDSHAKE_SUCCESS', this.greet);
  }
}
