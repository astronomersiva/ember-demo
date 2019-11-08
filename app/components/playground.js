import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { randomFromRange, haveTouched, beep } from '../utils/utils';

const RADIUS = 20;

export default class PlaygroundComponent extends Component {
  width = document.documentElement.clientWidth;
  height = document.documentElement.clientHeight;

  @service socketHandler;

  @action
  initialise(element) {
    let context = element.getContext('2d');
    this.context = context;

    this.rocks = [{
      x: this.width/2,
      y: this.height/2
    }];

    this.ship = {
      x: this.width - 300,
      y: this.height/2
    };

    this.repaintLoop = setInterval(this.repaintRocks.bind(this), 20);
    this.socketHandler.socket.on('ROCK_ADDED', this.addRock, this);
    this.socketHandler.socket.on('ROCK_MOVED', this.moveRock, this);
  }

  @action
  emitRockAdd() {
    this.rockId = Date.now();
    this.socketHandler.socket.emit('ADD_ROCK', this.rockId);
  }

  @action
  emitMoveRock(direction) {
    this.socketHandler.socket.emit('MOVE_ROCK', {direction, id: this.rockId});
  }
  
  @action
  repositionShip(event) {
    this.ship.y = event.clientY;
  }

  @action
  addImage(element, [name]) {
    this[name] = element;
  }

  repaintRocks() {
    let {context, rocks} = this;

    context.clearRect(0, 0, this.width, this.height);

    rocks.forEach(rock => {
      if (rock.inViewport) {
        if (haveTouched(rock, this.ship, RADIUS)) {
          rock.inViewport = false;
          beep();
        }

        context.beginPath();
        // context.arc(rock.x, rock.y, RADIUS, 0, 2*Math.PI);
        // context.stroke();
        context.drawImage(this.meteor, rock.x, rock.y)

        rock.x += 10;
      }
    });

    this.drawShip();
  }

  drawShip() {
    let {context, ship} = this;
    context.beginPath();
    // context.arc(ship.x, ship.y, RADIUS, 0, 2*Math.PI);
    // context.stroke();
    context.drawImage(this.player, ship.x, ship.y)
  }

  addRock(rockId) {
    this.rocks.push({
      x: 200,
      y: this.height/randomFromRange(1, 5),
      id: rockId,
      inViewport: true
    });
  }

  moveRock({direction, id}) {
    console.log(this.rocks, id)
    let r = this.rocks.find(rock => rock.id === id);
    if (direction === 'UP') {
      r.y -= 20;
    } else {
      r.y += 20;
    }
  }

  willDestroy() {
    clearInterval(this.repaintLoop);
    this.socketHandler.socket.off('ROCK_ADDED', this.addRock);
    this.socketHandler.socket.off('ROCK_MOVED', this.moveRock);
  }
}
