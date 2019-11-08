import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ApplicationController extends Controller {
  @service socketHandler;
  queryParams = [
    'siva'
  ];

  init() {
    super.init(...arguments);

    this.socketHandler.socket.emit('HANDSHAKE', 'hello');
  }
}
